---
title: 公開とフィーチャーフラグ
draft: true
---

# 公開とフィーチャーフラグ — ガイド

**ドキュメントのピラーとセクションを任意のタイミングで公開・非公開にするためのフィーチャーフラグシステム。**

> **主要な関連ドキュメント**
> - **[docFlags.js](docFlags.js)** — ピラーと個別ページのマスタートグル設定
> - **[sidebars.js](../../sidebars.js)** — フラグによるフィルタリングを使用したサイドバー生成
> - **[docusaurus.config.js](../../docusaurus.config.js)** — ナビバーとカスタムフィールドへのフラグ注入
> - **[FeatureFlag コンポーネント](../../src/components/FeatureFlag/index.tsx)** — インラインセクションの切り替えのための React コンポーネント

<br>

---
> **最新の変更：** 初回ガイド — ELYSIUM ドキュメントの 3 層フィーチャーフラグシステムのドキュメント化

  **v1.0.0** | *作成日：2026-03-28 — [変更履歴を見る](#changelog)*

---

## 目次

- [概要](#overview)
- [対象リポジトリ](#target-repos)
- [設計上の決定事項](#design-decisions)
- [アーキテクチャ](#architecture)
  - [フラグ設定レイヤー](#flag-config-layer)
  - [サイドバーフィルターレイヤー](#sidebar-filter-layer)
  - [インラインコンポーネントレイヤー](#inline-component-layer)
- [コンポーネントレイアウト](#component-layout)
- [実装計画](#implementation-plan)
  - [ピラーの公開または非公開](#publishing-or-unpublishing-a-pillar)
  - [個別ページの公開または非公開](#publishing-or-unpublishing-individual-pages)
  - [ページ内でのセクションの条件付き表示](#conditionally-showing-sections-within-a-page)
  - [新しいピラーの追加](#adding-a-new-pillar)
- [重要ファイルリファレンス](#critical-files-reference)
- [実装シーケンス](#implementation-sequence)
- [テスト戦略](#testing-strategy)
- [成功指標](#success-metrics)
- [ドキュメントピラー](#documentation-pillars)
- [変更履歴](#changelog)

---

## 概要

ELYSIUM ドキュメントサイトでは、フィーチャーフラグシステムを使用して公開するコンテンツを制御しています。これにより、ピラー（ドキュメントセクション全体）と個別ページを、リポジトリからコンテンツを削除することなくオン・オフに切り替えることができます。

システムは 3 つのレイヤーで動作します：

| レイヤー | ファイル | 用途 |
|--------|---------|------|
| **フラグ設定** | `docs/publishing/docFlags.js` | ピラーと個別ページのマスタートグル |
| **サイドバーフィルター** | `sidebars.js` | フラグを読み取り、非公開ピラーをナビゲーションから非表示にする |
| **インラインコンポーネント** | `src/components/FeatureFlag/index.tsx` | MDX ページ内のセクションを条件付きでレンダリング |

### ピラーが非公開の場合の動作

- そのサイドバーカテゴリーがナビゲーションから**削除**されます
- そのナビバードロップダウンエントリーが**削除**されます
- ピラーのインデックスページのフロントマターに `draft: true` が含まれており、**本番ビルドから除外**されます
- ローカル開発環境（`npm start`）では、フラグに関わらず**すべてのコンテンツに引き続きアクセス可能**です — これにより非公開コンテンツの作業が可能になります

---

## 対象リポジトリ

| リポジトリ | 役割 | スコープ |
|---------|------|--------|
| `elysium-docs` | ドキュメントサイト | すべてのフィーチャーフラグファイル、サイドバー設定、Docusaurus 設定 |

---

## 設計上の決定事項

| # | 決定事項 | 理由 |
|---|---------|------|
| 1 | 単一の `docFlags.js` 設定ファイル | すべての可視性を一箇所でトグル — フロントマターの編集を分散させない |
| 2 | `sidebars.js` によるサイドバーフィルタリング | Docusaurus はネイティブで条件付きサイドバーアイテムをサポート；カスタムプラグイン不要 |
| 3 | 非公開ピラーインデックスページへの `draft: true` | Docusaurus は本番ビルドから下書きページを除外し、直接 URL アクセスを防ぐ |
| 4 | インラインセクション用の `FeatureFlag` React コンポーネント | コンテンツを個別のファイルに分割することなく、公開ページ内での詳細な制御が可能 |
| 5 | `customFields` へのフラグ注入 | `useDocusaurusContext()` を通じて React コンポーネントがクライアントサイドでフラグにアクセス可能にする |
| 6 | 開発モードですべてのコンテンツを表示 | フラグを切り替えることなく、ローカルで非公開コンテンツの作業が可能 |

---

## アーキテクチャ

### フラグ設定レイヤー

`docs/publishing/docFlags.js` ファイルは 2 つのオブジェクトをエクスポートします：

- **`pillars`** — ピラーディレクトリ名をキーとするブール値フラグ。サイドバーセクション全体を制御します。
- **`pages`** — ドキュメントの相対パス（`.md` なし）をキーとするオプションのページレベルオーバーライド。個別ドキュメントのピラーレベルフラグをオーバーライドします。

両方はビルド時に `sidebars.js` と `docusaurus.config.js` によって使用されます。

### サイドバーフィルターレイヤー

`sidebars.js` は以下を行う `pillarCategory()` ヘルパー関数を使用します：

1. `docFlags.pillars` でピラーのフラグを確認
2. フラグが `false`（非公開）の場合は `null` を返す
3. `true`（公開）の場合は完全なサイドバーカテゴリー設定を返す
4. 最終的なサイドバー配列は `.filter(Boolean)` を呼び出して null を除去

### インラインコンポーネントレイヤー

`<FeatureFlag>` React コンポーネントは `siteConfig.customFields.featureFlags`（`docusaurus.config.js` によって注入）からフラグを読み取り、その子コンポーネントを条件付きでレンダリングします。

**プロパティ：**

| プロパティ | 型 | 必須 | 説明 |
|---------|---|------|-----|
| `name` | `string` | はい | フラグキー — `docFlags.js` のピラーのキーと一致 |
| `children` | `ReactNode` | はい | フラグが有効な場合に表示されるコンテンツ |
| `fallback` | `ReactNode` | いいえ | フラグが無効な場合に表示されるコンテンツ（デフォルト：なし） |

---

## コンポーネントレイアウト

```
elysium-docs/
├── docs/
│   ├── publishing/
│   │   ├── docFlags.js          # マスターフラグ設定
│   │   └── PUBLISHING.md        # このファイル
│   ├── elysium-play/            # ピラー 1
│   ├── creation-app/            # ピラー 2
│   ├── portal/                  # ピラー 3
│   ├── geist-engine/            # ピラー 4
│   ├── elysium-x/               # ピラー 5
│   ├── wallet/                  # ピラー 6
│   ├── analytics/               # ピラー 7
│   ├── depin-network/           # ピラー 8
│   ├── reality-bridge/          # ピラー 9
│   ├── alpha-lab/               # ピラー 10
│   └── reference/               # リファレンスドキュメント
├── src/
│   └── components/
│       └── FeatureFlag/
│           └── index.tsx         # インラインフラグコンポーネント
├── sidebars.js                   # docFlags を読み取り、サイドバーをフィルタリング
└── docusaurus.config.js          # docFlags を読み取り、ナビバー + カスタムフィールドに注入
```

---

## 実装計画

### ピラーの公開または非公開

`docs/publishing/docFlags.js` を編集して、ピラーフラグを `true`（公開）または `false`（非表示）に設定します：

```js
const pillars = {
  'elysium-play':     false,   // サイドバーから非表示
  'creation-app':     false,
  'portal':           false,
  'geist-engine':     false,
  'elysium-x':        false,
  'wallet':           false,
  'analytics':        false,
  'depin-network':    false,
  'reality-bridge':   false,
  'alpha-lab':        true,    // サイドバーに表示
  'reference':        true,
};
```

フラグを変更した後：

1. **ローカル開発**（`npm start`）— 変更を反映するために開発サーバーを再起動
2. **本番環境**（`npm run build`）— 再ビルドしてデプロイ；非公開ピラーはナビゲーションから除外

### 個別ページの公開または非公開

ページレベルのオーバーライドには `docs/publishing/docFlags.js` の `pages` オブジェクトを使用します：

```js
const pages = {
  // ピラーが非公開でも特定のページを公開
  'portal/dashboard': true,

  // ピラーが公開でも特定のページを非表示
  'alpha-lab/card-designer/tips-and-troubleshooting': false,
};
```

ページキーは `docs/` からの相対パスで、`.md` 拡張子なし。

### ページ内でのセクションの条件付き表示

任意の `.mdx` ファイルで `<FeatureFlag>` コンポーネントを使用します：

```mdx
import FeatureFlag from '@site/src/components/FeatureFlag';

<FeatureFlag name="elysium-x">
  このコンテンツは `elysium-x` フラグが有効な場合のみ表示されます。
</FeatureFlag>

<FeatureFlag name="wallet" fallback={<p>近日公開予定。</p>}>
  ウォレットの詳細なドキュメントはここに記載します。
</FeatureFlag>
```

### 新しいピラーの追加

1. `docs/` の下にディレクトリを作成します（例：`docs/new-pillar/`）
2. フロントマター付きの `index.md` を追加します（非公開で開始する場合は `draft: true` を含める）
3. ラベル、位置、スラッグを含む `_category_.json` を追加します
4. `docs/publishing/docFlags.js` の `pillars` にフラグエントリーを追加します
5. `sidebars.js` に `pillarCategory()` 呼び出しを追加します
6. オプションで `navItemIf()` を使用して `docusaurus.config.js` にナビバーエントリーを追加します

---

## 重要ファイルリファレンス

| ファイル | アクション | 用途 |
|--------|---------|------|
| `docs/publishing/docFlags.js` | 編集 | ピラーとページの可視性をトグル |
| `sidebars.js` | 編集（ピラーを追加する場合） | 新しいピラーの `pillarCategory()` 呼び出しを追加 |
| `docusaurus.config.js` | 編集（ピラーを追加する場合） | ナビバーエントリーの `navItemIf()` 呼び出しを追加 |
| `src/components/FeatureFlag/index.tsx` | MDX で使用 | インポートして条件付きコンテンツをラップ |
| `docs/[pillar]/index.md` | 作成 | 非公開の場合は `draft: true` を含むピラーランディングページ |
| `docs/[pillar]/_category_.json` | 作成 | ピラーのサイドバーラベル、位置、スラッグ |

---

## 実装シーケンス

| ステップ | 成果物 | 依存関係 | スコープ |
|--------|-------|---------|--------|
| 1 | ピラーディレクトリと `index.md` の作成 | なし | 新しいディレクトリ + ファイル |
| 2 | `_category_.json` の作成 | ステップ 1 | 新しいファイル |
| 3 | `docFlags.js` にフラグを追加 | ステップ 1 | 1 行の編集 |
| 4 | `sidebars.js` に `pillarCategory()` を追加 | ステップ 3 | 1 行の編集 |
| 5 | オプションで `docusaurus.config.js` に `navItemIf()` を追加 | ステップ 3 | 1 行の編集 |
| 6 | 再ビルドして確認 | ステップ 1-5 | `npm run build` |

---

## テスト戦略

1. **フラグをオフにする** — 本番ビルド（`npm run build && npm run serve`）でピラーがサイドバーとナビバーから消えることを確認
2. **フラグをオンにする** — ピラーがサイドバーとナビバーに表示され、すべてのページにアクセス可能であることを確認
3. **開発モードの可視性** — `npm start` を実行して、すべてのコンテンツ（非公開のものを含む）がオーサリング目的でアクセス可能であることを確認
4. **ページレベルオーバーライド** — `docFlags.js` にページオーバーライドを追加して再ビルドし、そのページのみが影響を受けることを確認
5. **インライン `<FeatureFlag>`** — コンポーネントを MDX ページに追加してフラグをトグルし、コンテンツが表示・非表示になることを確認
6. **壊れたリンクの確認** — トグル後に `npm run build` を実行し、壊れたリンクエラーがないことを確認

---

## 成功指標

| 指標 | 目標 |
|------|------|
| ピラートグルのレイテンシ | フラグ変更 + 再ビルドが 30 秒以内 |
| 壊れたリンクゼロ | `npm run build` が壊れたリンクエラーなしで完了 |
| 開発モードの完全性 | フラグに関わらず `npm start` で全 10 ピラーが表示される |
| 本番環境からの除外 | 非公開ピラーが `build/` 出力にページを持たない |

---

## ドキュメントピラー

| # | ピラー | ディレクトリ | 説明 |
|---|--------|-----------|-----|
| 1 | ELYSIUM PLAY | `docs/elysium-play/` | クロスプラットフォームプレイとディスカバリー |
| 2 | ELYSIUM Creation App | `docs/creation-app/` | 現場での AR 制作とアカウント管理 |
| 3 | ELYSIUM Portal | `docs/portal/` | ウェブアプリ、ダッシュボード、プレイヤーハブ |
| 4 | GEIST Engine | `docs/geist-engine/` | AR とその先のためのインタラクションエンジン |
| 5 | ELYSIUM X | `docs/elysium-x/` | セルフサービスのリザーブ連動ロイヤルティシステム |
| 6 | ELYSIUM Wallet | `docs/wallet/` | エコシステムアイデンティティレイヤー（EIS-Wallet） |
| 7 | ELYSIUM Analytics | `docs/analytics/` | AI 向けリアルタイム行動分析 |
| 8 | ELYSIUM DePIN ネットワーク | `docs/depin-network/` | プラットフォームとしてのフェデレーテッドシステム |
| 9 | REALITY BRIDGE | `docs/reality-bridge/` | ハードウェアインフラモジュール |
| 10 | ALPHA Lab | `docs/alpha-lab/` | 実験的な機能とクリエイティブツール |

---

## 変更履歴

| バージョン | 日付 | 作成者 | 説明 |
|----------|------|-------|-----|
| 1.0.0 | 2026-03-28 | Claude | 初回ガイド — ELYSIUM ドキュメント公開の 3 層フィーチャーフラグシステムのドキュメント化 |

---

*ドキュメントバージョン：1.0.0*
*最終更新：2026-03-28*
*ステータス：実装済み*
