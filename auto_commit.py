#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动Git提交脚本
功能：自动添加、提交并推送代码到远程仓库，包含冲突处理
使用方法：python auto_commit.py [提交信息]
"""

import subprocess
import sys
import os
from datetime import datetime

def run_command(command, check=True):
    """执行命令并返回结果"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding='utf-8')
        if check and result.returncode != 0:
            print(f"❌ 命令执行失败: {command}")
            print(f"错误信息: {result.stderr}")
            return False, result.stderr
        return True, result.stdout
    except Exception as e:
        print(f"❌ 执行命令时发生异常: {e}")
        return False, str(e)

def check_git_status():
    """检查Git状态"""
    print("📋 检查Git状态...")
    success, output = run_command("git status --porcelain")
    if not success:
        return False
    
    if not output.strip():
        print("✅ 工作目录干净，没有需要提交的更改")
        return False
    
    print(f"📝 发现以下更改:\n{output}")
    return True

def pull_latest_changes():
    """拉取最新代码"""
    print("🔄 拉取远程最新代码...")
    success, output = run_command('git -c http.proxy="" -c https.proxy="" pull origin master', check=False)
    
    if not success:
        print("❌ 拉取代码失败")
        return False
    
    if "CONFLICT" in output:
        print("⚠️  发现合并冲突，需要手动解决")
        print("请解决冲突后重新运行脚本")
        return False
    
    print("✅ 成功拉取最新代码")
    return True

def add_all_changes():
    """添加所有更改到暂存区"""
    print("📦 添加所有更改到暂存区...")
    success, _ = run_command("git add .")
    if success:
        print("✅ 成功添加所有更改")
    return success

def commit_changes(commit_message):
    """提交更改"""
    print(f"💾 提交更改: {commit_message}")
    success, _ = run_command(f'git commit -m "{commit_message}" --no-verify')
    if success:
        print("✅ 成功提交更改")
    return success

def push_to_remote():
    """推送到远程仓库（HTTPS失败时自动回退到SSH）"""
    print("🚀 推送到远程仓库...")
    success, output = run_command('git -c http.proxy="" -c https.proxy="" push origin master')

    # 首次尝试失败，判断是否为网络连通问题
    if not success:
        lower = output.lower() if isinstance(output, str) else ""
        net_errors = ("couldn't connect" in lower or
                      "failed to connect" in lower or
                      "timeout" in lower or
                      "timed out" in lower or
                      "ssl" in lower or
                      "could not resolve host" in lower)
        if net_errors:
            print("🔁 检测到HTTPS网络不可用，尝试使用SSH方式推送...")

            # 解析SSH远程地址（从origin推导）
            def get_ssh_remote_url():
                ok, remote = run_command('git config --get remote.origin.url', check=False)
                if not ok:
                    return None
                remote = remote.strip()
                if remote.startswith('git@github.com:'):
                    return remote
                if remote.startswith('https://github.com/') or remote.startswith('http://github.com/'):
                    path = remote.split('github.com/')[-1]
                    return f'git@github.com:{path}'
                return None

            ssh_url = get_ssh_remote_url()
            if ssh_url:
                print(f"🔐 使用SSH推送: {ssh_url}")
                success, output2 = run_command(f'git push {ssh_url} master')
                if success:
                    print("✅ 成功推送到远程仓库")
                    return True
                else:
                    print("❌ SSH推送失败")
                    print(output2)
                    return False
            else:
                print("⚠️ 未能解析SSH远程地址，推送失败")
                return False

        # 非网络问题，可能是被rejected
        if "rejected" in lower:
            print("❌ 推送被拒绝，可能是远程有新的提交")
            print("🔄 尝试重新拉取并合并...")
            if pull_latest_changes():
                print("🚀 重新推送到远程仓库...")
                success, _ = run_command('git -c http.proxy="" -c https.proxy="" push origin master')
                if success:
                    print("✅ 成功推送到远程仓库")
                    return True
            return False

        # 其他失败情况
        return False

    # 首次推送成功
    print("✅ 成功推送到远程仓库")
    return True

def main():
    """主函数"""
    print("🚀 开始自动Git提交流程...")
    print("=" * 50)
    
    # 检查是否在Git仓库中
    if not os.path.exists('.git'):
        print("❌ 当前目录不是Git仓库")
        sys.exit(1)
    
    # 获取提交信息
    if len(sys.argv) > 1:
        commit_message = ' '.join(sys.argv[1:])
    else:
        commit_message = f"自动提交 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    print(f"📝 提交信息: {commit_message}")
    print("=" * 50)
    
    # 检查是否有更改需要提交
    if not check_git_status():
        sys.exit(0)
    
    # 拉取最新代码
    if not pull_latest_changes():
        sys.exit(1)
    
    # 添加所有更改
    if not add_all_changes():
        sys.exit(1)
    
    # 提交更改
    if not commit_changes(commit_message):
        sys.exit(1)
    
    # 推送到远程
    if not push_to_remote():
        sys.exit(1)
    
    print("=" * 50)
    print("🎉 自动提交流程完成！")
    print(f"✅ 提交信息: {commit_message}")
    print("✅ 已成功推送到远程仓库")

if __name__ == "__main__":
    main()