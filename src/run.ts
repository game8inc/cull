import * as core from '@actions/core'
import {Octokit} from 'octokit'

type Props = {
  dryRun?: boolean
  owner: string
  repo: string
  token: string
  maxDeletionPerDay?: number
  olderThan?: number
}

export async function run({
  owner,
  repo,
  token,
  dryRun = true,
  maxDeletionPerDay = 3,
  olderThan = 10
}: Props): Promise<string[]> {
  const octokit = new Octokit({
    auth: token
  })
  async function getRawBranches() {
    const response = await octokit.rest.repos.listBranches({
      owner,
      repo
    })
    return response.data
  }

  async function getRawPullRequests() {
    const response = await octokit.rest.pulls.list({
      state: 'open',
      sort: 'updated',
      direction: 'asc',
      owner,
      repo
    })
    return response.data
  }

  type Awaited<T> = T extends PromiseLike<infer U> ? U : T
  type Unpacked<T> = T extends (infer U)[] ? U : T
  type BranchResponseType = Unpacked<Awaited<ReturnType<typeof getRawBranches>>>
  type PullRequestResponseType = Unpacked<
    Awaited<ReturnType<typeof getRawPullRequests>>
  >

  class Branch {
    private response: BranchResponseType
    private pullRequest: PullRequestResponseType | undefined
    private _lastCommitDate = 0 // getLastCommitDate()の結果をキャッシュするための変数。直接参照しないこと

    constructor(
      response: BranchResponseType,
      allPullRequestsResponse: PullRequestResponseType[]
    ) {
      this.response = response
      this.pullRequest = allPullRequestsResponse.find(pullRequest => {
        return pullRequest.head.ref === this.name
      })
    }

    private async getLastCommitDate() {
      // constructorでやると全ブランチ取得時にブランチの数だけ一斉に叩くことになり、ブランチ削除APIに叩く前にrate limitにかかりかねないので、
      // 削除APIと交互に呼べるように、個別にメソッドを呼ぶ
      return (async () => {
        if (this._lastCommitDate > 0) return this._lastCommitDate

        const response = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: this.response.commit.sha
        })
        const rawCommitDate = response.data.commit.author?.date
        if (rawCommitDate === undefined) {
          throw new Error('commit date is undefined') // 起きないと思うが型定義的にありえるので
        }
        this._lastCommitDate = Date.parse(rawCommitDate)
        return this._lastCommitDate
      })()
    }

    get protected() {
      return this.response.protected
    }

    get name() {
      return this.response.name
    }

    get isNewer() {
      return (async () => {
        const now = Date.now()
        const diff = now - (await this.getLastCommitDate())
        const days = diff / (1000 * 60 * 60 * 24)
        return days < olderThan
      })()
    }

    get hasOpenedPullRequest() {
      return (async () => {
        if (this.pullRequest === undefined) return false
        return this.pullRequest.state === 'open'
      })()
    }

    async destroy() {
      return (async () => {
        // eslint-disable-next-line no-console
        console.log({
          status: '[DELETING]',
          name: this.name,
          protected: this.protected,
          isNewer: await this.isNewer,
          hasOpenedPullRequest: await this.hasOpenedPullRequest
        })
        if (dryRun) return
        return await octokit.rest.git.deleteRef({
          owner,
          repo,
          ref: `heads/${this.name}`
        })
      })()
    }
  }

  async function getBranches() {
    const branchesResponse = await getRawBranches()
    const pullRequestsResponse = await getRawPullRequests()
    return branchesResponse.map(
      branch => new Branch(branch, pullRequestsResponse)
    )
  }

  let deleteCount = 0
  const deletedBranchNames: string[] = []
  try {
    const branches = await getBranches()
    for (const branch of branches) {
      if (deleteCount >= maxDeletionPerDay) continue
      if (branch.protected) continue
      if (await branch.isNewer) continue
      if (await branch.hasOpenedPullRequest) continue
      deleteCount++
      deletedBranchNames.push(branch.name)
      await branch.destroy()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
  return deletedBranchNames
}

if (require.main === module) {
  const owner = 'game8inc'
  const repo = 'cull'
  const token = process.env.LOCAL_GITHUB_TOKEN as string
  ;(async () => {
    await run({owner, repo, token})
  })()
}
