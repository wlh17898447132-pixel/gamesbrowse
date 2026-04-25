# GamesBrowse 第一阶段实施清单

## 1. 阶段目标

第一阶段的目标不是“把整站一次性改完”，而是完成结构重建，为后续多页化、SEO 扩展和 `iframe` 聚合接入打基础。

本阶段只做一件核心事情：

> 把当前单文件静态站，迁移成一个可扩展的多页站骨架。

完成后，项目应具备：

- 多页站目录结构
- 可复用布局和组件
- 游戏数据驱动的基础能力
- 原生游戏与 `iframe` 游戏的统一页面壳层
- 可继续迭代的部署结构

---

## 2. 本阶段范围

### 2.1 本阶段要做

- 初始化 Astro 项目结构
- 建立基础页面路由骨架
- 建立共享布局与 SEO 组件
- 建立游戏数据字段规范
- 抽离当前单页中的公共结构
- 为原生游戏和 `iframe` 游戏预留渲染分支
- 将现有 `Red Light Challenge` 迁移为第一份标准游戏数据样板

### 2.2 本阶段不做

- 不追求一次性上线大量新游戏
- 不在本阶段接入复杂后台
- 不在本阶段引入数据库
- 不在本阶段做完整广告系统
- 不在本阶段做复杂搜索功能
- 不在本阶段大规模接入第三方 `iframe` 游戏

说明：

第一阶段的重点是“结构正确”，不是“内容数量多”。

---

## 3. 交付结果

本阶段完成后，仓库中应至少出现以下成果：

- Astro 项目基础配置
- `src/pages` 多页结构
- `src/layouts` 布局层
- `src/components` 公共组件层
- `src/data/games` 游戏数据层
- `src/components/GameEmbedFrame.astro`
- `src/layouts/GameLayout.astro`
- 第一份标准游戏数据文件
- 第一版首页骨架
- 第一版游戏详情页模板

---

## 4. 实施清单

## 4.1 初始化项目骨架

任务：

- 新建 `package.json`
- 初始化 Astro 基础项目
- 建立 `astro.config.mjs`
- 建立 `src/` 与 `public/` 目录
- 明确构建输出方式，兼容当前 cloud 静态部署

输出：

- 可运行的 Astro 项目
- 本地可构建的静态产物

验收标准：

- `npm install` 正常
- `npm run dev` 能启动
- `npm run build` 能输出静态文件

---

## 4.2 建立目录结构

任务：

- 创建 `src/pages`
- 创建 `src/layouts`
- 创建 `src/components`
- 创建 `src/data/games`
- 创建 `src/scripts/games`
- 创建 `public/images`

建议目录：

```text
src/
  components/
  layouts/
  pages/
  data/
  scripts/
public/
  images/
```

验收标准：

- 目录职责清晰
- 页面、数据、脚本、静态资源分层明确

---

## 4.3 建立基础页面路由

第一阶段先搭壳，不要求所有页面内容完整。

任务：

- 建立首页路由 `/`
- 建立游戏列表页 `/games/`
- 建立游戏详情页模板 `/games/[slug]/`
- 建立分类页模板 `/categories/[slug]/`
- 预留基础信任页路由

建议页面文件：

```text
src/pages/index.astro
src/pages/games/index.astro
src/pages/games/[slug].astro
src/pages/categories/[slug].astro
src/pages/about.astro
src/pages/privacy-policy.astro
src/pages/terms.astro
src/pages/contact.astro
```

验收标准：

- 路由结构能跑通
- 至少首页和第一个游戏详情页可以访问

---

## 4.4 建立布局层

任务：

- 创建 `BaseLayout.astro`
- 创建 `GameLayout.astro`
- 统一页面头部、页脚、容器、全站样式入口
- 统一 meta 注入位置

目标：

- 任何页面都不再手写整页 HTML
- 游戏页有单独布局层，便于复用 SEO、正文区和游戏区结构

验收标准：

- 首页与游戏页共享统一外壳
- 页面布局切换不需要复制整页代码

---

## 4.5 建立公共组件

任务：

- 创建 `SEOHead.astro`
- 创建 `SiteHeader.astro`
- 创建 `SiteFooter.astro`
- 创建 `GameCard.astro`
- 创建 `GameEmbedFrame.astro`

组件职责：

- `SEOHead.astro`
  统一处理 `title`、`description`、canonical、OG、Twitter meta

- `SiteHeader.astro`
  统一站点导航

- `SiteFooter.astro`
  统一站点底部和基础链接

- `GameCard.astro`
  用于首页、列表页、分类页复用

- `GameEmbedFrame.astro`
  处理 `iframe` 游戏展示、比例适配、失败提示、来源说明

验收标准：

- 至少首页、游戏页都已使用组件化结构
- `iframe` 容器组件可被模板直接调用

---

## 4.6 建立游戏数据模型

任务：

- 定义统一的游戏数据字段
- 为当前游戏建立第一份数据文件
- 让路由模板从数据文件生成页面

建议最小字段：

