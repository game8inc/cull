import * as core from '@actions/core'
import * as github from '@actions/github'
import {run} from './run'

export async function main(): Promise<string[]> {
  const {owner, repo} = github.context.repo
  const token = core.getInput('repo-token', {required: true})
  const dryRun =
    core.getInput('dry-run', {required: true}) !== 'false' ? true : false
  const olderThan = parseInt(core.getInput('older-than', {required: true}))
  const maxDeletionPerDay = parseInt(
    core.getInput('max-deletion-per-day', {required: true})
  )
  return await run({maxDeletionPerDay, olderThan, dryRun, owner, repo, token})
}
