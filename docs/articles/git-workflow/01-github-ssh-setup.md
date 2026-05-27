---
title: GitHub SSH 密钥配置指南（Windows 版）
---

# GitHub SSH 密钥配置指南（Windows 版）

每次 git push 都要输密码，体验很差。配好 SSH 密钥之后，克隆、推送、拉取全部自动完成，不用再操心认证的事。这篇指南手把手带你在 Windows 上配好 GitHub 的 SSH 连接，配一次，管很久。

## SSH 是什么，为什么需要它

GitHub 支持两种方式连接本地仓库：

**HTTPS 方式**（默认）
- 优点：clone 下来直接能用，不用任何配置
- 缺点：每次 push 都要输入用户名和密码（或 Token）。如果是 2FA 账号，密码方式直接废掉

**SSH 方式**
- 优点：配好之后所有操作免登录，包括 clone、push、pull
- 缺点：第一次配置要多几个步骤

结论：多花 10 分钟配 SSH，后面省心一整年。

## SSH 连接的基本原理

不用记太深，知道大概逻辑即可：

1. 你电脑上有一对文件，一把私钥，一把公钥
2. 公钥放到 GitHub 上，私钥留在你电脑里
3. 推送时，Git 用私钥做一次签名，GitHub 用公钥验证——私钥从来没上网，安全

私钥就像钥匙，公钥就像锁芯。锁芯可以公开，钥匙必须保管好。

## 准备工作

在开始之前，确认你电脑上已经安装了 Git。

打开 PowerShell（任意位置都可以），输入：

```powershell
git --version
```

如果看到类似 `git version 2.47.0.windows.1` 这样的输出，说明 Git 已经装好了。

如果提示"不是可识别的命令"，先去 git-scm.com/download/win 下载安装。

## 开始配置

### 第一步：打开 PowerShell

右键开始菜单，选择"终端"或"PowerShell"，不用管理员权限也能完成大部分操作。

### 第二步：检查是否已有 SSH 密钥

输入以下命令查看你的 .ssh 目录里有什么：

```powershell
ls ~/.ssh
```

如果目录不存在，或者里面没有 id_ed25519 和 id_ed25519.pub 这两个文件，说明你还没有生成过 SSH 密钥，需要做第三步。

如果已经有一对 id_rsa 或 id_ed25519 密钥，跳过第三步直接看第四步。

### 第三步：生成新的 SSH 密钥

运行下面的命令，把 `你的邮箱@example.com` 换成你注册 GitHub 时用的邮箱：

```powershell
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
```

运行后会有两行提示：

**第一行问密钥存在哪**：直接按回车，用默认路径

**第二行问要不要设密码**：这是给私钥再加一层保护，建议设一个，记不住就写密码管理器里。也可以直接回车留空，但安全性会降低一些。

完整操作大概长这样：

```powershell
Generating public/private ed25519 key pair.
Enter file in which to save the key:  # 直接回车
Enter passphrase:  # 输入密码或直接回车
Enter same passphrase again:  # 再输入一次
```

看到 Your identification has been saved 和 Your public key has been saved 就说明成功了。

### 第四步：启动 SSH Agent

Windows 的 SSH Agent 负责把你的私钥加载到内存里，这样每次用的时候不用反复输入密码。

检查 Agent 服务状态：

```powershell
Get-Service ssh-agent
```

如果显示 Running 且 StartType 是 Automatic，这一章跳过。

如果不是，按下面的步骤启动：

```powershell
# 设置为开机自启
Set-Service -Name ssh-agent -StartupType Automatic

# 启动服务
Start-Service ssh-agent
```

### 第五步：加载私钥到 Agent

```powershell
ssh-add ~/.ssh/id_ed25519
```

如果设了密码，这里会让你输入一次。以后只要电脑不重启，当天就不用再输了。

### 第六步：把公钥添加到 GitHub

**1. 复制公钥内容**

```powershell
cat ~/.ssh/id_ed25519.pub
```

