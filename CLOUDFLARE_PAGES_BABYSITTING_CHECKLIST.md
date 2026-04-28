# GamesBrowse Cloudflare Pages 保姆级配置清单

这份文档用于把当前 `gamesbrowse` 仓库安全接到 Cloudflare Pages，并且先通过预览分支验证新的 Astro 多页站，不直接影响正式域名 `gamesbrowse.online`。

---

## 1. 当前推荐策略

当前最稳妥的方式不是直接发布生产，而是：

- 保持 `main` 作为当前生产分支
- 先使用预览分支 `preview-multipage-phase1`
- 先让 Cloudflare Pages 跑 preview deployment
- 预览确认没问题后，再决定是否切到生产

这样做的目的：

- 不直接影响正式域名
- 先验证 Astro 构建、路由、静态资源和子路径页面
- 降低迁移风险

---

## 2. 先确认你进的是正确的 Cloudflare Pages 项目

后台路径：

```text
Cloudflare Dashboard
> Workers & Pages
> 选择当前正在服务 gamesbrowse.online 的 Pages 项目
```

进入后，先确认两件事：

- 这个项目连接的 GitHub 仓库是 `wlh17898447132-pixel/gamesbrowse`
- 这个项目当前已经绑定了正式域名 `gamesbrowse.online`

现在不要做的事：

- 不要删除项目
- 不要删除域名
- 不要修改 DNS 指向别的服务
- 不要把 Production branch 改成 `preview-multipage-phase1`

---

## 3. 配置分支策略

后台路径：

```text
Settings
> Builds
> Branch control
```

重点看这两项：

### 3.1 Production branch

填：

```text
main
```

### 3.2 Preview branch

推荐两种方式：

方式 A：

```text
All non-production branches
```

方式 B：

```text
Custom branches
只允许：preview-multipage-phase1
```

当前更推荐方式 B，因为更稳，不会把其他临时分支也触发预览部署。

设置完成后点 `Save`。

说明：

- `main` 继续负责正式生产部署
- `preview-multipage-phase1` 只负责 preview deployment
- 这样当前线上站不会被新结构直接替换

---

## 4. 固定 Node 版本

后台路径：

```text
Settings
> Variables and Secrets
> Add variable
```

新增一个普通环境变量：

```text
Name: NODE_VERSION
Value: 22.16.0
```

建议：

- Preview 环境加一次
- Production 环境也加一次

为什么后台还要加：

- 仓库里虽然已经有 `.nvmrc`
- 也有 `.node-version`
- `package.json` 里也写了 `engines.node`
- 但 Cloudflare Pages 后台显式设置 `NODE_VERSION` 最稳，能减少构建环境漂移

---

## 5. 配置构建参数

如果后台能识别框架，优先选官方的 `Astro` preset。

后台路径通常类似：

```text
Settings
> Build & deployments
```

或者：

```text
Settings
> Builds
> Edit build configuration
```

按下面填写：

### 5.1 Framework preset

```text
Astro
```

### 5.2 Root directory

```text
/
```

如果后台允许留空，也可以保持仓库根目录。

### 5.3 Build command

```text
npm run build
```

### 5.4 Build output directory

```text
dist
```

保存后不要急着改生产分支。

---

## 6. 当前分支说明

当前我已经在仓库里创建并推送了这个预览分支：

```text
preview-multipage-phase1
```

它的用途是：

- 只用于 Cloudflare 预览部署
- 不直接影响 `main`
- 不直接影响 `gamesbrowse.online`

因此，你现在在 Cloudflare 里最重要的是：

- 允许这个分支产生 preview deployment
- 不要把它设置成 production branch

---

## 7. 触发 Preview Deployment

正常情况：

- 只要 Cloudflare Pages 已连接 GitHub 仓库
- 并且预览分支规则已生效
- `preview-multipage-phase1` 应该会生成 preview deployment

后台查看路径：

```text
Workers & Pages
> 你的项目
> Deployments
```

在这里找：

```text
preview-multipage-phase1
```

对应的部署记录。

---

## 8. 如果没有自动出现预览部署

有时候会遇到这种情况：

- 分支已经存在
- 但因为设置是在分支推送之后才改的
- Cloudflare 没有自动补触发

这时处理方式有两个：

### 方式 A

再向 `preview-multipage-phase1` 推一次新提交

### 方式 B

从 `preview-multipage-phase1` 向 `main` 发起一个 Pull Request

通常这样就会触发新的 preview deployment。

---

## 9. 预览部署成功后，先检查这些页面

拿到 preview URL 后，先逐个检查以下路径：

```text
/
/games/
/games/red-light-challenge/
/categories/reflex/
/about/
/privacy-policy/
/terms/
/contact/
```

这些是第一阶段的核心路由。

---

## 10. 同时检查这些静态资源

还要检查这些资源是否能直接访问：

```text
/robots.txt
/sitemap.xml
/favicon.svg
/scripts/games/red-light-challenge.js
/embeds/reflex-lab-demo.html
```

