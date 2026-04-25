# GamesBrowse iframe 游戏接入规范

## 1. 目的

这份文档用于规范 `GamesBrowse` 未来通过 `iframe` 聚合第三方游戏的接入方式，确保新站架构在支持聚合能力的同时，兼顾：

- 技术可行性
- 页面一致性
- SEO 可用性
- 移动端体验
- 合规与版权风险控制

这份文档是 [UPGRADE_PLAN.md](</D:/gamesbrowse-files/gamesbrowse/UPGRADE_PLAN.md>) 的配套执行规范。

---

## 2. 接入模式定义

站点未来统一支持三种游戏接入模式：

- `native`
  说明：游戏逻辑和资源由本站维护，直接在本站页面运行。

- `iframe`
  说明：游戏来自第三方页面，通过 `iframe` 嵌入本站页面。

- `package`
  说明：游戏资源包由本站托管，但逻辑来自外部 HTML5 包或授权资源。

推荐原则：

- 能自研或自托管的优先 `native` / `package`
- 需要快速扩充内容时可接入 `iframe`
- `iframe` 只作为正式支持模式之一，不应成为无审核的随意嵌入方案

---

## 3. iframe 游戏适用场景

适合接入 `iframe` 的情况：

- 来源平台明确允许嵌入
- 游戏质量合格，适合站点定位
- 对方页面在桌面和移动端表现稳定
- 游戏加载速度可接受
- 没有明显版权风险或品牌风险

不适合接入 `iframe` 的情况：

- 对方站点未明确允许嵌入
- 页面设置了禁止嵌入的安全头
- 页面广告过多或跳转异常
- 内容与站点定位不符
- 来源不稳定，随时可能下线

---

## 4. 技术前置检查

每个待接入的 `iframe` 游戏，上线前至少检查以下内容。

### 4.1 是否允许嵌入

必须检查：

- `X-Frame-Options`
- `Content-Security-Policy` 中的 `frame-ancestors`

如果对方明确禁止嵌入，则不能纳入正式站点。

### 4.2 是否支持 HTTPS

必须满足：

- `embedUrl` 使用 `https`
- 不允许混合内容

### 4.3 响应式表现

必须确认：

- 桌面宽屏表现正常
- 移动端可用
- 横屏或竖屏模式明确
- 不会出现严重裁切、滚动条异常、不可操作区域

### 4.4 性能与稳定性

必须确认：

- 首次加载时间可接受
- 游戏资源不会频繁超时
- 页面不会持续报错
- 对方站点不会在嵌入后反复跳出新窗口

---

## 5. 数据字段标准

每个 `iframe` 游戏至少应包含以下数据字段。

```json
{
  "slug": "red-light-external",
  "title": "Red Light External",
  "metaTitle": "Play Red Light External Online | GamesBrowse",
  "metaDescription": "Play Red Light External online on GamesBrowse.",
  "category": "reflex",
  "tags": ["arcade", "reaction"],
  "playMode": "iframe",
  "embedUrl": "https://example.com/game",
  "sourceName": "Example Games",
  "sourceUrl": "https://example.com",
  "licenseType": "embed-permitted",
  "embedAllowed": true,
  "orientation": "landscape",
  "aspectRatio": "16:9",
  "allowFullscreen": true,
  "iframeSandbox": "allow-scripts allow-same-origin allow-pointer-lock",
  "iframeAllow": "fullscreen; autoplay; gamepad"
}
```

字段说明：

- `playMode`
  可选值：`native`、`iframe`、`package`

- `embedUrl`
  实际嵌入地址，必须是最终可访问地址

- `sourceName`
  来源平台或版权方名称

- `sourceUrl`
  来源主页或原始游戏页

- `licenseType`
  来源授权说明，例如：`owned`、`licensed`、`embed-permitted`

- `embedAllowed`
  是否已经确认允许嵌入

- `orientation`
  可选值建议：`landscape`、`portrait`

- `aspectRatio`
  游戏容器展示比例

- `allowFullscreen`
  是否允许前端提供全屏功能

- `iframeSandbox`
  `iframe sandbox` 属性值

- `iframeAllow`
  `iframe allow` 属性值

---

## 6. 页面模板要求

`iframe` 游戏不能只有一个嵌入框，必须有完整页面壳层。

每个 `iframe` 游戏详情页至少包含：

- 页面标题
- 页面描述
- 面包屑
- 游戏展示区域
- 游戏介绍
- 操作说明
- FAQ
- 相关推荐
- 来源说明
- 原站入口链接

额外建议：

