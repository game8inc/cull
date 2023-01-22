export const listBranches = [
  {
    name: 'protected',
    commit: {
      sha: 'protected',
      url: ''
    },
    protected: true
  },
  {
    name: 'feat/newer',
    commit: {
      sha: 'newer',
      url: ''
    },
    protected: false
  },
  {
    name: 'feat/old-with-opened-pull-request',
    commit: {
      sha: 'old_with_opened_pull_request',
      url: ''
    },
    protected: false
  },
  {
    name: 'feat/old-with-closed-pull-request-target',
    commit: {
      sha: 'old_with_closed_pull_request_target',
      url: ''
    },
    protected: false
  },
  {
    name: 'feat/old-target-x',
    commit: {
      sha: 'old_target_x',
      url: ''
    },
    protected: false
  },
  {
    name: 'feat/old-target-y',
    commit: {
      sha: 'old_target_y',
      url: ''
    },
    protected: false
  }
]

// gh api -H "Accept: application/vnd.github+json" /repos/game8inc/cull/pulls
// jq -r '[.[] | {head:{ref:.head.ref},state}]'
export const listPullRequests = [
  {
    head: {
      ref: 'feat/old-with-opened-pull-request'
    },
    state: 'open'
  },
  {
    head: {
      ref: 'feat/old-with-closed-pull-request-target'
    },
    state: 'closed'
  }
]

export const getCommits = {
  protected: {
    commit: {
      author: {
        date: '2000-01-01T00:00:00Z'
      }
    }
  },
  newer: {
    commit: {
      author: {
        date: new Date().toISOString()
      }
    }
  },
  old_with_opened_pull_request: {
    commit: {
      author: {
        date: '2000-01-01T00:00:00Z'
      }
    }
  },
  old_with_closed_pull_request_target: {
    commit: {
      author: {
        date: '2000-01-01T00:00:00Z'
      }
    }
  },
  old_target_x: {
    commit: {
      author: {
        date: '2000-01-01T00:00:00Z'
      }
    }
  },
  old_target_y: {
    commit: {
      author: {
        date: '2000-01-01T00:00:00Z'
      }
    }
  }
}