如果这些资源访问异常，通常说明：

- 构建产物目录不对
- 静态资源路径不对
- Cloudflare 不是在发布 `dist`

---

## 11. 预览阶段重点检查内容

### 11.1 路由检查

确认：

- 子路径能正常访问
- 手动刷新子页面不会 404
- 页面之间跳转正常

### 11.2 原生游戏检查

重点检查：

- `/games/red-light-challenge/`
- 游戏能正常启动
- 空格键操作正常
- 移动端按住按钮逻辑正常
- best score 可以写入浏览器本地存储

### 11.3 iframe 样例检查

重点检查：

- `/games/reflex-lab-demo/`
- iframe 能正常显示
- 比例是否正常
- Fullscreen 按钮是否工作
- source fallback 文案是否正常

### 11.4 SEO 基础检查

重点检查：

- title 是否正确
- canonical 是否正确
- robots 是否正常
- `noindex` 是否只用于内部验证页

---

## 12. 构建失败时去哪里看

后台路径：

```text
Deployments
> 点击失败的部署
> View details
> Build log
```

优先看这三类问题：

- Node 版本不对
- Build command 填错
- Build output directory 填错

如果你看到构建日志报错，不要急着改生产配置，先在 preview 里排完。

---

## 13. 当前线上站和新站的关系

当前仓库里仍然保留着旧版根目录 `index.html`。

这意味着：

- 在你还没有正式切换 Cloudflare Pages 构建流程之前
- 当前线上站不会因为这次代码改造自动被替换

真正会替换线上站的条件是：

- Cloudflare Pages 使用新的构建配置
- 并且生产分支部署成功

换句话说：

- 现在只是新结构已经准备好了
- 还没有强制替换线上站

---

## 14. 正式域名现在不要动

当前阶段不要去改：

```text
Custom domains
```

原因：

- Preview deployment 不会影响正式自定义域名
- 只要 production branch 还是 `main`
- `gamesbrowse.online` 就不会因为 preview 分支而切走

所以当前阶段：

- 先看 preview
- 不动正式域名

---

## 15. 如果你想做独立预览域名

如果后面你想给预览环境单独挂一个域名，例如：

```text
staging.gamesbrowse.online
```

可以后续再做。

建议顺序：

1. 先让 preview deployment 成功
2. 再在 Pages 项目中添加 `staging.gamesbrowse.online`
3. 通过 Cloudflare Pages 的域名绑定流程完成配置

当前阶段不建议先做这个，先把 preview 跑通更重要。

---

## 16. 什么时候再切生产

只有在以下内容确认都没问题后，才建议切生产：

- 首页正常
- `/games/` 正常
- `/games/red-light-challenge/` 正常
- `/categories/reflex/` 正常
- 原生游戏逻辑正常
- iframe 样例页正常
- 静态资源正常
- title / canonical / robots 没问题

确认通过后，再做其中一个动作：

### 方式 A

把 `preview-multipage-phase1` 合并到 `main`

### 方式 B

把未来准备上线的稳定分支作为生产分支部署

但目前最推荐还是：

```text
先预览，后合并 main
```

---

## 17. 如果正式上线后出问题，怎么回滚

后台路径：

```text
Deployments
> 找到之前成功的生产部署
> 点击三点菜单
> Rollback to this deployment
```

注意：

- 能直接回滚的是“成功的生产部署”
- 不是 preview deployment

所以生产切换前，最好确认旧的成功部署仍然存在。

---

## 18. 当前推荐填写值汇总

你现在在 Cloudflare Pages 中，核心就按这组值填写：

```text
Production branch: main
Preview branch: preview-multipage-phase1

Framework preset: Astro
Root directory: /
Build command: npm run build
Build output directory: dist

Environment variable:
NODE_VERSION=22.16.0
```

如果后台不支持单独指定一个 preview 分支，也可以使用：

```text
Preview branch: All non-production branches
```

---

## 19. 推荐的实际操作顺序

建议你严格按这个顺序做：

1. 进入现有的 Pages 项目
2. 确认 `Production branch = main`
3. 配置 preview 分支规则，让 `preview-multipage-phase1` 可以触发预览部署
4. 添加环境变量 `NODE_VERSION=22.16.0`
5. 检查构建配置是否为 `npm run build` 和 `dist`
6. 去 `Deployments` 页面找 preview deployment
7. 打开 preview URL
8. 检查页面、资源、原生游戏和 iframe 样例页
9. 全部确认通过后，再考虑是否合并进 `main`

---

## 20. 当前状态说明

当前我已经完成的部分：

- 预览分支已创建：`preview-multipage-phase1`
- 预览分支已推送到 GitHub
- Astro 多页站骨架已提交
- Cloudflare Pages 配置建议已经整理
- Node 版本已固定到 `22.16.0`

所以你现在只需要在 Cloudflare 后台按这份清单配置，就可以开始跑预览部署。
