---
title: Obsidian GitHub Sync 配置
sidebarTitle: Obsidian Sync

---
# Obsidian 配置 Obsidian-GitHub-Sync 同步教程

> 本教程将带你完成 Obsidian 笔记同步到 GitHub 私有仓库的配置。  
> 适合想要免费备份 Obsidian 笔记、并希望自己掌控数据的用户。

---

## 一、准备工作

开始前，请先准备好：

|准备项|说明|
|---|---|
|GitHub 账号|用来创建私有仓库|
|Obsidian|已安装并有自己的笔记库|
|网络环境|能正常访问 GitHub|
|GitHub Token|后面会生成，用于插件同步|

整体流程如下：

```text
创建 GitHub 私有仓库
        ↓
生成 GitHub Token
        ↓
安装 BRAT 插件
        ↓
安装 Obsidian-GitHub-Sync
        ↓
填写配置并同步
```

---

# 第一部分：创建 GitHub 私有仓库

GitHub 仓库可以理解为你的“云端笔记备份空间”。

打开地址：

```text
https://github.com/new
```

进入页面后，按下面配置：

|配置项|推荐填写|
|---|---|
|Repository name|`my-obsidian-notes`|
|Description|可不填|
|Public / Private|选择 `Private`|
|Add README|不勾选|
|Add .gitignore|不选择|
|Choose a license|不选择|

注意：一定要选择 **Private**，否则你的笔记可能会被公开访问。

![[Pasted image 20260529202819.png]]

配置完成后，点击：

```text
Create repository
```

创建一个空的私有仓库。

---

# 第二部分：生成 GitHub Token

插件需要一个 GitHub Token，才能把 Obsidian 笔记上传到你的私有仓库。

打开地址：

```text
https://github.com/settings/tokens/new
```

建议选择：

```text
Generate new token classic
```

然后填写：

|配置项|推荐填写|
|---|---|
|Note|`Obsidian-Sync-Key`|
|Expiration|`No expiration`|
|Select scopes|勾选 `repo`|

其中最重要的是勾选：

```text
repo
```

这个权限允许插件读写你的私有仓库。

![[Pasted image 20260529202900.png]]

点击页面底部：

```text
Generate token
```

生成后，请立刻复制保存。

注意：Token 只会显示一次，关闭页面后就看不到了。



---

# 第三部分：安装 BRAT 插件

因为 `Obsidian-GitHub-Sync` 没有上架 Obsidian 官方插件市场，所以需要先安装 BRAT。

打开 Obsidian，进入：

```text
Settings -> Community plugins
```

如果看到 `Restricted mode`，需要先关闭限制模式，启用社区插件。

然后点击：

```text
Browse
```

搜索：

```text
BRAT
```

找到：

```text
Obsidian 42 - BRAT
```

点击：

```text
Install
```

安装完成后，再点击：

```text
Enable
```

启用插件。

![[Pasted image 20260529202950.png]]


![[Pasted image 20260529203447.png]]
---

# 第四部分：安装 Obsidian-GitHub-Sync

BRAT 安装完成后，回到：

```text
Settings -> Obsidian 42 - BRAT
```

点击：

```text
Add Beta plugin
```

在输入框中填写：

```text
kevinmkchin/Obsidian-GitHub-Sync
```

然后点击：

```text
Add Plugin
```

等待插件安装完成。

![[Pasted image 20260529203439.png]]

![[Pasted image 20260529203619.png]]
安装完成后，回到：

```text
Settings -> Community plugins
```

找到：

```text
GitHub Sync
```

点击右侧开关，启用插件。

![[Pasted image 20260529203640.png]]

---

# 第五部分：配置 GitHub Sync

进入：

```text
Settings -> GitHub Sync
```

按下面填写：

|字段|填写内容|示例|
|---|---|---|
|Username|GitHub 用户名|`your-name`|
|Repository Name|仓库名|`my-obsidian-notes`|
|Personal Access Token|刚才生成的 Token|`ghp_xxxxx`|
|Main Branch Name|主分支名称|`main`|

注意：

- `Username` 填 GitHub 用户名，不是邮箱；
    
- `Repository Name` 只填仓库名，不要填完整链接；
    
- `Personal Access Token` 不要多复制空格；
    
- 新建 GitHub 仓库默认分支一般是 `main`。
    


---

## 推荐开启自动同步

建议开启以下配置：

|配置项|推荐值|
|---|---|
|Sync on Startup|开启|
|Periodic Sync|10 或 15 分钟|

这样每次打开 Obsidian 时会自动同步，平时也会定时备份。



---

# 第六部分：执行首次同步

配置完成后，先手动同步一次。

打开命令面板：

|系统|快捷键|
|---|---|
|Windows|`Ctrl + P`|
|macOS|`Cmd + P`|

输入：

```text
sync
```

找到命令：

```text
GitHub Sync: Create a backup of your vault
```

点击执行。

插件会把你的 Obsidian 笔记上传到 GitHub 私有仓库。



---

# 第七部分：验证是否成功

打开你的 GitHub 仓库页面，例如：

```text
https://github.com/your-name/my-obsidian-notes
```

刷新页面。

如果看到 Obsidian 笔记库里的文件夹和 `.md` 文件，说明同步成功。


---

# 常见问题

## 1. GitHub 上没有文件怎么办？

优先检查：

- 仓库名是否只填了名称；
    
- GitHub 用户名是否正确；
    
- Token 是否复制完整；
    
- Token 是否勾选了 `repo` 权限；
    
- 分支名是否是 `main`。
    

---

## 2. 提示权限错误怎么办？

一般是 Token 配置有问题。

解决方法：

1. 重新生成 classic token；
    
2. 勾选 `repo` 权限；
    
3. 回到 Obsidian 重新粘贴 Token；
    
4. 再执行一次同步。
    

---

## 3. 多设备同步要注意什么？

建议养成这个习惯：

```text
打开 Obsidian 后先同步
写完笔记后再同步
换设备前确认已同步完成
```

不要在两台设备上同时编辑同一个文件，否则可能产生冲突。

---

