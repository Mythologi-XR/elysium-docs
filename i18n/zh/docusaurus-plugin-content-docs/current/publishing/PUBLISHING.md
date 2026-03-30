---
title: 发布与功能标志
draft: true
---

# 发布与功能标志 — 指南

**用于按需发布和取消发布文档支柱与章节的功能标志系统。**

> **关键相关文档**
> - **[docFlags.js](docFlags.js)** — 支柱和单个页面的主标志配置
> - **[sidebars.js](../../sidebars.js)** — 带有标志驱动过滤的侧边栏生成
> - **[docusaurus.config.js](../../docusaurus.config.js)** — 导航栏和 customFields 标志注入
> - **[FeatureFlag 组件](../../src/components/FeatureFlag/index.tsx)** — 用于内联章节切换的 React 组件

<br>

---
> **最新变更：** 初始指南——记录 ELYSIUM 文档的三层功能标志系统

  **v1.0.0** | *创建时间：2026-03-28 — [查看变更日志](#changelog)*

---

## 目录

- [概述](#overview)
- [目标代码库](#target-repos)
- [设计决策](#design-decisions)
- [架构](#architecture)
  - [标志配置层](#flag-config-layer)
  - [侧边栏过滤层](#sidebar-filter-layer)
  - [内联组件层](#inline-component-layer)
- [组件布局](#component-layout)
- [实施计划](#implementation-plan)
  - [发布或取消发布支柱](#publishing-or-unpublishing-a-pillar)
  - [发布或取消发布单个页面](#publishing-or-unpublishing-individual-pages)
  - [在页面内有条件地显示章节](#conditionally-showing-sections-within-a-page)
  - [添加新支柱](#adding-a-new-pillar)
- [关键文件参考](#critical-files-reference)
- [实施顺序](#implementation-sequence)
- [测试策略](#testing-strategy)
- [成功指标](#success-metrics)
- [文档支柱](#documentation-pillars)
- [变更日志](#changelog)

---

## 概述

ELYSIUM 文档站点使用功能标志系统来控制哪些内容对公众可见。这允许支柱（整个文档章节）和单个页面在不从代码库中删除内容的情况下被切换显示或隐藏。

该系统在三层中运行：

| 层 | 文件 | 目的 |
|-------|------|---------|
| **标志配置** | `docs/publishing/docFlags.js` | 支柱和单个页面的主切换开关 |
| **侧边栏过滤** | `sidebars.js` | 读取标志，从导航中隐藏未发布的支柱 |
| **内联组件** | `src/components/FeatureFlag/index.tsx` | 在任何 MDX 页面中有条件地渲染章节 |

### 取消发布支柱时会发生什么

- 其侧边栏分类从导航中**删除**
- 其导航栏下拉条目**删除**
- 支柱的索引页面在 frontmatter 中有 `draft: true`，因此从生产构建中**排除**
- 在本地开发环境（`npm start`）中，**所有内容仍然可访问**，无论标志如何——这允许你处理未发布的内容

---

## 目标代码库

| 代码库 | 角色 | 范围 |
|------|------|-------|
| `elysium-docs` | 文档站点 | 所有功能标志文件、侧边栏配置、Docusaurus 配置 |

---

## 设计决策

| # | 决策 | 理由 |
|---|----------|-----------|
| 1 | 单一 `docFlags.js` 配置文件 | 一个地方切换所有可见性——无需分散的 frontmatter 编辑 |
| 2 | 通过 `sidebars.js` 进行侧边栏过滤 | Docusaurus 原生支持有条件的侧边栏项目；无需自定义插件 |
| 3 | 未发布支柱索引页面上的 `draft: true` | Docusaurus 从生产构建中排除草稿页面，防止直接 URL 访问 |
| 4 | 用于内联章节的 `FeatureFlag` React 组件 | 允许在已发布页面内进行细粒度控制，无需将内容拆分为单独文件 |
| 5 | 注入到 `customFields` 中的标志 | 通过 `useDocusaurusContext()` 使 React 组件在客户端可用标志 |
| 6 | 开发模式显示所有内容 | 允许作者在本地处理未发布的内容，无需切换标志 |

---

## 架构

### 标志配置层

`docs/publishing/docFlags.js` 文件导出两个对象：

- **`pillars`** — 以支柱目录名为键的布尔标志。控制整个侧边栏章节。
- **`pages`** — 可选的以相对文档路径（不含 `.md`）为键的页面级覆盖。覆盖单个文档的支柱级标志。

两者都在构建时由 `sidebars.js` 和 `docusaurus.config.js` 使用。

### 侧边栏过滤层

`sidebars.js` 使用 `pillarCategory()` 辅助函数，该函数：

1. 检查 `docFlags.pillars` 中支柱的标志
2. 如果标志为 `false`（未发布），则返回 `null`
3. 如果标志为 `true`（已发布），则返回完整的侧边栏分类配置
4. 最终侧边栏数组调用 `.filter(Boolean)` 来去除空值

### 内联组件层

`<FeatureFlag>` React 组件从 `siteConfig.customFields.featureFlags`（由 `docusaurus.config.js` 注入）读取标志，并有条件地渲染其子元素。

**属性：**

| 属性 | 类型 | 是否必填 | 描述 |
|------|------|----------|-------------|
| `name` | `string` | 是 | 标志键——匹配 `docFlags.js` 支柱中的键 |
| `children` | `ReactNode` | 是 | 标志启用时显示的内容 |
| `fallback` | `ReactNode` | 否 | 标志禁用时显示的内容（默认：无） |

---

## 组件布局

```
elysium-docs/
├── docs/
│   ├── publishing/
│   │   ├── docFlags.js          # 主标志配置
│   │   └── PUBLISHING.md        # 本文件
│   ├── elysium-play/            # 支柱 1
│   ├── creation-app/            # 支柱 2
│   ├── portal/                  # 支柱 3
│   ├── geist-engine/            # 支柱 4
│   ├── elysium-x/               # 支柱 5
│   ├── wallet/                  # 支柱 6
│   ├── analytics/               # 支柱 7
│   ├── depin-network/           # 支柱 8
│   ├── reality-bridge/          # 支柱 9
│   ├── alpha-lab/               # 支柱 10
│   └── reference/               # 参考文档
├── src/
│   └── components/
│       └── FeatureFlag/
│           └── index.tsx         # 内联标志组件
├── sidebars.js                   # 读取 docFlags，过滤侧边栏
└── docusaurus.config.js          # 读取 docFlags，注入导航栏 + customFields
```

---

## 实施计划

### 发布或取消发布支柱

编辑 `docs/publishing/docFlags.js`，将支柱标志设置为 `true`（已发布）或 `false`（隐藏）：

```js
const pillars = {
  'elysium-play':     false,   // 从侧边栏隐藏
  'creation-app':     false,
  'portal':           false,
  'geist-engine':     false,
  'elysium-x':        false,
  'wallet':           false,
  'analytics':        false,
  'depin-network':    false,
  'reality-bridge':   false,
  'alpha-lab':        true,    // 在侧边栏中可见
  'reference':        true,
};
```

更改标志后：

1. **本地开发**（`npm start`）——重启开发服务器以应用更改
2. **生产环境**（`npm run build`）——重新构建并部署；未发布的支柱将从导航中排除

### 发布或取消发布单个页面

在 `docs/publishing/docFlags.js` 中使用 `pages` 对象进行页面级覆盖：

```js
const pages = {
  // 即使支柱未发布，也发布特定页面
  'portal/dashboard': true,

  // 即使支柱已发布，也隐藏特定页面
  'alpha-lab/card-designer/tips-and-troubleshooting': false,
};
```

页面键是相对于 `docs/` 的路径，不含 `.md` 扩展名。

### 在页面内有条件地显示章节

在任何 `.mdx` 文件中使用 `<FeatureFlag>` 组件：

```mdx
import FeatureFlag from '@site/src/components/FeatureFlag';

<FeatureFlag name="elysium-x">
  此内容仅在 `elysium-x` 标志启用时显示。
</FeatureFlag>

<FeatureFlag name="wallet" fallback={<p>即将推出。</p>}>
  详细的钱包文档。
</FeatureFlag>
```

### 添加新支柱

1. 在 `docs/` 下创建一个目录（例如，`docs/new-pillar/`）
2. 添加带有 frontmatter 的 `index.md`（如果从未发布状态开始，包含 `draft: true`）
3. 添加带有标签、位置和 slug 的 `_category_.json`
4. 在 `docs/publishing/docFlags.js` 的 `pillars` 下添加标志条目
5. 在 `sidebars.js` 中添加 `pillarCategory()` 调用
6. 可选择在 `docusaurus.config.js` 中使用 `navItemIf()` 添加导航栏条目

---

## 关键文件参考

| 文件 | 操作 | 目的 |
|------|--------|---------|
| `docs/publishing/docFlags.js` | 编辑 | 切换支柱和页面可见性 |
| `sidebars.js` | 编辑（添加支柱时） | 为新支柱添加 `pillarCategory()` 调用 |
| `docusaurus.config.js` | 编辑（添加支柱时） | 为导航栏条目添加 `navItemIf()` 调用 |
| `src/components/FeatureFlag/index.tsx` | 在 MDX 中使用 | 导入并包裹有条件的内容 |
| `docs/[pillar]/index.md` | 创建 | 支柱落地页，未发布时含 `draft: true` |
| `docs/[pillar]/_category_.json` | 创建 | 支柱的侧边栏标签、位置和 slug |

---

## 实施顺序

| 步骤 | 交付物 | 依赖项 | 范围 |
|------|-------------|--------------|-------|
| 1 | 创建支柱目录和 `index.md` | 无 | 新目录 + 文件 |
| 2 | 创建 `_category_.json` | 步骤 1 | 新文件 |
| 3 | 将标志添加到 `docFlags.js` | 步骤 1 | 单行编辑 |
| 4 | 将 `pillarCategory()` 添加到 `sidebars.js` | 步骤 3 | 单行编辑 |
| 5 | 将 `navItemIf()` 添加到 `docusaurus.config.js`（可选） | 步骤 3 | 单行编辑 |
| 6 | 重新构建并验证 | 步骤 1-5 | `npm run build` |

---

## 测试策略

1. **关闭标志** — 验证支柱在生产构建中从侧边栏和导航栏消失（`npm run build && npm run serve`）
2. **开启标志** — 验证支柱出现在侧边栏和导航栏中，并且所有页面均可访问
3. **开发模式可见性** — 运行 `npm start` 并确认所有内容（包括未发布的）在创作时均可访问
4. **页面级覆盖** — 在 `docFlags.js` 中添加页面覆盖，重新构建，并验证只有该页面受到影响
5. **内联 `<FeatureFlag>`** — 将组件添加到 MDX 页面，切换标志，并验证内容出现/消失
6. **损坏链接检查** — 切换后，运行 `npm run build` 并确认没有损坏的链接错误

---

## 成功指标

| 指标 | 目标 |
|--------|--------|
| 支柱切换延迟 | 标志更改 + 重建 < 30 秒 |
| 零损坏链接 | `npm run build` 无损坏链接错误退出 |
| 开发模式完整性 | 无论标志如何，所有 10 个支柱在 `npm start` 中均可见 |
| 生产排除 | 未发布的支柱在 `build/` 输出中有零个页面 |

---

## 文档支柱

| # | 支柱 | 目录 | 描述 |
|---|--------|-----------|-------------|
| 1 | ELYSIUM PLAY | `docs/elysium-play/` | 跨平台游玩与探索 |
| 2 | ELYSIUM Creation App | `docs/creation-app/` | 现场 AR 创作与账户管理 |
| 3 | ELYSIUM Portal | `docs/portal/` | Web 应用、仪表板和玩家中心 |
| 4 | GEIST Engine | `docs/geist-engine/` | AR 及更多领域的交互引擎 |
| 5 | ELYSIUM X | `docs/elysium-x/` | 自助式储备关联忠诚度系统 |
| 6 | ELYSIUM Wallet | `docs/wallet/` | 生态系统身份层（EIS-Wallet） |
| 7 | ELYSIUM Analytics | `docs/analytics/` | 适合 AI 的实时行为分析 |
| 8 | ELYSIUM DePIN Network | `docs/depin-network/` | 联邦系统即平台 |
| 9 | REALITY BRIDGE | `docs/reality-bridge/` | 硬件基础设施模块 |
| 10 | ALPHA Lab | `docs/alpha-lab/` | 实验性功能与创意工具 |

---

## 变更日志

| 版本 | 日期 | 作者 | 描述 |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-28 | Claude | 初始指南——记录 ELYSIUM 文档发布的三层功能标志系统 |

---

*文档版本：1.0.0*
*最后更新：2026-03-28*
*状态：已实施*
