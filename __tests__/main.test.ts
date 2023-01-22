import * as github from '@actions/github'
import {test} from '@jest/globals'
import {getCommits, listBranches, listPullRequests} from '../src/__mocks__/api'
import {main} from '../src/main'

jest.mock('@actions/github')
jest.mock('@actions/core', () => {
  const originalModule = jest.requireActual('@actions/core')
  return {
    __esModule: true,
    ...originalModule,
    getInput: (name: string) => {
      switch (name) {
        case 'repo-token':
          return 'whatever (responses is mocked)'
        case 'dry-run':
          return 'true'
        case 'older-than':
          return '10'
        case 'max-deletion-per-day':
          return '2'
      }
    }
  }
})

type GetCommitParams = {
  repo: string
  owner: string
  ref: keyof typeof getCommits
}
jest.mock('octokit', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          repos: {
            listBranches: jest.fn().mockReturnValue({data: listBranches}),
            getCommit: jest.fn(({ref}: GetCommitParams) => {
              return {data: getCommits[ref]}
            })
          },
          pulls: {
            list: jest.fn().mockReturnValue({data: listPullRequests})
          },
          git: {
            deleteRef: jest.fn().mockReturnValue({data: {}})
          }
        }
      }
    })
  }
})

describe('', () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    github.context = {
      repo: {
        owner: 'game8inc',
        repo: 'cull'
      },
      job: '',
      runId: 0,
      runNumber: 0,
      apiUrl: '',
      serverUrl: '',
      graphqlUrl: '',
      issue: {
        number: 0,
        owner: '',
        repo: ''
      },
      eventName: '',
      workflow: '',
      action: '',
      actor: '',
      payload: {},
      sha: '',
      ref: ''
    }
  })

  test('delete some branches', async () => {
    const result = await main()
    expect(result).toStrictEqual([
      '=== Rules ===',
      '1. Not too [MANY] deletion per day',
      '2. No recent [COMMITS]',
      '3. No related open [PR]',
      '4. Non-[PROTECTED] branch',
      '=== Skipped branches ===',
      '[PROTECTED]protected',
      '[COMMITS]feat/newer',
      '[PR]feat/old-with-opened-pull-request',
      '[MANY]feat/old-target-y',
      '=== Deleting branches ===',
      'feat/old-with-closed-pull-request-target',
      'feat/old-target-x'
    ])
  })
})
