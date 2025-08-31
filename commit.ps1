<#
.SYNOPSIS
    自动Git提交PowerShell脚本
.DESCRIPTION
    自动添加、提交并推送代码到远程仓库，包含冲突处理
.PARAMETER Message
    提交信息，如果不提供则使用默认时间戳
.EXAMPLE
    .\commit.ps1 "修复bug"
    .\commit.ps1
#>

param(
    [string]$Message = ""
)

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 如果没有提供提交信息，使用默认信息
if ([string]::IsNullOrEmpty($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "自动提交 - $timestamp"
}

Write-Host "🚀 开始自动Git提交流程..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "📝 提交信息: $Message" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Yellow

try {
    # 调用Python脚本
    python auto_commit.py $Message
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 提交成功完成！" -ForegroundColor Green
    } else {
        Write-Host "❌ 提交过程中出现错误" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "❌ 执行过程中发生异常: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}