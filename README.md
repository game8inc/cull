<p align="center">
  <a href="https://github.com/game8inc/cull/actions"><img alt="typescript-action status" src="https://github.com/game8inc/cull/workflows/build-test/badge.svg"></a>
</p>

# Cull

Everyday, let Github Actions delete your branches such as:

- no recent commits
- no related pull requests
- non-protected branch

Stay clean and Happy coding 👍

## Usage

```yaml
name: Auto-delete abandoned branches every morning.

on:
  schedule:
    - cron: "30 1 * * *"

permissions:
  contents: write

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: game8inc/cull@v1
      with:
        repo-token: ${{ secrets.YOUR_GITHUB_TOKEN }}
        dry-run: 'true'
        older-than: '10'
        max-deletion-per-day: '5'
```

## Contribution

1. .node-versionに合わせてnodeをインストール（例：nodenvの場合）

    `nodenv install $(cat .node-version) && nodenv local $(cat .node-version)`

2. .envrc.exampleをコピーして.envrcを作成。自分のfine-grained Personal Access Tokenを生成して、LOCAL_GITHUB_TOKENをセットする

3. 以下のコマンドでローカルで実行できることを確認する

    ```bash
    npx ts-node src/run.ts
    ```

4. 以下のコマンドでローカルでテストがパスするまで確認

    ```bash
    npm install
    npm run build
    npm run package
    npm test
    ```