运行后会输出一行类似这样的内容：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBgKaHd7f... 你的邮箱@example.com
```

整行复制下来，包括 ssh-ed25519 开头到邮箱结尾的所有字符。

**2. 打开 GitHub 添加页面**

浏览器打开：github.com/settings/keys

点击绿色的 New SSH key 按钮。

**3. 填写信息**

- **Title**：随便起个名字，方便以后分辨是哪台设备，比如 Surface Win11 或 工作笔记本
- **Key type**：保持默认的 Authentication Key
- **Key**：把刚才复制的公钥内容完整粘贴进去

填完点 Add SSH key。

### 第七步：验证连接是否成功

回到 PowerShell，运行：

```powershell
ssh -T git@github.com
```

第一次连接会提示确认 GitHub 的指纹，输入 yes 回车。

如果看到这样的回显就说明成功了：

```
Hi 你的用户名! You've successfully authenticated, but GitHub does not provide shell access.
```

看到 Hi 你的用户名! 就对了。后面那句 does not provide shell access 是正常现象，GitHub 所有用户都这样。

## 遇到问题怎么办

**问题：提示 Permission denied (publickey)**

依次排查：

1. 公钥真的添加到 GitHub 了吗？去 github.com/settings/keys 检查一下
2. 私钥加载了吗？运行 ssh-add -l 看输出，如果什么都没有说明没加载，执行 ssh-add ~/.ssh/id_ed25519
3. Agent 启动了吗？Get-Service ssh-agent 确认状态

**问题：每次重启电脑都要重新 ssh-add**

正常现象。Windows 的 ssh-agent 每次重启后确实会清空内存。但因为 Agent 已经是开机自启了，所以你只需要在每天第一次用之前输入一次密码就行。

**问题：不小心覆盖了旧密钥**

重新生成一对，GitHub 上删掉旧的公钥，添加新的即可。旧的密钥对再也用不了了，这是设计如此。

**问题：密码忘了**

没救，只能重新生成一对新的。密钥密码无法找回，这是设计如此。

## 切换现有仓库到 SSH 方式

如果你之前用 HTTPS 的方式 clone 了一个仓库，想改成 SSH：

```powershell
cd 你的仓库目录
git remote set-url origin git@github.com:你的用户名/仓库名.git
```

怎么知道仓库名？去 GitHub 上这个仓库页面，点 Code 按钮，切换到 SSH 那一栏，复制那个 git@github.com:... 开头的地址就行。

## 多账号场景（可选）

如果你同时用公司 GitHub 和个人 GitHub，需要给每个账号生成不同的密钥，然后在 ~/.ssh/config 文件里做路由配置。

生成第二对密钥：

```powershell
ssh-keygen -t ed25519 -C "公司邮箱@公司.com" -f ~/.ssh/id_ed25519_work
```

创建 ~/.ssh/config 文件，内容如下：

```
# 个人账号（默认）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

# 公司账号
Host github.com-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

使用时，个人项目 clone 地址不变，公司项目 clone 时把 github.com 换成 github.com-work：

```powershell
git clone git@github.com-work:公司/仓库.git
```

## 完整配置脚本

下面是一个一键配置脚本，复制保存为 setup-github-ssh.ps1，放在仓库根目录，双击运行即可自动完成第三步到第五步：

```powershell
# ============================================================
# GitHub SSH 密钥配置脚本
# 适用于 Windows 10/11
# ============================================================

# 收集邮箱
$email = Read-Host "请输入你的 GitHub 注册邮箱"
if ($email -notmatch '.+@.+') {
    Write-Host "邮箱格式不正确，退出。" -ForegroundColor Red
    return
}

# 生成密钥
$keyPath = "$HOME\.ssh\id_ed25519"
if (Test-Path "$keyPath") {
    $confirm = Read-Host "密钥已存在，是否覆盖？(y/n)"
    if ($confirm.ToLower() -ne 'y') {
        Write-Host "退出。"
        return
    }
}

Write-Host "正在生成密钥，请连续按三次回车（跳过密码）..." -ForegroundColor Yellow
ssh-keygen -t ed25519 -C $email -f $keyPath

# 启动 Agent
Set-Service -Name ssh-agent -StartupType Automatic -ErrorAction SilentlyContinue
Start-Service ssh-agent -ErrorAction SilentlyContinue

# 加载私钥
ssh-add $keyPath

# 显示公钥
Write-Host ""
Write-Host "========== 你的公钥（复制下面这行）==========" -ForegroundColor Green
Get-Content "$keyPath.pub"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. 打开 https://github.com/settings/keys" -ForegroundColor Cyan
Write-Host "2. 点击 New SSH key" -ForegroundColor Cyan
Write-Host "3. 粘贴上方公钥，保存" -ForegroundColor Cyan
Write-Host "4. 运行: ssh -T git@github.com 验证" -ForegroundColor Cyan
```

## 配置完成后的日常使用

配好之后，所有操作都变成全自动了：

```powershell
# 克隆（用 SSH 地址，不是 HTTPS）
git clone git@github.com:用户名/仓库名.git

# 推送，不用输任何密码
git push origin main

# 拉取，同样不用输密码
git pull origin main
```

从今以后，GitHub 操作和本地操作体验一致了。