- 游戏加载中占位态
- 嵌入失败提示
- “在原站打开”按钮
- 授权状态或来源标识

---

## 7. SEO 规范

`iframe` 游戏页仍然必须作为独立内容页建设，不能做成“只放个嵌入框”的薄内容页面。

每个 `iframe` 游戏页都必须有：

- 唯一 `title`
- 唯一 `meta description`
- `canonical`
- Open Graph / Twitter meta
- 至少一段清晰的游戏介绍
- 操作说明和玩法说明
- FAQ 或补充内容
- 内链到相关游戏或分类页

原则：

- `iframe` 只是承载方式，不是内容本身
- SEO 排名依赖的是页面整体内容和站点结构，不是 `iframe` 本身

---

## 8. 安全策略建议

本站需要对 `iframe` 保持最小权限原则。

### 8.1 前端属性建议

默认应优先限制：

- `sandbox`
- `referrerpolicy`
- `allowfullscreen`
- `loading="lazy"`

示例方向：

```html
<iframe
  src="https://example.com/game"
  loading="lazy"
  allow="fullscreen; autoplay; gamepad"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

### 8.2 站点 CSP

后续部署时，需要根据白名单来源配置 `Content-Security-Policy` 的 `frame-src`。

原则：

- 不要使用过宽的 `frame-src *`
- 仅允许白名单域名
- 新增来源必须走审核再加入白名单

---

## 9. 来源白名单机制

建议建立 `iframe` 来源白名单。

每个可接入来源至少记录：

- 来源域名
- 平台名称
- 是否允许嵌入
- 是否需要署名
- 是否需要原站跳转
- 风险等级
- 最近一次检查时间

白名单的目的：

- 防止随意嵌入未知来源
- 便于统一维护 CSP
- 便于后续定期巡检

---

## 10. 合规与版权审核

这是 `iframe` 聚合模式里最容易出问题的部分。

必须明确：

- 技术上能嵌入，不等于有权嵌入
- 页面能打开，不等于平台条款允许聚合展示
- 某些平台要求保留品牌、原链接或不允许商业使用

上线前应检查：

- 是否有明确嵌入许可
- 是否涉及版权归属争议
- 是否要求标注来源
- 是否要求保留原站链接
- 是否允许用于商业化站点

没有明确答案的来源，不建议正式上线。

---

## 11. 用户体验要求

`iframe` 游戏页的体验不能明显劣于原生游戏页。

建议要求：

- 游戏区域首屏可见
- 容器比例稳定，避免布局跳动
- 移动端支持横屏提示
- 加载失败时提供降级提示
- 提供“在原站打开”作为兜底

如果第三方嵌入体验明显差，应考虑：

- 放弃该来源
- 改用自托管包
- 找替代来源

---

## 12. 失败兜底策略

`iframe` 页面必须考虑第三方失效问题。

常见失效场景：

- 对方临时禁止嵌入
- 游戏链接失效
- 域名变更
- 对方服务超时
- 对方增加地区限制

建议兜底：

- 显示加载失败提示
- 提供原站入口
- 提供相似游戏推荐
- 后台维护“失效待检查”状态

---

## 13. 实施建议

在站点代码层面，建议这样落地：

- 游戏数据层统一加上 `playMode`
- 页面模板根据 `playMode` 决定渲染方式
- 单独封装 `GameEmbedFrame` 组件
- `iframe` 来源走白名单检查
- 部署时同步更新 `frame-src`

推荐组件职责：

- `GameEmbedFrame.astro`
  负责容器比例、加载态、失败态、来源说明和全屏能力

- `GameLayout.astro`
  负责统一 SEO、正文结构、相关推荐和 FAQ

---

## 14. 推荐执行顺序

建议按这个顺序推进：

1. 先确认站点整体架构采用原生 + `iframe` 混合模式
2. 设计游戏数据字段和来源白名单结构
3. 在多页站模板中加入 `playMode` 分支
4. 封装 `iframe` 通用组件
5. 用 1 个合法来源游戏做接入验证
6. 验证移动端、SEO、失败兜底和部署 CSP
7. 再批量扩展更多 `iframe` 游戏

---

## 15. 结论

`iframe` 聚合完全可以纳入 `GamesBrowse` 的新方案，而且应该从一开始就被当作正式架构能力来设计。

正确做法不是“后面再随便加 iframe”，而是：

- 提前定义字段
- 提前定义模板
- 提前定义白名单
- 提前定义合规审核流程

只有这样，新的多页游戏站方案才能真正同时适配：

- 自研原生小游戏
- 自托管 HTML5 游戏包
- 第三方 `iframe` 聚合游戏
