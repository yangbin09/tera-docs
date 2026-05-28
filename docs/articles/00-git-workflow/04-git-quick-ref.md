---
title: Git 常用命令速查
sidebarTitle: 04 Git 常用命令速查
---

# Git 常用命令速查

日常使用中最常用的 Git 命令，整理成速查表形式，需要时直接翻查。

## 基础操作

### 克隆仓库

```powershell
# HTTPS 方式
git clone https://github.com/用户名/仓库名.git

# SSH 方式（推荐，配好 SSH 密钥后用这个）
git clone git@github.com:用户名/仓库名.git

# 克隆到指定文件夹
git clone https://github.com/用户名/仓库名.git my-folder
```

### 查看状态

```powershell
git status
git status -s
```

### 提交改动

```powershell
# 暂存所有改动
git add .

# 暂存特定文件
git add index.html style.css

# 暂存已追踪文件的改动（不包括新文件）
git add -u

# 提交
git commit -m "feat: 添加用户模块"

# 提交所有已追踪文件的改动
git commit -am "fix: 修复登录bug"

# 修改最后一次提交的消息
git commit --amend -m "新的提交消息"
```

### 推送

```powershell
git push
git push origin main
git push -u origin main
git push --force origin main
```

### 拉取

```powershell
git pull
git fetch
```

## 分支操作

```powershell
git branch
git branch -a
git branch 新分支名
git checkout 分支名
git checkout -b 新分支名
git checkout -
git branch -d 分支名
git branch -D 分支名
git branch -m 新分支名
```

## 远程仓库

```powershell
git remote -v
git remote add origin https://github.com/用户名/仓库名.git
git remote set-url origin git@github.com:用户名/仓库名.git
```

## 查看历史

```powershell
git log --oneline
git log
git log -n 5
git show 提交哈希
git diff
git diff --staged
```

## 撤销

```powershell
git checkout -- 文件名
git restore 文件名
git reset HEAD 文件名
git reset --soft HEAD~1
git reset HEAD~1
git reset --hard HEAD~1
```

## 暂存

```powershell
git stash
git stash push -m "临时保存"
git stash list
git stash apply
git stash pop
git stash drop stash@{0}
```

## 标签

```powershell
git tag v1.0.0
git tag v0.9.0 提交哈希
git tag
git tag -d v1.0.0
git push origin v1.0.0
git push --tags
```

## 合并

```powershell
git merge 分支名
git merge --abort
git rebase main
```

## 场景命令

```powershell
# 一行完成提交并推送
git add . && git commit -m "消息" && git push

# 切换到远程分支并追踪
git checkout -b 本地分支名 origin/远程分支名

# 删除远程分支
git push origin --delete 远程分支名

# 忽略文件（先从仓库移除）
git rm --cached 文件名
git rm --cached -r 文件夹名
```

## 常见错误

nothing to commit, working tree clean——没有改动，正常。

Your branch is ahead of origin/main by N commits——本地有提交还没推送，用 git push。

Merge conflict——手动解决冲突后 git add 和 git commit。

fatal: refusing to merge unrelated histories——两个独立仓库第一次合并时用 git merge 分支名 --allow-unrelated-histories。
