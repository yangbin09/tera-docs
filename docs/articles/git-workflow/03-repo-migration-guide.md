---
title: GitHub 仓库迁移指南
sidebarTitle: 03 仓库迁移

---

# GitHub 仓库迁移指南

想把一个公开的 GitHub 仓库完整复制到自己的账户下，包括所有提交历史，可以用仓库迁移脚本全自动完成。适合用来创建个人备份，或者 fork 一个项目作为自己的开发起点。

## 这个脚本能做什么

- 检查 Git 环境，自动引导安装
- 从配置文件读取所有参数，不用每次手动输入
- 克隆源仓库的所有内容和提交历史
- 在你的 GitHub 账户下创建新仓库
- 推送到新仓库，保留完整的提交记录

## 开始之前

### 准备 GitHub 个人访问令牌（PAT）

GitHub 从 2021 年起不再支持密码方式推送，必须用 Personal Access Token。

创建步骤：

1. 打开 github.com/settings/tokens/new
2. Note：写个描述，比如 repo-migration
3. Expiration：选择一个过期时间，建议 30 天以上
4. Select scopes：勾选 repo（完整仓库控制权）
5. 点 Generate token
6. 立刻复制保存，这个令牌只会显示这一次

### 准备配置文件

脚本依赖一个 config.json 文件存放所有配置参数。

在和脚本同一个目录下创建 config.json，内容如下：

```json
{
  "githubUsername": "你的GitHub用户名",
  "githubPat": "ghp_你的令牌",
  "newRepoName": "新仓库名称",
  "sourceRepoUrl": "https://github.com/源作者/源仓库.git",
  "workingDirectory": "C:\GitProjects"
}
```

逐个字段说明：

- githubUsername：你的 GitHub 登录用户名
- githubPat：刚才创建的个人访问令牌
- newRepoName：你想在新账户下创建的仓库名，不能有空格
- sourceRepoUrl：你要复制的源仓库地址，必须是 .git 结尾的完整地址
- workingDirectory：本地工作目录，脚本会在这个路径下执行克隆操作

安全提醒：config.json 里包含你的 PAT，是敏感信息。建议在仓库目录下新建一个 .gitignore 文件，写入一行 config.json，防止不小心把它提交上去。

## 脚本内容

复制以下代码，保存为 migrate-repo.ps1，和 config.json 放在同一个目录：

```powershell
# ============================================================
# GitHub 仓库迁移脚本
# 版本：2.0（配置文件驱动模式）
# ============================================================

$scriptPath = $PSScriptRoot
$configFile = Join-Path $scriptPath "config.json"

function Check-Git-Installed {
    try {
        git --version | Out-Null
        Write-Host "Git 已安装。" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "未检测到 Git。" -ForegroundColor Yellow
        $choice = Read-Host "是否下载 Git？(y/n)"
        if ($choice -eq 'y') {
            Start-Process "https://git-scm.com/download/win"
        }
        return $false
    }
}

Clear-Host
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "    GitHub 仓库迁移脚本" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if (-not (Check-Git-Installed)) { return }

Write-Host "--- 读取配置文件 ---" -ForegroundColor Yellow
if (-not (Test-Path $configFile)) {
    Write-Host "错误：未找到 config.json 文件。" -ForegroundColor Red
    return
}

try {
    $config = Get-Content $configFile | ConvertFrom-Json
    Write-Host "配置文件读取成功。" -ForegroundColor Green
}
catch {
    Write-Host "错误：config.json 格式不正确。" -ForegroundColor Red
    return
}

$githubUsername = $config.githubUsername
$patString = $config.githubPat
$newRepoName = $config.newRepoName
$sourceRepoUrl = $config.sourceRepoUrl
$workDir = $config.workingDirectory

if ([string]::IsNullOrWhiteSpace($githubUsername) -or
    [string]::IsNullOrWhiteSpace($patString) -or
    [string]::IsNullOrWhiteSpace($newRepoName)) {
    Write-Host "错误：配置不完整。" -ForegroundColor Red
    return
}

if (-not (Test-Path $workDir)) {
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
}
Set-Location $workDir

$cloneDirName = $sourceRepoUrl.Split('/')[-1].Replace(".git", "")
if (Test-Path $cloneDirName) {
    Remove-Item -Recurse -Force $cloneDirName
}

Write-Host "--- 克隆源仓库 ---" -ForegroundColor Yellow
git clone $sourceRepoUrl
if (-not $?) { Write-Host "克隆失败。" -ForegroundColor Red; return }
Set-Location $cloneDirName

git remote remove origin
$newRepoUrl = "https://github.com/$githubUsername/$newRepoName.git"
$newRepoUrlWithPat = "https://$githubUsername`:$patString@github.com/$githubUsername/$newRepoName.git"
git remote add origin $newRepoUrlWithPat

Write-Host "--- 推送 ---" -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -eq "master") { git branch -m master main }

git push -u origin --all
git push -u origin --tags

Write-Host ""
Write-Host "迁移完成！新仓库：$newRepoUrl" -ForegroundColor Green
```

## 使用步骤

1. 把 migrate-repo.ps1 和 config.json 放在同一个文件夹
2. 按前面说明填写 config.json 的各项参数
3. 打开 PowerShell，cd 到脚本所在目录
4. 运行：.\migrate-repo.ps1

## 常见问题

错误：未检测到 Git——确保 Git 已安装并添加到 PATH。

错误：config.json 格式不正确——JSON 要求所有字符串用双引号，最后一个条目后不能有逗号。

错误：推送到新仓库失败——检查 PAT 是否有效、PAT 是否勾选了 repo 权限、新仓库名是否已被占用。

## 迁移后验证

脚本运行完毕后，打开浏览器访问最后输出的新仓库地址，确认所有文件和提交历史都完整。
