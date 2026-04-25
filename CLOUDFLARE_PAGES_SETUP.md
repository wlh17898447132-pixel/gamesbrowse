# GamesBrowse Cloudflare Pages 配置清单

这份文档对应当前第一阶段的 Astro 多页站骨架，用于把仓库安全接到 Cloudflare Pages，同时避免直接影响现有生产域名。

## 1. 当前推荐策略

当前建议：

- 生产分支暂时保留 `main`
- 先使用预览分支 `preview-multipage-phase1`
- 先看 Cloudflare Preview Deployment 是否正常
- 预览确认无误后，再决定是否合并进 `main`

这样做的目的：

- 不直接影响当前 `gamesbrowse.online`
- 先验证 Astro 构建、路由、静态资源和子路径页面
- 降低切换风险

---

## 2. 仓库当前需要 Cloudflare 识别的核心配置

当前仓库已经具备这些构建前提：

- Node 版本固定：`.nvmrc`
- Node 版本固定：`.node-version`
- `package.json` 中声明 `engines.node = 22.16.0`
- 构建命令：`npm run build`
- 构建输出目录：`dist`

推荐在 Cloudflare Pages 中也显式使用同一版本：

- `NODE_VERSION=22.16.0`

---

## 3. Cloudflare Pages 后台配置

如果你在 Cloudflare Pages 中连接这个 GitHub 仓库，建议这样填写。

### 3.1 Framework preset

可选方案：

- 如果后台能识别 Astro，直接选 `Astro`
- 如果你想完全手动控制，也可以选 `None`

当前推荐：

- 选 `Astro`

### 3.2 Build command

```text
npm run build
```

### 3.3 Build output directory

```text
dist
```

### 3.4 Root directory

```text
/
```

如果后台允许留空，保持仓库根目录即可。

### 3.5 Environment variables

至少加这一项：

```text
NODE_VERSION = 22.16.0
```

如果你后面需要区分环境，还可以补：

```text
NODE_ENV = production
```

但当前不是必须。

---

## 4. 分支策略

### 4.1 当前建议分支

当前我已经在本地创建了预览分支：

```text
preview-multipage-phase1
```

建议用途：

- `main`
  当前生产基线

- `preview-multipage-phase1`
  新 Astro 多页站预览分支

### 4.2 推荐工作流

1. 先把 `preview-multipage-phase1` 推到 GitHub
2. 让 Cloudflare Pages 自动生成 preview deployment
3. 检查预览地址是否正常
4. 通过后，再考虑合并到 `main`

---

## 5. 预览阶段重点检查页面

Preview Deployment 成功后，先检查这些页面：

- `/`
- `/games/`
- `/games/red-light-challenge/`
- `/categories/reflex/`
- `/about/`
- `/privacy-policy/`
- `/terms/`
- `/contact/`

还要检查这些静态资源：

- `/robots.txt`
- `/sitemap.xml`
- `/favicon.svg`
- `/scripts/games/red-light-challenge.js`
- `/embeds/reflex-lab-demo.html`

---

## 6. 预览阶段重点检查内容

### 6.1 路由

确认：

- 子路径能正常访问
- 直接刷新子页面不会 404
- 页面之间跳转正常

### 6.2 原生游戏页

确认：

- `Red Light Challenge` 能正常启动
- 空格键和触控操作正常
- best score 正常写入本地存储

### 6.3 iframe 样例页

确认：

- `/games/reflex-lab-demo/` 能正常打开
- iframe 比例正常
- fullscreen 按钮工作正常
- source fallback 文案显示正常

### 6.4 SEO 基础

确认：

- 页面 title 正确
- canonical 正确
- robots 没误配
- noindex 只用于内部验证页

---

## 7. 与当前线上站的关系

当前仓库里仍保留旧版根目录 `index.html`。

这意味着：

- 如果你还没有让 Cloudflare Pages 切到 Astro 构建流程，现有老站逻辑不会被这次改动直接替换
- 一旦 Cloudflare Pages 使用 `npm run build` 并发布 `dist`，线上首页将由新的 `dist/index.html` 接管

换句话说：

- 现在代码已经准备好新结构
- 是否真正替换线上站，取决于你在 Cloudflare Pages 的构建配置和部署分支

---

## 8. 当前已知环境说明

本地验证时出现过一个特殊情况：

- 在当前 Windows + Node 24 环境里，Astro 构建完成后进程尾部触发断言
- 但静态页面实际上已经成功生成到 `dist`

因此当前策略是：

- 项目层面固定到 `Node 22.16.0`
- Cloudflare Pages 也显式使用 `NODE_VERSION=22.16.0`

这样能最大程度减少环境差异。

---

## 9. 推荐的 Cloudflare 设置结论

如果你现在就要开始 Cloudflare 预览部署，直接按下面填：

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
Environment variable:
  NODE_VERSION=22.16.0
```

并且：

```text
Preview branch: preview-multipage-phase1
Production branch: main
```

---

## 10. 推荐下一步

建议你下一步按这个顺序操作：

1. 把本地分支 `preview-multipage-phase1` 推到 GitHub
2. 在 Cloudflare Pages 中确认 `NODE_VERSION=22.16.0`
3. 让 Cloudflare 跑 preview deployment
4. 把 preview 链接发给我
5. 我继续帮你检查页面、资源、游戏交互和 SEO 头信息
