# Google Search Console 提交步骤

适用网站：`https://gamesbrowse.online/`

本仓库已经部署了以下 Google 收录所需的技术文件：

- `https://gamesbrowse.online/robots.txt`
- `https://gamesbrowse.online/sitemap.xml`

当前 sitemap 只包含三个经过审核的页面：主页、发布情报页和编辑方法页。尚未验证的攻略不会进入 sitemap。

## 提交前确认

在浏览器无登录状态下分别打开以下地址，确认都能正常访问：

```text
https://gamesbrowse.online/
https://gamesbrowse.online/release-date/
https://gamesbrowse.online/sitemap.xml
https://gamesbrowse.online/robots.txt
```

不要把以前的 `/games/...`、`/category/...` 或 `/categories/...` 地址提交为新页面。这些旧目录会返回 `410 Gone`，表示旧游戏目录已经永久移除，这是预期行为。

## 第一步：添加域名资源

1. 登录 [Google Search Console](https://search.google.com/search-console/)。
2. 点击左上角的资源选择器，然后选择 **添加资源**。
3. 选择左侧的 **网域**，不要选择“网址前缀”。
4. 输入 `gamesbrowse.online`。
   - 不要输入 `https://`
   - 不要输入 `www.`
   - 不要在末尾添加 `/`
5. 点击继续。Google 会显示一条 DNS TXT 验证记录。

## 第二步：在 DNS 中验证所有权

1. 打开管理 `gamesbrowse.online` DNS 的服务商后台。若域名 DNS 托管在 Cloudflare，就在 Cloudflare 的 **DNS > Records** 中操作。
2. 新建一条记录：
   - 类型：`TXT`
   - 名称：按 DNS 服务商界面填写根域名，通常是 `@` 或留空
   - 内容：完整粘贴 Google 提供的 `google-site-verification=...` 内容
   - TTL：保持自动或默认值
3. 保存记录，回到 Search Console 点击 **验证**。
4. 如果暂时失败，等待几分钟后重试。DNS 生效有时需要更久。
5. 验证成功后，不要删除这条 TXT 记录，否则未来可能失去资源所有权。

## 第三步：提交 sitemap

1. 在 Search Console 左侧打开 **站点地图**。
2. 在“添加新的站点地图”中填写：

```text
https://gamesbrowse.online/sitemap.xml
```

如果输入框已经固定显示 `https://gamesbrowse.online/` 前缀，只填写：

```text
sitemap.xml
```

3. 点击 **提交**。
4. 状态显示“成功”或“已成功处理”后，Google 就能够发现 sitemap 中列出的页面。

提交 sitemap 是通知 Google 页面地址，不保证立刻收录。Google 仍会自行决定抓取和收录时间。

## 第四步：请求重点页面收录

依次使用顶部的 **网址检查** 工具检查：

```text
https://gamesbrowse.online/
https://gamesbrowse.online/release-date/
```

对每个页面执行：

1. 粘贴完整 URL 并回车。
2. 点击 **测试实际网址**。
3. 确认页面可抓取、可编入索引，并且规范网址是页面本身。
4. 点击 **请求编入索引**。

`/about/` 已在 sitemap 中，通常不需要单独请求。不要反复对同一地址提交请求，Search Console 对每日请求次数有限制。

## 提交后检查

- 在 Search Console 的 **站点地图** 报告中确认没有读取或解析错误。
- 在 **网页索引编制** 报告中观察已提交页面的状态。
- 首次提交后等待至少一周再判断是否异常；新站点的抓取与收录可能更慢。
- 旧游戏目录显示为已移除、未编入索引或 4xx，属于预期结果，不需要把它们跳转到首页。

## 后续发布攻略时

只有在攻略具备游戏版本、核验日期、可复现条件或原创截图、来源、风险和替代方案后，才新建攻略页面并把该 URL 加入 sitemap。提交后更新对应页面的 `lastmod` 日期，再在 Search Console 中重新检查即可。
