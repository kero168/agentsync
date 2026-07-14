# agentsync

**一つの指示書を、すべてのAIコーディングアシスタントへ。常に同期された状態で。**

[![CI](https://github.com/kero168/agentsync/actions/workflows/ci.yml/badge.svg)](https://github.com/kero168/agentsync/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/agentsync-cli.svg)](https://www.npmjs.com/package/agentsync-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

English README is available at [README.md](./README.md).

## 課題

AIコーディングアシスタントはそれぞれ独自のプロジェクト設定ファイルを要求します。
Claude Code は `CLAUDE.md`、オープン標準の [AGENTS.md](https://agents.md) は
Codex系エージェントが利用、Cursor は `.cursor/rules/` 配下のルールファイル、
Gemini CLI は `GEMINI.md` を読み込みます。対象ツールは今後も増え続けます。
これらほぼ同内容のファイルを手で多重管理すると、誰か一つを更新した瞬間に
残りが古いまま取り残され、内容が乖離していきます。

## 解決策

agentsync は `agentsync.config.yaml` と `rules/` ディレクトリ内の
Markdown断片という**単一のソース**を保持し、そこからツールごとのファイルを
すべて生成します。`agentsync check` は乖離がないかを検証するので、
リンターと同じ感覚でCIに組み込んで強制できます。

```
agentsync.config.yaml  +  rules/*.md   ──build──►  CLAUDE.md
                                                     AGENTS.md
                                                     .cursor/rules/agentsync.mdc
                                                     GEMINI.md
```

完全にローカルで完結します。ネットワーク通信・テレメトリ・外部APIは一切なく、
agentsync は設定ファイルとルールファイルを読み込み、生成物を書き出すだけです。

## クイックスタート

```bash
npm install --save-dev agentsync-cli
npx agentsync init          # agentsync.config.yaml と rules/ の雛形を生成
npx agentsync build         # CLAUDE.md, AGENTS.md, Cursorルール, GEMINI.md を生成
npx agentsync check         # 生成物が乖離していれば exit 1（CI向け）
npx agentsync diff          # 何が変わるかを表示するだけ（書き込みなし）
```

詳しい手順は [docs/quickstart.md](./docs/quickstart.md)、動作する実例は
[examples/basic](./examples/basic) を参照してください。

## コマンド一覧

| コマンド | 内容 |
| --- | --- |
| `agentsync init [dir]` | `agentsync.config.yaml` と雛形の `rules/` ディレクトリを生成する |
| `agentsync build` | 設定とルールから有効な全ターゲットを描画し、ファイルに書き出す |
| `agentsync check` | メモリ上で再描画し、実ファイルと比較。乖離があれば `1` で終了（CI向け） |
| `agentsync diff` | `build` を実行した場合の差分を unified diff 風に表示（書き込みなし） |

4コマンドすべてが `-c, --config <path>`（設定ファイルの場所指定）と
`--only <ids>`（カンマ区切りのターゲットid指定、例: `--only claude,cursor`）
をサポートします。

## 対応ターゲット

| ターゲット | アダプターID | 出力先 | 形式 |
| --- | --- | --- | --- |
| Claude Code | `claude` | `CLAUDE.md` | Markdown |
| AGENTS.md 標準 | `agents` | `AGENTS.md` | Markdown（[agents.md](https://agents.md)） |
| Cursor | `cursor` | `.cursor/rules/agentsync.mdc` | Markdown + YAML frontmatter |
| Gemini CLI | `gemini` | `GEMINI.md` | Markdown |

新しいターゲットは小さな `TargetAdapter` インターフェースを実装し登録するだけで
追加できます。拡張ポイントと実装例は [ARCHITECTURE.md](./ARCHITECTURE.md) を
参照してください。

## 設定ファイル

```yaml
version: 1

project:
  name: my-project
  description: "このプロジェクトの全AIアシスタントで共有するコーディング規約。"

sources:
  rulesDir: rules

rulesOrder:            # 任意。列挙されていないファイルはアルファベット順で末尾に追加
  - 00-overview.md
  - 10-coding-style.md
  - 20-testing.md

targets:
  claude:
    enabled: true
    output: CLAUDE.md
  agents:
    enabled: true
    output: AGENTS.md
  cursor:
    enabled: true
    output: .cursor/rules/agentsync.mdc
  gemini:
    enabled: true
    output: GEMINI.md
```

ルール断片は普通のMarkdownファイルです。先頭の `# 見出し` は生成される各
ファイル内でそのままセクション見出しになります。見出しがない場合はファイル名
から見出しを自動生成します。

## CIでの利用

```yaml
# .github/workflows/ci.yml（抜粋）
- run: npx agentsync check
```

`agentsync check` は `CLAUDE.md` / `AGENTS.md` / Cursorルールファイル /
`GEMINI.md` のいずれかが `agentsync.config.yaml` + `rules/*.md` と一致しなく
なった瞬間に非ゼロ終了します。`prettier --check` や
`terraform plan -detailed-exitcode` と同じ「乖離検知」のパターンです。

## 類似ツールとの比較

[ruler](https://github.com/intellectronica/ruler) は「複数のAIコーディング
エージェント向けの指示を一元管理する」という近い課題に取り組んでいるツールで、
比較検討する価値があります。以下の表は各プロジェクトの公開ドキュメントに基づく
機能面での誠実な比較であり、この場から検証できない採用実績などの数値は含めて
いません。最終判断の前に、必ず各プロジェクト自身のリポジトリで最新の情報を
確認してください。

| | agentsync | ruler |
| --- | --- | --- |
| 単一ソース | `agentsync.config.yaml` + `rules/*.md` 断片 | 中央のルールディレクトリ |
| ターゲット形式 | プラガブルなアダプター方式（本リポジトリは4種を同梱） | 複数のエージェント形式に対応 |
| 乖離検知（`check`、CI用exit code） | あり。第一級のコマンド | 主眼ではない |
| 書き込み前の差分プレビュー | あり（`agentsync diff`） | バージョンにより異なる |
| ランタイム依存 | 最小限（`commander`, `yaml`, `picocolors`） | 上流の `package.json` を参照 |
| ネットワーク／テレメトリ | なし | 上流のドキュメントを参照 |
| ライセンス | MIT | 上流の `LICENSE` を参照 |

まだagentsyncが対応していないエージェント形式に依存している場合や、この表に
含まれない機能を重視する場合は、ruler（や他のツール）の方が現時点では適して
いるかもしれません。agentsyncのアダプター機構はそのギャップを時間とともに
埋められるよう設計されています。この表の誤りはPRで歓迎します。

## ロードマップ

[ROADMAP.md](./ROADMAP.md) を参照してください。

## コントリビュート

コントリビュートを歓迎します。詳しくは [CONTRIBUTING.md](./CONTRIBUTING.md) を、
また [行動規範](./CODE_OF_CONDUCT.md) もあわせてご確認ください。

## セキュリティ

脆弱性の報告方法は [SECURITY.md](./SECURITY.md) を参照してください。

## ライセンス

[MIT](./LICENSE) © 2026 kero168
