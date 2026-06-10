---
title: AI 网页制作第 6 步：5 步全流程用到的工具与服务清单
sidebarTitle: 06 工具与服务清单
---

# AI 网页制作第 6 步：5 步全流程用到的工具与服务清单

前面 5 篇文章，已经把"从公众号文章到正式上线"这件事完整跑了一遍。

但跑完之后你会发现，整个流程里用到的工具其实不少：

- 千问、Claude Code、Codex 三个 AI 工具轮番上场
- 一组 UX/UI Skill 做精修
- Netlify、阿里云 DNS、Let's Encrypt 一起配合让网站上线
- 还有一堆本地的文本编辑器、浏览器、图片素材

如果哪天你想回过头查"Claude Code 到底在第几步用？"或者"阿里云那个解析配置在哪一篇？"，可能要在 5 篇文章之间来回翻。

所以这一篇，就是把这 5 步里用到的所有工具和服务，**聚到一张表里**。

不重复讲操作步骤，只讲：

- 这个工具是干嘛的
- 它在哪一步用
- 为什么要用它
- 它的官网/获取方式

方便你随时翻一翻，就能找到。

---

## 一、5 步流程的工具总览表

下面是整张总览表。

一眼能看完全部工具、所属阶段、用途和官网。

| 阶段  | 工具                        | 类型      | 用途                    | 官网                       |
| --- | ------------------------- | ------- | --------------------- | ------------------------ |
| 01  | 千问                        | AI 对话   | 公众号文章 → 单文件 HTML      | https://www.qianwen.com/ |
| 01  | 文本编辑器                     | 本地工具    | 保存 v1.html            | —                        |
| 01  | 浏览器                       | 本地工具    | 双击打开 HTML 文件          | —                        |
| 02  | Claude Code               | AI 编程代理 | 读取本地目录、改造 HTML/CSS/JS | https://claude.ai/       |
| 03  | Codex                     | AI 编程代理 | 在 V2 基础上做 UX/UI 精修    | https://openai.com/codex/ |
| 03  | ui-ux-pro-max             | 主 Skill | 整体 UX/UI 打磨           | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| 03  | 7 个协同 Skills              | 能力包     | 前端/响应式/可访问性/性能等       | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| 04  | Netlify                   | 静态托管    | 拖拽部署 V1 / V2 / V3     | https://www.netlify.com/ |
| 04  | netlify.toml              | 配置文件    | 缓存控制、发布目录             | —                        |
| 05  | Netlify Domain management | 域名管理    | 绑定正式域名                | https://www.netlify.com/ |
| 05  | 阿里云 DNS                   | 域名解析    | A/CNAME 记录配置          | https://www.aliyun.com/  |
| 05  | Let's Encrypt             | 证书机构    | HTTPS 证书自动签发          | https://letsencrypt.org/ |
| 05  | xiaoyangyx.top            | 自有域名    | 最终对外访问地址              | —                        |

> 表格里 "—" 代表这是本地工具、配置文件或自有资源，没有外部官网。

---

## 二、按阶段详解每个工具

下面按 5 步顺序，把每个工具展开讲一下。

### 第 1 步：千问生成基础网页

#### 千问
- **是什么**：阿里旗下的 AI 对话产品，对中文支持比较好。
- **为什么这一步要用它**：入口简单、生成速度快、输出单文件 HTML，对没有代码基础的人最友好。
- **关键提示**：第一步只让 AI 忠实地把文章转成网页，不要让它自由发挥设计。
- **官网**：https://www.qianwen.com/

#### 文本编辑器
- **是什么**：用来保存 AI 生成的 HTML 代码。
- **为什么这一步要用它**：把千问输出的代码粘进去，存成 `v1.html`。
- **关键提示**：保存时一定确认后缀是 `.html`，不是 `.html.txt`。
- **推荐**：Windows 自带记事本、VS Code、Sublime Text 都可以。

#### 浏览器
- **是什么**：用来打开 HTML 文件。
- **为什么这一步要用它**：验证网页能不能正常显示。
- **关键提示**：双击 `v1.html` 即可，手机端可以用文件管理器传到手机打开。
- **推荐**：Chrome、Safari、Edge 都行。

---

### 第 2 步：Claude Code 加入图片素材

#### Claude Code
- **是什么**：Anthropic 出品的 AI 编程代理，能读取本地目录、读写文件。
- **为什么这一步要用它**：V2 需要把本地图片素材接入网页结构，单纯网页 AI 工具不方便。Claude Code 能直接读目录、改 HTML/CSS/JS 文件。
- **关键提示**：提示词要让 Claude Code 先列图片清单、再读 V1、再解析结构、最后改造，不要让它一上来就改页面。
- **官网**：https://claude.ai/

