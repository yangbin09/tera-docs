---
title: 仓库迁移脚本完整源码
sidebarTitle: 仓库迁移脚本
---

# 仓库迁移脚本完整源码

以下是 migrate-repo.ps1 的完整可运行源码，可以直接复制使用。配合 config.json 配置文件一起放在同一目录下。

## migrate-repo.ps1

```powershell
# ============================================================
# GitHub 仓库迁移脚本
# 版本：2.0（配置文件驱动模式）
#
# 功能：
#   1. 检查 Git 环境，引导安装
#   2. 从 config.json 读取配置信息
#   3. 克隆源仓库（含完整提交历史）
#   4. 在用户 GitHub 账户下创建新仓库
#   5. 推送代码和 tags 到新仓库
#
# 使用方法：
#   1. 与 config.json 放同一目录
#   2. 填写 config.json
#   3. PowerShell 中运行 .\migrate-repo.ps1
# ============================================================

# ---------- 函数定义 ----------

# 检查 Git 是否已安装
function Check-Git-Installed {
    try {
        git --version | Out-Null
        Write-Host "[OK] Git 已安装" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[WARN] 未检测到 Git" -ForegroundColor Yellow
        $choice = Read-Host "是否现在下载 Git？(y/n)"
        if ($choice -eq 'y') {
            Start-Process "https://git-scm.com/download/win"
            Write-Host "下载完成后请重新运行此脚本" -ForegroundColor Cyan
        }
        return $false
    }
}

# ---------- 主逻辑 ----------

# 初始化
$scriptPath = $PSScriptRoot
$configFile = Join-Path $scriptPath "config.json"

Clear-Host
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  GitHub 仓库迁移脚本" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Git 环境
if (-not (Check-Git-Installed)) {
    return
}

# 2. 读取配置文件
Write-Host "--- 步骤 1: 读取配置文件 ---" -ForegroundColor Yellow
if (-not (Test-Path $configFile)) {
    Write-Host "[ERROR] 未找到 config.json 文件" -ForegroundColor Red
    Write-Host "请确保 config.json 与脚本在同一目录下" -ForegroundColor Red
    return
}

try {
    $config = Get-Content $configFile | ConvertFrom-Json
    Write-Host "[OK] config.json 读取成功" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] config.json 格式不正确，无法解析" -ForegroundColor Red
    return
}

# 加载配置
$githubUsername = $config.githubUsername
$patString = $config.githubPat
$newRepoName = $config.newRepoName
$sourceRepoUrl = $config.sourceRepoUrl
$workDir = $config.workingDirectory

# 验证配置完整性
if ([string]::IsNullOrWhiteSpace($githubUsername) -or
    [string]::IsNullOrWhiteSpace($patString) -or
    [string]::IsNullOrWhiteSpace($newRepoName)) {
    Write-Host "[ERROR] githubUsername、githubPat 或 newRepoName 不能为空" -ForegroundColor Red
    return
}

# 3. 准备工作目录
Write-Host ""
Write-Host "--- 步骤 2: 准备工作目录 ---" -ForegroundColor Yellow
if (-not (Test-Path $workDir)) {
    Write-Host "创建工作目录: $workDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
}
Set-Location $workDir
Write-Host "工作目录: $workDir"

# 从 URL 提取仓库文件夹名
$cloneDirName = $sourceRepoUrl.Split('/')[-1].Replace(".git", "")

# 如果目标文件夹存在则删除
if (Test-Path $cloneDirName) {
    Write-Host "删除旧文件夹: $cloneDirName" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $cloneDirName
}

# 4. 克隆源仓库
Write-Host ""
Write-Host "--- 步骤 3: 克隆源仓库 ---" -ForegroundColor Yellow
Write-Host "从 $sourceRepoUrl 克隆..."
git clone $sourceRepoUrl
if (-not $?) {
    Write-Host "[ERROR] 克隆失败" -ForegroundColor Red
    return
}
Write-Host "[OK] 源仓库克隆成功" -ForegroundColor Green

Set-Location $cloneDirName

# 5. 配置新仓库远程地址
Write-Host ""
Write-Host "--- 步骤 4: 配置新仓库 ---" -ForegroundColor Yellow
git remote remove origin

$newRepoUrl = "https://github.com/$githubUsername/$newRepoName.git"
$newRepoUrlWithPat = "https://$githubUsername`:$patString@github.com/$githubUsername/$newRepoName.git"

Write-Host "新仓库地址: $newRepoUrl"
git remote add origin $newRepoUrlWithPat
if (-not $?) {
    Write-Host "[ERROR] 关联新仓库失败" -ForegroundColor Red
    return
}
Write-Host "[OK] 已关联到新仓库" -ForegroundColor Green

# 6. 推送
Write-Host ""
Write-Host "--- 步骤 5: 推送到新仓库 ---" -ForegroundColor Yellow

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -eq "master") {
    Write-Host "检测到 master 分支，重命名为 main..." -ForegroundColor Yellow
    git branch -m master main
}

git push -u origin --all
if (-not $?) {
    Write-Host "[ERROR] 推送失败，请检查 PAT 权限和仓库名" -ForegroundColor Red
    return
}

git push -u origin --tags
Write-Host "[OK] 代码和标签推送完成" -ForegroundColor Green

# 7. 完成
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  迁移完成！" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "新仓库地址:" -ForegroundColor Cyan
Write-Host $newRepoUrl -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Green
