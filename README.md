# 凿研岩土 ZYYT 官网（可直接发布的静态版本）

本目录是**可直接上传到 GitHub 并发布**的网站。前台为纯静态文件，无需后端即可在
GitHub Pages 等任意静态主机上运行；后台管理（`admin/`）需在带 Node 后端的平台上部署。

## 目录结构

```
发布网站/
├── index.html            # 首页
├── about.html            # 关于
├── contact.html          # 联系
├── news.html             # 公司新闻列表
├── insights.html         # 行业洞察列表
├── news-detail.html      # 新闻详情（?id=）
├── insight-detail.html   # 洞察详情（?id=）
├── css/main.css          # 样式
├── js/                   # 全部脚本（i18n / content / api / common / home / ...）
├── images/               # logo + 现场照片
├── data/posts.json       # 新闻/洞察内容（静态数据，前台直接读取）
├── admin/index.html      # 后台管理页面
├── server.js             # 可选：Node 后端（提供后台写入/鉴权，仅 Node 部署需要）
├── package.json
├── manifest.webmanifest  # PWA/站点清单
├── robots.txt
├── .nojekyll             # 让 GitHub Pages 原样发布（不跑 Jekyll）
└── .gitignore
```

## 两种发布方式

### 方式 A：GitHub Pages（纯静态，推荐先用这个）

1. 在 GitHub 新建仓库（例如 `zyyt-website`）。
2. 把本目录**全部内容**推送到仓库（保留 `index.html` 在根目录）。
3. 仓库 → Settings → Pages → Source 选择 **Deploy from a branch** → 分支 `main`，目录 **/ (root)**。
4. 等待 1–2 分钟，访问 `https://<用户名>.github.io/zyyt-website/`。

说明：
- 前台页面、新闻/洞察列表与详情、语言切换、SEO 元数据**全部正常运行**，因为内容来自静态
  `data/posts.json`（相对路径读取，兼容 GitHub Pages 子路径）。
- `admin/` 后台页面会正常打开，但**登录与保存需要 Node 后端**，在纯 GitHub Pages 下不可用
  （保存会失败）。如需可用的后台，请使用方式 B。

### 方式 B：Node 平台（Railway / Render / VPS）—— 含可用后台

1. 在本目录运行：`npm start`（即 `node server.js`），监听 `PORT`（默认 8080）。
2. 部署到 Railway / Render / 任意 VPS，并：
   - 设置环境变量 `ADMIN_PASS`（管理员密码，覆盖默认值）。
   - 挂载**持久化磁盘**到本目录，保证 `data/posts.json` 与 `data/admin.json` 在重启后不丢失。
3. `server.js` 会从根目录提供静态文件，并提供 `/api/*` 后台接口；`admin/` 后台此时可正常登录与编辑。

默认管理员账号：`admin` / 密码见首次启动日志（或 `ADMIN_PASS`）。登录后请在「修改密码」中更改。

## 数据安全提示

- `data/.secret`（会话密钥）与 `data/admin.json`（管理员哈希）已被 `.gitignore` 忽略，**请勿提交**。
- `data/posts.json` 包含全部内容（含草稿）。前台列表/详情只展示 `status:"published"` 的条目，
  但原始 JSON 文件本身可被公开下载；如对外保密要求高，请勿把草稿写入此文件，或改用方式 B 并在服务端过滤。

## 本地预览

```bash
cd 发布网站
npm start          # 然后浏览器打开 http://localhost:8080
# 或仅预览静态前台：
python3 -m http.server 8080
```