#### 本地图片素材
- **是什么**：V2 升级用的图片文件。
- **为什么这一步要用它**：没有图片，图文作品版就缺一半。
- **关键提示**：文件名尽量语义化（`hero.jpg`、`workflow.jpg`），放在 `assets/` 统一目录里。
- **路径约定**：最终网页里要写成 `./assets/xxx.jpg`，不要带本地绝对路径。

---

### 第 3 步：UX/UI Skill 精修

#### Codex
- **是什么**：AI 编程代理。
- **为什么这一步要用它**：V3 更像"工程化审查 + 精细化修改"，需要按 Skill 工作流执行，Codex 适合承担这种结构化任务。
- **关键提示**：要让它先检查 Skill 是否可用、安装失败要说明原因、保护 V2 目录不被覆盖。
- **官网**：https://openai.com/codex/

#### ui-ux-pro-max（主 Skill）
- **是什么**：一组面向 UX/UI 的专业优化规则。
- **为什么这一步要用它**：V2 看起来"已经像网页了"，但还差作品级质感，需要这种系统化的打磨能力。
- **关键提示**：Skill 的作用是优化表达，不是改写事实。
- **来源**：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill（82K stars，支持 Claude Code / Codex CLI / Cursor 等多种 AI 代理）

#### 7 个协同 Skills
- **是什么**：围绕主 Skill 的一组细分能力。
- **为什么这一步要用它们**：UX/UI 优化涉及很多维度，单一 Skill 不够，需要分工：
  - `frontend-html-css-js`：HTML / CSS / JS 落地
  - `responsive-design`：移动端适配
  - `visual-polish`：细节质感
  - `design-system`：颜色、字号、间距、组件统一
  - `accessibility-audit`：可访问性
  - `web-performance`：性能
  - `content-preservation`：内容保护
- **关键提示**：缺哪个装哪个，安装失败要在结果里说明。

---

### 第 4 步：Netlify 部署三个版本

#### Netlify
- **是什么**：流行的静态网站托管平台。
- **为什么这一步要用它**：对新手非常友好，拖拽文件夹就能部署，自动生成 HTTPS。
- **关键提示**：一个 Netlify 项目可以用子目录承载 V1 / V2 / V3，不需要建三个站点。
- **官网**：https://www.netlify.com/

#### netlify.toml
- **是什么**：Netlify 项目的配置文件。
- **为什么这一步要用它**：控制发布目录、设置缓存头。让 HTML 关闭强缓存，避免"更新了看不到"。
- **关键提示**：最关键的一句是 `publish = "."`，意思直接发布当前目录。
- **位置**：项目根目录。

---

### 第 5 步：绑定正式域名

#### Netlify Domain management
- **是什么**：Netlify 后台的域名管理模块。
- **为什么这一步要用它**：把 Netlify 自动生成的临时域名替换成自己的正式域名。
- **关键提示**：在 Production domains 里添加 `xiaoyangyx.top` 并设为 Primary domain。
- **官网**：https://www.netlify.com/

#### 阿里云 DNS
- **是什么**：阿里云提供的域名解析服务。
- **为什么这一步要用它**：把你的域名指向 Netlify 服务器，访问请求才能正确到达。
- **关键提示**：
  - 主域名用 `@` 主机记录
  - 二级 `www` 用 `www` 主机记录
  - DNS 只负责域名解析，不要把完整页面路径写进去
- **官网**：https://www.aliyun.com/

#### Let's Encrypt
- **是什么**：免费、自动化的 HTTPS 证书签发机构。
- **为什么这一步要用它**：让正式域名也能用 HTTPS，浏览器显示安全锁。
- **关键提示**：Netlify 自动和 Let's Encrypt 集成，证书自动签发，不需要手动申请。
- **官网**：https://letsencrypt.org/

#### xiaoyangyx.top（自有域名）
- **是什么**：你的正式域名。
- **为什么这一步要用它**：临时地址不方便分享，正式域名才是作品应该有的样子。
- **关键提示**：域名可以在阿里云、腾讯云、Cloudflare 等任何注册商购买，本教程用 `xiaoyangyx.top` 作为示例。

---

## 三、配套服务清单

这一节列一些"不是主角但要用到"的东西。

### 本地工具

| 工具 | 用途 | 备注 |
|---|---|---|
| 文本编辑器 | 写 HTML / CSS / JS | 推荐 VS Code |
| 浏览器 | 调试网页 | 推荐 Chrome + 移动端模拟 |
| 文件管理器 | 管理图片素材 | Windows 资源管理器、macOS Finder |
| 终端（可选） | 偶尔用 git、跑命令 | 01-05 教程里不强制 |

### 配置文件

