---
title: 00 Git 工作流
sidebarTitle: 00 Git 工作流
---

# Git 工作流

整理 Git 日常操作、自动化脚本、仓库迁移和 GitHub 配置相关的笔记。按顺序阅读即可掌握从初始配置到日常使用再到批量迁移的完整流程。

## 内容导航

### [01 GitHub SSH 配置](./01-github-ssh-setup)  ⭐ 推荐优先配置

配好 SSH 密钥后，所有 GitHub 操作无需输入密码，包括 clone、push、pull。配一次，管很久。

**解决**：每次 push 都要输密码 / Token 的烦恼。

### [02 Git 自动提交](./02-git-auto-commit)

一个 PowerShell 脚本，写完代码自动检查并提交，支持时间戳消息、定时任务和自定义提交信息。

**解决**：懒得每次手动 git add → commit → push。

### [03 仓库迁移指南](./03-repo-migration-guide)

将公开仓库完整复制到个人账户，保留全部提交历史和标签。配合迁移脚本全自动完成。

**解决**：想把别人的项目 fork 过来作为自己的开发起点。

### [04 Git 常用命令速查](./04-git-quick-ref)

日常最常用的 Git 命令速查表，涵盖基础操作、分支、撤销、暂存等场景。需要时直接翻查。

**解决**：命令记不住，翻文档太麻烦。

## 快速开始

1. **第一次使用**：先看 [SSH 配置](./01-github-ssh-setup)，省去后续所有操作的密码输入
2. **日常开发**：用 [自动提交脚本](./02-git-auto-commit) 减少重复操作
3. **需要迁移仓库**：参考 [迁移指南](./03-repo-migration-guide) + [脚本源码](./05-repo-migration-script)
4. **命令忘了**：[速查表](./04-git-quick-ref) 直接搜

## 扩展阅读

- [GitHub CLI 工具](https://cli.github.com/) — 命令行管理 issues、PRs
- [Git 官方文档](https://git-scm.com/doc) — 最权威的参考