- `slug`
- `title`
- `metaTitle`
- `metaDescription`
- `description`
- `category`
- `tags`
- `playMode`
- `thumbnail`
- `featured`

`iframe` 相关字段：

- `embedUrl`
- `sourceName`
- `sourceUrl`
- `licenseType`
- `embedAllowed`
- `orientation`
- `aspectRatio`
- `allowFullscreen`
- `iframeSandbox`
- `iframeAllow`

原生游戏相关字段：

- `scriptEntry`
- `controls`
- `instructions`
- `tips`
- `faq`

验收标准：

- 页面数据不再写死在模板里
- 增加一个游戏时，不需要复制整页 HTML

---

## 4.7 迁移现有 Red Light Challenge

任务：

- 提取当前页面中的 SEO 文案
- 提取当前页面中的玩法说明
- 提取当前页面中的 FAQ
- 提取当前页面中的游戏逻辑
- 将游戏逻辑迁移到 `src/scripts/games/red-light-challenge.js`
- 将游戏信息写入数据文件

目标：

- 让当前游戏成为新的模板样板

验收标准：

- `Red Light Challenge` 不再依赖单文件 `index.html`
- 页面内容与游戏逻辑分离

---

## 4.8 建立原生与 iframe 双渲染分支

任务：

- 在游戏详情页模板中根据 `playMode` 切换渲染方式
- `playMode = native` 时渲染原生游戏容器
- `playMode = iframe` 时渲染 `GameEmbedFrame`
- 对 `iframe` 模式提供失败兜底文案

目标：

- 架构从第一天就支持两种来源模式

验收标准：

- 同一套详情页模板可兼容两种模式
- 后续新增 `iframe` 游戏不需要重做页面模板

---

## 4.9 建立基础 SEO 骨架

任务：

- 将首页 SEO 与游戏页 SEO 模板化
- 统一生成 canonical
- 预留结构化数据注入位
- 将 `robots.txt` 与 `sitemap.xml` 纳入新结构考虑

第一阶段要求：

- 可以先保留简化版 sitemap 逻辑
- 但页面模板必须已经支持后续自动化扩展

验收标准：

- 首页和游戏页都具备独立 meta
- 不再依赖手写在单个 `index.html` 里的固定头信息

---

## 4.10 建立最小视觉统一层

任务：

- 提取全站基础色、间距、圆角、阴影等样式变量
- 建立全站统一容器与排版规则
- 不在第一阶段做大规模视觉重设计

目标：

- 先把视觉基础设施稳定下来
- 避免后续多页扩展时每页样式漂移

验收标准：

- 首页、列表页、详情页的基础视觉一致

---

## 5. 第一阶段建议执行顺序

建议按以下顺序落地：

1. 初始化 Astro 项目
2. 建立目录结构和基础路由
3. 建立布局层和 SEO 组件
4. 建立游戏数据模型
5. 迁移 `Red Light Challenge`
6. 建立 `playMode` 双分支渲染
7. 补齐首页和游戏详情页骨架
8. 进行本地构建与部署验证

---

## 6. 验收标准

第一阶段完成的最低验收线应是：

- 仓库已从单文件站迁移为 Astro 多页结构
- 当前游戏已成为标准详情页
- 新增游戏可以通过数据文件接入
- 页面模板可兼容 `native` 和 `iframe`
- 本地构建通过
- 部署结构与当前 cloud 平台兼容

如果还达不到以上几点，就不应进入第二阶段扩内容。

---

## 7. 风险点

第一阶段最需要注意的风险：

- 迁移时把现有页面 SEO 信息丢失
- 抽离游戏逻辑后出现交互回归
- 部署平台对子路径静态页面支持不完整
- `iframe` 模式只做表面支持，没有真正预留字段和组件
- 过早追求页面数量，导致基础结构没搭稳

---

## 8. 第二阶段的进入条件

只有在以下条件满足后，才建议进入第二阶段：

- `Red Light Challenge` 已成功迁移为标准游戏页
- 首页、列表页、详情页模板已经稳定
- 游戏数据字段已经定稿
- `iframe` 组件可工作
- 本地和线上部署流程已验证

---

## 9. 我建议的第一阶段实际产出

如果由我直接开始做代码，我会把第一阶段收敛成这些明确产出：

- 一个 Astro 多页项目骨架
- 一个新的首页骨架
- 一个 `/games/[slug]/` 标准模板
- 一个 `/games/` 列表页骨架
- 一个 `GameEmbedFrame.astro`
- 一个 `red-light-challenge` 标准数据样板
- 一个可运行的原生游戏接入样例
- 一个 `iframe` 游戏占位样例

这样第二阶段你就不是在“讨论方向”，而是在一个已经成型的框架上继续扩游戏。

---

## 10. 结论

第一阶段的核心不是“做更多页面”，而是先把项目从“单页成品”变成“可持续扩展的平台骨架”。

只要第一阶段做对了，后面不管你走：

- 自研小游戏
- 自托管 HTML5 包
- 第三方 `iframe` 聚合

都可以在同一套站点结构上继续往前推进。
