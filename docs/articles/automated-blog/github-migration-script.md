---

title: ==============================================================================
---

```sh
# ==============================================================================
# 脚本功能: (版本 2 - 配置文件驱动)
# 1. 检查并引导安装 Git for Windows.
# 2. 从 config.json 文件读取配置信息.
# 3. 克隆一个指定的公开仓库.
# 4. 将克隆的仓库推送到用户自己的新 GitHub 仓库.
# ==============================================================================

# --- 脚本初始化 ---
# 获取脚本所在的目录
$scriptPath = $PSScriptRoot

# 定义配置文件的路径
$configFile = Join-Path $scriptPath "config.json"

# --- 函数定义 ---

# 检查 Git 是否已安装
function Check-Git-Installed {
    try {
        git --version | Out-Null
        Write-Host "✅ Git 已经安装." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ 未检测到 Git." -ForegroundColor Yellow
        Write-Host "Git 是版本控制系统，是本脚本运行的必需软件。"
        $installChoice = Read-Host "是否现在打开浏览器下载 Git? (y/n)"
        if ($installChoice -eq 'y') {
            Write-Host "请在下载并完成安装后，重启 PowerShell 终端并重新运行此脚本。"
            Start-Process "https://git-scm.com/download/win"
        } else {
            Write-Host "脚本已终止。请先安装 Git 后再运行。"
        }
        return $false
    }
}

# --- 主逻辑开始 ---

Clear-Host
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "    GitHub 仓库迁移脚本 (配置文件模式)"
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host

# 1. 检查 Git 环境
if (-not (Check-Git-Installed)) {
    return
}

# 2. 新增：从配置文件读取信息
Write-Host "`n--- 步骤 1: 读取配置文件 ---" -ForegroundColor Yellow
if (-not (Test-Path $configFile)) {
    Write-Host "❌ 错误: 在脚本目录中未找到 'config.json' 文件。" -ForegroundColor Red
    Write-Host "请根据说明创建该文件并填入您的信息。"
    return
}

try {
    $config = Get-Content $configFile | ConvertFrom-Json
    Write-Host "✅ 配置文件 'config.json' 读取成功。" -ForegroundColor Green
}
catch {
    Write-Host "❌ 错误: 'config.json' 文件格式不正确，无法解析。" -ForegroundColor Red
    return
}

# 从配置中加载变量
$githubUsername   = $config.githubUsername
$patString        = $config.githubPat
$newRepoName      = $config.newRepoName
$sourceRepoUrl    = $config.sourceRepoUrl
$workDir          = $config.workingDirectory
$cloneDirName     = $sourceRepoUrl.Split('/')[-1].Replace(".git", "") # 从URL动态生成文件夹名

# 验证配置是否完整
if ([string]::IsNullOrWhiteSpace($githubUsername) -or [string]::IsNullOrWhiteSpace($patString) -or [string]::IsNullOrWhiteSpace($newRepoName)) {
    Write-Host "❌ 错误: 配置文件中的 'githubUsername', 'githubPat', 或 'newRepoName' 不能为空。" -ForegroundColor Red
    return
}

# 3. 开始执行 Git 操作
Write-Host "`n--- 步骤 2: 开始执行 Git 操作 ---" -ForegroundColor Yellow

# 确保工作目录存在
if (-not (Test-Path $workDir)) {
    Write-Host "工作目录 '$workDir' 不存在，正在创建..."
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
}
cd $workDir
Write-Host "操作目录: $workDir"

# 如果目标文件夹已存在，则先删除
if (Test-Path -Path $cloneDirName) {
    Write-Host "文件夹 '$cloneDirName' 已存在，正在删除..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $cloneDirName
    Write-Host "旧文件夹已成功删除。" -ForegroundColor Green
}

# 克隆源仓库
Write-Host "`n正在从 '$sourceRepoUrl' 克隆仓库..."
git clone $sourceRepoUrl
if (-not $?) { Write-Host "❌ 克隆源仓库失败。" -ForegroundColor Red; return }
Write-Host "✅ 源仓库克隆成功！" -ForegroundColor Green

cd $cloneDirName
if (-not $?) { Write-Host "❌ 无法进入仓库目录 '$cloneDirName'。" -ForegroundColor Red; return }

# 配置和推送
Write-Host "`n正在移除旧的远程仓库关联..."
git remote remove origin
Write-Host "✅ 旧关联已移除。" -ForegroundColor Green

$newRepoUrl = "https://github.com/$githubUsername/$newRepoName.git"
$newRepoUrlWithPat = "https://$githubUsername`:$patString@github.com/$githubUsername/$newRepoName.git"

Write-Host "`n正在关联到您的新仓库: $newRepoUrl"
git remote add origin $newRepoUrlWithPat
if (-not $?) { Write-Host "❌ 关联新仓库失败。" -ForegroundColor Red; return }
Write-Host "✅ 成功关联到您的新仓库！" -ForegroundColor Green

Write-Host "`n--- 步骤 3: 正在将代码推送到您的新仓库 ---" -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -eq "master") {
    Write-Host "检测到主分支为 'master'，正在重命名为 'main'..."
    git branch -m master main
}

git push -u origin --all
if (-not $?) {
    Write-Host "❌ 推送到新仓库失败。请检查 PAT 权限、仓库名称是否已存在且非空。" -ForegroundColor Red
    return
}

Write-Host "`n🎉 恭喜！操作成功完成！" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "请访问下面的地址，检查您的新仓库："
Write-Host $newRepoUrl
Write-Host "=============================================" -ForegroundColor Cyan

cd $workDir