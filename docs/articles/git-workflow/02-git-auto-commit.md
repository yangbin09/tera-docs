---
title: Git 自动提交脚本使用指南
sidebarTitle: Git 自动提交
---

# Git 自动提交脚本使用指南

写完代码忘了提交，或者懒得每次都手动执行一套 git add → git commit → git push 的流程，可以用一个脚本一键搞定。这个脚本会自动检查有没有改动，有改动才提交，没有改动就跳过，不会产生无意义的空提交。

## 这个脚本能做什么

- 检查当前目录是不是 Git 仓库
- 检查有没有未提交的改动，没有就跳过
- 自动生成带时间戳的提交信息
- 支持自定义提交信息
- 可以选择提交后是否推送

## 环境要求

- Windows 10 或 Windows 11
- 已安装 Git for Windows
- PowerShell 5.1 及以上（系统自带，不用单独装）

## 脚本内容

复制下面这段代码，保存为 `auto-commit.ps1`，放在你的 Git 仓库根目录下。

```powershell
<#
.SYNOPSIS
    Git 自动提交脚本

.DESCRIPTION
    自动暂存、提交当前仓库的所有改动，支持自定义提交信息和推送开关。
    如果没有检测到任何改动，脚本直接退出，不产生空提交。

.PARAMETER Message
    提交信息，不提供则自动生成带时间戳的默认信息。

.PARAMETER Push
    是否在提交后推送，默认为 true。

.EXAMPLE
    .\auto-commit.ps1
    # 使用自动生成的消息提交并推送

.EXAMPLE
    .\auto-commit.ps1 -Message "feat: 添加用户登录功能"
    # 使用自定义消息提交并推送

.EXAMPLE
    .\auto-commit.ps1 -Message "修复登录bug" -Push $false
    # 使用自定义消息提交，但不推送
#>
param(
    [string]$Message,
    [bool]$Push = $true
)

# 获取脚本所在目录并切换过去
$scriptDir = $PSScriptRoot
Set-Location $scriptDir

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Git 自动提交" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否是 Git 仓库
git rev-parse --is-inside-work-tree | Out-Null
if (-not $?) {
    Write-Host "错误：当前目录不是 Git 仓库。" -ForegroundColor Red
    exit 1
}

# 检查有没有待提交的改动
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "没有检测到改动，跳过提交。" -ForegroundColor Yellow
    exit 0
}

Write-Host "检测到以下改动：" -ForegroundColor Green
$status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# 确定提交信息
if ([string]::IsNullOrWhiteSpace($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "Auto commit at $timestamp"
    Write-Host "使用自动生成的消息: $Message" -ForegroundColor Cyan
} else {
    Write-Host "使用自定义消息: $Message" -ForegroundColor Cyan
}

# 执行提交
Write-Host ""
Write-Host "执行 git add ." -ForegroundColor Yellow
git add .

Write-Host "执行 git commit" -ForegroundColor Yellow
git commit -m $Message

if (-not $?) {
    Write-Host "提交失败。" -ForegroundColor Red
    exit 1
}

Write-Host "提交成功。" -ForegroundColor Green

# 推送到远程
if ($Push) {
    Write-Host ""
    Write-Host "执行 git push" -ForegroundColor Yellow
    git push

    if (-not $?) {
        Write-Host "推送失败。" -ForegroundColor Red
        exit 1
    }

    Write-Host "推送成功。" -ForegroundColor Green
} else {
    Write-Host "已跳过推送（-Push $false）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "全部完成。" -ForegroundColor Green
```

## 使用方法

### 基本用法

双击 `auto-commit.ps1`，或者在 PowerShell 里运行：

```powershell
.\auto-commit.ps1
```

脚本会自动检查改动，有改动就提交并推送，没有改动就提示跳过。

### 使用自定义提交信息

```powershell
.\auto-commit.ps1 -Message "feat: 添加新功能"
```

### 只提交，不推送

```powershell
.\auto-commit.ps1 -Message "更新文档" -Push $false
```

### 调试模式

加上 `-Verbose` 参数可以看到更详细的执行过程：

```powershell
.\auto-commit.ps1 -Message "修复bug" -Verbose
```

## 设置每日自动提交

不想每次都手动运行，可以设置 Windows 任务计划程序，让脚本每天定时自动执行。

### 操作步骤

1. 打开任务计划程序：在任务栏搜索框里输入"任务计划程序"，打开它

2. 创建基本任务：右侧点"创建基本任务"

3. 填写任务信息：
   - 名称写"每日代码自动提交"
   - 描述可选填，比如"每天自动提交代码改动"
   - 触发器选"每天"

4. 设置执行时间：比如每天晚上 10 点

5. 操作选"启动程序"，填入以下信息：
   - 程序：`powershell.exe`
   - 参数：`-ExecutionPolicy Bypass -File "C:\你的路径\auto-commit.ps1"`
   - 起始位置：`C:\你的路径`

6. 完成创建

设置完成后，每天到了设定的时间，Windows 会自动运行脚本。如果那天有改动就提交，没有改动就静默跳过。

### 用 Task Scheduler 的另一种方式

如果你用的是任务计划程序的完整版（不是基本任务），可以这样配：

```powershell
# 程序或脚本
powershell.exe

# 添加参数（整个写成一行）
-ExecutionPolicy Bypass -File "D:\MyProject\auto-commit.ps1" -Message "Daily auto commit"
```

## 注意事项

### 脚本放在仓库根目录

脚本必须放在 Git 仓库的根目录（就是有 `.git` 文件夹的那个目录），因为脚本是针对当前目录进行操作的。

### 脚本编码

保存时用 **UTF-8 with BOM** 编码，否则中文可能出现乱码。VS Code 的话右下角点编码可切换。

### 推送前提

脚本的 `-Push $true` 默认会执行 `git push`，但前提是该仓库已经设置了远程仓库地址。如果从来没 push 过，会报错。

### 没有改动时

脚本会检测到没有改动，直接退出，exit code 为 0，不算错误。这是预期行为。

## 常见问题

**提示"不是可识别的命令"**

确保 Git 已经安装且添加到系统 PATH。打开 PowerShell 验证 `git --version` 能正常输出版本号。

**推送时报需要认证**

说明远程仓库需要登录。如果用的是 SSH 地址但没有配 SSH 密钥，会走 HTTPS 认证。参考前一篇 SSH 配置指南解决。

**PowerShell 执行策略被禁止**

如果遇到"禁止运行脚本"之类的错误，用参数 `-ExecutionPolicy Bypass` 绕过策略限制，这就是为什么脚本调用推荐用这个参数。

**文件很多时执行慢**

`git add .` 会处理所有改动文件。如果仓库很大，可以考虑改成 `git add -u` 只追踪已修改和已删除的文件，不处理新文件。