| 文件 | 位置 | 作用 |
|---|---|---|
| `v1.html` | `public/v1-qwen-basic/` | V1 基础版入口 |
| `index.html` | `public/v2-claude-assets/` | V2 图文版入口 |
| `css/style.css` | `public/v2-claude-assets/css/` | V2 样式 |
| `js/main.js` | `public/v2-claude-assets/js/` | V2 交互 |
| `index.html` | `public/v3-uxmax-polished/` | V3 精修版入口 |
| `index.html` | 项目根目录 | 整个作品展示站的首页导航 |
| `netlify.toml` | 项目根目录 | Netlify 部署配置 |

### 隐含服务

| 服务 | 角色 | 出现位置 |
|---|---|---|
| 域名注册商 | 购买域名 | 05 步之前（用户自己完成） |
| Let's Encrypt | 证书机构 | 05 步自动签发 |
| 浏览器 CA 信任库 | 让 HTTPS 证书有效 | 浏览器内置 |

### 图片素材管理

- **存放位置**：`public/v2-claude-assets/assets/`
- **命名建议**：`hero.jpg`、`workflow.jpg`、`compare.jpg`、`mobile.jpg`
- **引用方式**：V2 用 `./assets/xxx.jpg`，V3 用 `../v2-claude-assets/assets/xxx.jpg`
- **不要做**：复制、移动、删除素材；写成电脑本地绝对路径

---

## 四、版本对照（V1 / V2 / V3 用到哪些工具）

| 维度 | V1 基础版 | V2 图文版 | V3 精修版 |
|---|---|---|---|
| 主力 AI 工具 | 千问 | Claude Code | Codex |
| 核心能力 | 单文件 HTML 生成 | 本地目录读取 + 多文件改造 | Skill 工作流驱动的精修 |
| 主 Skill | — | — | ui-ux-pro-max |
| 协同 Skills | — | — | 7 个（前端/响应式/性能等） |
| 输出文件 | `v1.html` | `index.html` + `css/` + `js/` + `assets/` | `index.html`（CSS/JS 内联） |
| 是否需要图片 | 否 | 是 | 否（引用 V2 的图） |
| 是否需要部署 | 否 | 否 | 否 |
| Netlify 路径 | `/v1-qwen-basic/` | `/v2-claude-assets/` | `/v3-uxmax-polished/` |
| 解决的核心问题 | 内容能不能变成网页 | 网页有没有作品感 | 作品像不像正式展示页 |

---

## 五、获取与成本

下面是这套工具链的获取方式和大致成本。

| 工具 | 是否需要注册 | 是否付费 | 备注 |
|---|---|---|---|
| 千问 | 是 | 免费版够用 | 有网页版 / App |
| Claude Code | 是 | 免费 + 付费档 | 海外服务，需稳定网络 |
| Codex | 是 | 免费 + 付费档 | 绑定 OpenAI 账号 |
| Codex Skills | 否 | 免费 | 需要在环境内安装 |
| Netlify | 是 | 免费档够用 | 拖拽部署无需信用卡 |
| 阿里云 DNS | 是 | 免费 | 解析记录免费 |
| Let's Encrypt | 否 | 免费 | 自动签发 |
| 域名 | 是 | 约 50-80 元/年 | 各大注册商价格不同 |
| 文本编辑器 | 否 | VS Code 免费 | Sublime / Notepad++ 也行 |
| 浏览器 | 否 | 免费 | Chrome / Edge / Safari |

> 整条流程里，唯一确定要花钱的是**域名**，其余工具免费档基本够用。

---

## 六、所有工具网址清单

方便一键复制：

```text
千问        https://www.qianwen.com/
Claude      https://claude.ai/
Codex       https://openai.com/codex/
ui-ux-pro-max  https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
Netlify     https://www.netlify.com/
阿里云      https://www.aliyun.com/
Let's Encrypt  https://letsencrypt.org/
```

本教程示例地址：

```text
作品展示站    https://xiaoyangyx.top/
Netlify 临时  https://curious-daffodil-2781ee.netlify.app/
```

---

## 七、回到 5 步流程

最后，回顾一下整个 5 步流程跑下来用到的所有工具：

```text
01 千问     →  02 Claude Code  →  03 Codex + Skills
   ↓                ↓                    ↓
  v1.html     V2 图文版 + 图片       V3 精修版
                                          ↓
04 Netlify 拖拽部署  →  05 阿里云 DNS + Let's Encrypt
                                          ↓
                              https://xiaoyangyx.top/
```

每一篇文章讲的，是这一步具体怎么做。

这一篇讲的，是**全流程用到了什么**。

如果以后你想重新跑一遍这套流程，或者推荐给朋友，照着这张表去准备工具就够了。
