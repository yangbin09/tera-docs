---
title: AI 网页制作第 4 步：用一个 Netlify 项目，发布三个网页版本
sidebarTitle: 04 Netlify 部署
---

# AI 网页制作第 4 步：用一个 Netlify 项目，发布三个网页版本

前面三篇，我们已经做好了三个本地网页版本：

- V1：千问生成的基础文字网页
    
- V2：Claude Code 加入图片素材后的图文网页
    
- V3：Codex 配合 UX/UI Skill 打磨后的作品级网页
    

到这里，网页已经不是“想法”了，而是实实在在的本地文件。

但本地文件有一个问题：

> 只有自己的电脑能打开，别人看不到。

所以第 4 步要做的事情，就是把它们发布到网上。

这里很多人会有一个疑问：

> V1、V2、V3 是三个版本，是不是要建三个 Netlify 站点？

答案是：不用。

一个 Netlify 项目就够了。

![[img-04-01.png]]

---

## 一、一个项目就能放三个版本

V1、V2、V3 虽然是三个网页版本，但它们本质上都是静态网页。

只要目录结构设计好，一个 Netlify 项目里就可以同时放多个页面。

你可以把它理解成一个作品展厅：

- 首页是总入口
    
- V1 是基础版展区
    
- V2 是图文版展区
    
- V3 是精修版展区
    

访问路径可以这样设计：

```text
/v1-qwen-basic/
/v2-claude-assets/
/v3-uxmax-polished/
```

这样做有三个好处。

第一，管理简单。

只需要维护一个 Netlify 项目，不用创建三个站点。

第二，对比方便。

三个版本都在同一个域名下面，读者可以连续打开，直观看到网页从 V1 到 V3 的变化。

第三，后续扩展方便。

以后如果继续做 V4、V5，只要继续增加目录就行，不需要重新建站。

这一篇的核心思路就是：

> 一个项目，一个域名，多个路径，承载多个网页版本。

---

## 二、先整理好项目目录

部署前，先把本地项目目录整理清楚。

我最终采用的是这种结构：

```text
ai-web-demo-showcase/
├── index.html
├── netlify.toml
├── v1-qwen-basic/
│   └── index.html
├── v2-claude-assets/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── assets/
│       └── 图片素材
└── v3-uxmax-polished/
    └── index.html
```

这里最重要的是根目录的：

```text
index.html
```

它不是 V1，也不是 V2、V3，而是整个项目的首页导航。

用户打开首页后，可以选择进入不同版本。

比如首页里放三个入口：

```html
<h1>一篇公众号文章，如何被 AI 变成网页作品？</h1>

<ul>
  <li><a href="./v1-qwen-basic/">查看 V1 千问基础版</a></li>
  <li><a href="./v2-claude-assets/">查看 V2 Claude Code 图文版</a></li>
  <li><a href="./v3-uxmax-polished/">查看 V3 ux-max 精修版</a></li>
</ul>
```

这样部署后，访问路径会非常清楚：

```text
/
首页导航

/v1-qwen-basic/
V1 基础版

/v2-claude-assets/
V2 图文版

/v3-uxmax-polished/
V3 精修版
```

这种结构比把所有文件堆在一起更清晰，也方便后面写文章、做截图和演示。

---

## 三、拖拽部署到 Netlify

Netlify 对新手非常友好。

这一步不需要服务器，不需要 Nginx，也不需要命令行。

操作很简单：

第一步，登录 Netlify。

第二步，选择新建项目。

第三步，选择手动部署。

第四步，把整个 `ai-web-demo-showcase` 文件夹拖进去。

第五步，等待部署完成。

部署完成后，Netlify 会自动生成一个访问地址。

我这次生成的地址是：

```text
https://curious-daffodil-2781ee.netlify.app/
```

打开这个地址，就可以看到首页。

然后继续检查三个版本：

```text
https://curious-daffodil-2781ee.netlify.app/v1-qwen-basic/
https://curious-daffodil-2781ee.netlify.app/v2-claude-assets/
https://curious-daffodil-2781ee.netlify.app/v3-uxmax-polished/
```

如果这三个地址都能打开，说明部署成功。

这一篇先不处理正式域名。

先用 Netlify 自动生成的地址验证项目能不能正常访问。

正式域名放到下一篇再绑定。
![[img-04-02.png]]
---

## 四、加一个 netlify.toml

为了让部署更稳定，可以在项目根目录加一个 `netlify.toml`。

内容不用复杂：

```toml
[build]
  publish = "."

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache"
```

这里的重点是：

```toml
publish = "."
```

意思是直接发布当前项目根目录。

后面的 `Cache-Control = "no-cache"` 是为了减少一个常见问题：

> 页面明明更新了，但浏览器看到的还是旧版本。

尤其是教程项目经常会反复修改 HTML，给 HTML 关掉强缓存会更稳一点。

如果只是第一次测试，不写也可以。

但如果这个项目要长期作为案例展示，建议保留这个配置。

---

## 五、部署后重点检查这几件事

部署完成后，不要只看首页。

一定要把每个路径都打开一遍。

检查清单如下：

```text
1. 首页能不能正常打开？
2. 首页里的 V1 / V2 / V3 链接能不能点击？
3. /v1-qwen-basic/ 是否正常显示？
4. /v2-claude-assets/ 是否正常显示？
5. /v3-uxmax-polished/ 是否正常显示？
6. V2 的图片有没有加载出来？
7. V3 引用 V2 assets 的图片是否正常？
8. CSS 样式有没有丢？
9. 返回顶部、移动端菜单、阅读进度条等 JS 是否正常？
10. 手机端访问是否正常？
```

这里最容易出问题的是图片路径。

本地能打开，不代表线上一定能打开。

如果 HTML 里出现这种电脑本地路径：

```text
F:\素材\趁早AI\xxx.jpg
```

部署到 Netlify 后一定会失效。

线上必须使用相对路径。

比如 V2 自己目录里的图片：

```text
./assets/xxx.jpg
```

如果 V3 引用 V2 的图片：

```text
../v2-claude-assets/assets/xxx.jpg
```

还有一个常见问题是子目录里没有 `index.html`。

当你访问：

```text
/v2-claude-assets/
```

Netlify 会默认去这个目录下找：

```text
index.html
```

如果这个文件不存在，就会打不开。

所以每个版本目录里都要有自己的 `index.html`。

到这里，一个 Netlify 项目承载三个版本的部署就完成了。

当前可访问地址是：

```text
https://curious-daffodil-2781ee.netlify.app/
```

它下面包含三个版本：

```text
https://curious-daffodil-2781ee.netlify.app/v1-qwen-basic/
https://curious-daffodil-2781ee.netlify.app/v2-claude-assets/
https://curious-daffodil-2781ee.netlify.app/v3-uxmax-polished/
```

下一篇，我们继续把这个 Netlify 自动生成的地址，换成自己的正式域名：

```text
https://xiaoyangyx.top/
```

到那一步，这个 AI 网页作品就真正可以作为正式链接对外分享了。
![[img-04-03.png]]