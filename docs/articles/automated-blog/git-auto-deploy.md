---

title: --- 1. 初始化和环境设置 ---
---


### 提交脚本 (`auto-commit.ps1`)

这个新版本整合了所有逻辑，增加了智能检查和更清晰的反馈。

PowerShell

```sh
<#
.SYNOPSIS
    一个智能的 Git 自动提交流程脚本。

.DESCRIPTION
    该脚本会自动暂存、提交并可选择性地推送当前目录下的所有更改。
    它会智能地检查是否存在待提交的更改，避免创建空的提交。
    无需任何外部脚本依赖（如 Python）。

.PARAMETER Message
    可选的提交信息。如果未提供，将自动生成一个带有时间戳的消息。

.PARAMETER Push
    一个布尔开关，决定是否在提交后执行 'git push'。默认为 $true (执行推送)。

.EXAMPLE
    .\auto-commit.ps1
    # 使用默认消息自动提交并推送。

.EXAMPLE
    .\auto-commit.ps1 -Message "feat: Add new user validation feature"
    # 使用自定义消息提交并推送。

.EXAMPLE
    .\auto-commit.ps1 -Message "Fix critical bug" -Push $false
    # 使用自定义消息提交，但不执行推送。

.EXAMPLE
    .\auto-commit.ps1 -Verbose
    # 在执行过程中显示详细的调试信息。
#>
param(
    [string]$Message,
    [bool]$Push = $true
)

# --- 1. 初始化和环境设置 ---
# 获取脚本所在的目录，并将其设置为当前工作目录。$PSScriptRoot 是一个可靠的自动变量。
$scriptDir = $PSScriptRoot
Set-Location $scriptDir

Write-Host "🚀 Starting Git auto-commit process in '$scriptDir'" -ForegroundColor Green
Write-Verbose "VERBOSE: Script running in Verbose mode."

# --- 2. 检查是否为 Git 仓库 ---
Write-Verbose "VERBOSE: Checking if '$scriptDir' is a valid Git repository..."
# 使用 git rev-parse 检查，这是一个安静且可靠的方式
git rev-parse --is-inside-work-tree | Out-Null
if (-not $?) {
    Write-Host "❌ ERROR: This directory is not a Git repository. Aborting." -ForegroundColor Red
    exit 1
}
Write-Verbose "VERBOSE: Git repository confirmed."

# --- 3. 检查是否有待提交的更改 ---
Write-Verbose "VERBOSE: Checking for pending changes to commit..."
# 'git status --porcelain' 会在有更改时输出内容，否则为空。这是自动化检查的最佳方式。
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "✅ No changes detected. Nothing to commit." -ForegroundColor Yellow
    exit 0 # 正常退出，因为没有错误
}
Write-Verbose "VERBOSE: Changes detected. Proceeding with commit."
Write-Host "Changes detected:"
Write-Host $gitStatus -ForegroundColor Gray

# --- 4. 确定提交信息 ---
if ([string]::IsNullOrWhiteSpace($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "Auto commit at $timestamp"
    Write-Host "No commit message provided. Using default: '$Message'" -ForegroundColor Cyan
} else {
    Write-Host "Using provided commit message: '$Message'" -ForegroundColor Cyan
}

# --- 5. 执行 Git 操作 ---
try {
    # 暂存所有更改
    Write-Host "Executing 'git add .'"
    git add .
    if (-not $?) { throw "Failed to stage files with 'git add .'" }

    # 提交更改
    Write-Host "Executing 'git commit'..."
    # 使用 --% 停止 PowerShell 解析，确保消息中的特殊字符被正确传递
    git commit -m "$Message"
    if (-not $?) { throw "Failed to commit changes with 'git commit'." }
    
    Write-Host "✅ Commit successful!" -ForegroundColor Green

    # 推送更改 (如果 $Push 为 $true)
    if ($Push) {
        Write-Host "Executing 'git push'..."
        git push
        if (-not $?) { throw "Failed to push changes to remote with 'git push'." }
        Write-Host "✅ Push successful!" -ForegroundColor Green
    } else {
        Write-Host "Skipping 'git push' as requested." -ForegroundColor Yellow
    }

    Write-Host "🎉 Git process completed successfully." -ForegroundColor Green
}
catch {
    # 捕获任何在 try 块中发生的错误
    Write-Host "❌ ERROR: An error occurred during the Git process." -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

---

### 脚本说明文档

## Git 自动提交脚本使用说明

### 1. 功能简介 📝

这是一个强大的 PowerShell 脚本，用于自动化处理 Git 的 `add`, `commit`, 和 `push` 流程。它被设计用于简化日常的提交工作，或在自动化任务（如定时备份代码）中稳定运行。

### 2. 核心特点 ✨

- **纯粹 & 独立**: **完全移除对 Python 的依赖**，仅需 PowerShell 和 Git 即可运行，部署极为简单。
    
- **智能状态检查**: 在执行任何操作前，脚本会**自动检查**工作区是否存在文件变更。如果没有变更，它会礼貌地退出，避免创建无意义的空提交。
    
- **仓库验证**: 脚本会首先确认其所在的目录是一个有效的 Git 仓库，防止在错误的位置执行命令。
    
- **灵活的参数**:
    
    - 你可以提供自定义的提交信息。
        
    - 你可以选择在提交后是否执行 `git push`。
        
- **清晰的输出**: 脚本的每一步都有彩色的日志输出，让你清楚地知道它正在做什么，成功或失败都一目了然。
    
- **健壮的错误处理**: 任何 Git 命令执行失败都会被捕获，并以明确的错误信息终止脚本。
    

### 3. 环境要求 💻

- **Windows 操作系统**
    
- **PowerShell 5.1** 或更高版本 (Windows 10/11 自带)
    
- **Git for Windows**: 必须已安装，并且 `git.exe` 所在的路径已添加到系统的 `PATH` 环境变量中。
    

### 4. 如何使用 🚀

1. **保存脚本**: 将上面的代码保存为一个名为 `auto-commit.ps1` 的文件，并将其放置在你的 **Git 仓库的根目录**下。
    
2. **打开终端**: 在该仓库目录中，右键点击并选择“在终端中打开”，或通过 `cd` 命令导航到该目录。
    
3. **执行脚本**:
    
    - **基本用法 (自动消息并推送)**
        
        PowerShell
        
        ```
        .\auto-commit.ps1
        ```
        
    - **使用自定义消息**
        
        PowerShell
        
        ```
        .\auto-commit.ps1 -Message "feat: Implement user login page"
        ```
        
    - **仅提交，不推送**
        
        PowerShell
        
        ```
        .\auto-commit.ps1 -Push $false
        ```
        
    - **自定义消息且不推送**
        
        PowerShell
        
        ```
        .\auto-commit.ps1 -Message "docs: Update README file" -Push $false
        ```
        
    - **查看详细过程 (调试模式)**
        
        PowerShell
        
        ```
        .\auto-commit.ps1 -Verbose
        ```
        

### 5. 自动化部署 (使用任务计划程序) 🕒

你可以设置一个定时任务，让 Windows 每天自动为你提交代码。

1. 打开 **任务计划程序 (Task Scheduler)**。
    
2. 在右侧操作栏点击 **“创建任务...”**。
    
3. **常规**选项卡:
    
    - **名称**: "每日代码自动提交"
        
    - 勾选 **“不管用户是否登录都运行”** 和 **“使用最高权限运行”**。
        
4. **触发器**选项卡:
    
    - 点击 **“新建”**，设置一个你希望的执行时间，例如每天晚上 10 点。
        
5. **操作**选项卡:
    
    - 点击 **“新建”**。
        
    - **程序或脚本**: `powershell.exe`
        
    - **添加参数 (可选)**: `-ExecutionPolicy Bypass -File "C:\path\to\your\repo\auto-commit.ps1"`
        
        - 请务必将路径替换为你的脚本的**完整路径**。
            
        - 如果需要自定义提交信息，可以这样写: `-File "C:\path\to\your\repo\auto-commit.ps1" -Message "Daily backup"`
            
    - **起始于 (可选)**: `C:\path\to\your\repo` (填写你的仓库根目录路径)。
        

### 6. 故障排查 ❓

- **问题**: 提示 `git` 不是可识别的命令。
    
    - **原因**: Git 没有被正确安装或添加到系统环境变量 `PATH` 中。
        
    - **解决**: 重新安装 Git for Windows，并确保在安装过程中勾选了将其添加到 PATH 的选项。
        
- **问题**: `git push` 失败，提示需要认证。
    
    - **原因**: 你的 Git 没有配置凭据缓存或 SSH 密钥。
        
    - **解决**: 建议配置 SSH 密钥连接 GitHub，一劳永逸。或者，配置 Git 凭据管理器来缓存你的密码/令牌。
        
- **问题**: 脚本运行了，但提示 "No changes detected"。
    
    - **原因**: 这是一个正常的功能。你的工作目录中确实没有任何文件被修改、添加或删除。
        
    - **解决**: 这是预期行为，无需处理。