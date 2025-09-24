# Ubuntu 远程连接终极指南：从零开始配置 SSH 服务

作者: Gemini AI

发布日期: 2025年9月24日

标签: Ubuntu, SSH, Linux, 服务器管理, 网络安全

## 前言：为何 SSH 是你的必备技能？

无论你是一名开发者、系统管理员，还是仅仅是一个想在客厅用笔记本电脑控制书房里树莓派的极客，远程管理 Linux 服务器都是一项基本功。而在众多远程连接协议中，SSH (Secure Shell) 无疑是当之无愧的王者。

SSH 为我们提供了一条加密的、安全的通道，让我们可以在任何地方，通过纯粹的命令行来完全控制一台远程的 Ubuntu 电脑，就像我们正坐在那台电脑前一样。

本指南将带你从零开始，一步步在 Ubuntu 系统上安装、配置并加固 SSH 服务。无论你是初学者还是希望巩固知识，这篇文章都能为你提供清晰的指引。

---

## 准备工作

在开始之前，请确保你拥有：

1. **一台安装了 Ubuntu 的电脑**：可以是 Ubuntu Server 或 Desktop 版本。
    
2. **一个拥有 `sudo` 权限的账户**：我们需要管理员权限来安装软件和修改配置。
    
3. **一台用于连接的客户端电脑**：可以是任何操作系统（Windows, macOS, Linux）。
    
4. **本地网络连接**：确保两台电脑在同一个局域网内，或者服务器拥有公网 IP。
    

---

## Part 1: 安装与启动 SSH 核心服务

首先，我们需要在 Ubuntu 主机上安装并运行 SSH 服务端程序。

### 步骤 1: 更新软件包列表

在安装任何新软件之前，一个最佳实践是先同步你本地的软件包索引，以确保能获取到最新的软件版本。

Bash

```
sudo apt update
```

**解析**:

- `sudo`: 授予管理员权限。
    
- `apt update`: 从 Ubuntu 的软件源服务器下载最新的软件包“目录”，但并不会升级你已安装的软件。
    

### 步骤 2: 安装 OpenSSH Server

现在，我们来安装 SSH 服务端的核心软件包 `openssh-server`。

Bash

```
sudo apt install -y openssh-server
```

**解析**:

- `apt install`: 指示包管理器安装一个新软件。
    
- `openssh-server`: 这是我们目标安装的软件包。
    
- `-y`: 自动对安装过程中的所有提示回答“yes”，简化了安装流程。
    

### 步骤 3: 检查 SSH 服务状态

安装完成后，SSH 服务通常会自动启动。我们可以用以下命令来验证它是否正在正常运行。

Bash

```
sudo systemctl status ssh
```

如果一切正常，你会看到绿色的 `active (running)` 字样，表示 SSH 服务正在监听连接请求。

```
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2025-09-24 21:30:00 JST; 5min ago
...
```

### 步骤 4: 设置开机自启

为了确保服务器重启后 SSH 服务依然可用，我们需要将它设置为开机自启。

Bash

```
sudo systemctl enable ssh
```

**解析**:

- `systemctl start` 是立即启动服务（当前有效）。
    
- `systemctl enable` 是设置服务在未来每次开机时自动启动。
    

---

## Part 2: 配置防火墙——安全的第一道防线

**永远不要将一个没有防火墙保护的服务器暴露在网络中！** Ubuntu 内置了一个简单易用的防火墙工具 `ufw` (Uncomplicated Firewall)。正确的做法是保持防火墙开启，并只为 SSH "开一扇门"。

### 步骤 5: 允许 SSH 流量

我们将创建一个规则，允许所有外部流量访问本机的 22 端口（SSH 的默认端口）。

Bash

```
sudo ufw allow ssh
```

或者，你也可以明确指定端口号：`sudo ufw allow 22/tcp`。

### 步骤 6: 启用防火墙

如果你的防火墙还没有激活，使用此命令来启动它。

Bash

```
sudo ufw enable
```

系统会警告你启用防火墙可能会中断现有连接，输入 `y` 确认。

### 步骤 7: 检查防火墙状态

最后，检查一下防火墙的状态，确保我们的规则已经生效。

Bash

```
sudo ufw status
```

你应该能看到类似下面的输出，表明对 22 端口的访问已被允许。

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
```

---

## Part 3: 查找 IP 地址并远程连接

万事俱备，只差连接！

### 步骤 8: 获取服务器的 IP 地址

在你的 Ubuntu 主机终端里，输入以下命令来查找其局域网 IP 地址。

Bash

```
hostname -I
```

这条命令会直接列出你的 IP 地址，例如 `192.168.1.101`。记下这个地址。

> **小提示**: 如果你要从互联网连接，你需要的是你路由器的**公网 IP**，并且需要在路由器上设置**端口转发**。

### 步骤 9: 从客户端发起连接

现在，回到你的另一台电脑上，打开终端（Windows 用户可以使用 PowerShell 或 CMD）。

使用以下格式的命令进行连接：

ssh <你的Ubuntu用户名>@<你的Ubuntu主机IP>

示例:

如果你的 Ubuntu 用户名是 dev，IP 地址是 192.168.1.101，那么命令就是：

Bash

```
ssh dev@192.168.1.101
```

第一次连接时，系统会显示服务器的密钥指纹并询问你是否信任该主机，输入 `yes` 并回车。之后，输入你的 Ubuntu 用户密码，你就能成功登录了！

---

## Part 4: 安全第一！SSH 加固进阶指南

默认配置适用于安全的内网环境。但如果你的服务器暴露在公网，以下几项安全加固措施是**必须**的：

1. **禁用密码登录，改用 SSH 密钥对**：这是最重要的安全措施。通过生成一对公钥和私钥，你可以实现免密登录，并且彻底杜绝密码被暴力破解的风险。
    
2. **更改默认端口**：将 SSH 默认的 22 端口改为一个不常用的高位端口（如 2222），可以有效躲避绝大多数自动化扫描工具的攻击。你需要编辑 `/etc/ssh/sshd_config` 文件中的 `Port 22` 这一行。
    
3. **禁用 Root 用户远程登录**：直接使用 root 用户登录是一个坏习惯，风险极高。同样在 `/etc/ssh/sshd_config` 文件中，确保 `PermitRootLogin` 的值被设为 `no`。
    
4. **使用 Fail2Ban**：安装 `fail2ban` 工具，它可以监控登录日志，并自动封禁那些多次尝试登录失败的恶意 IP。
    

