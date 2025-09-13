
# GitHub 仓库迁移脚本使用说明

## 1. 功能简介

本工具包含一个 PowerShell 脚本 (`migrate-repo.ps1`) 和一个配置文件 (`config.json`)，旨在自动化地完成以下任务：

1. 从一个公开的 GitHub 仓库地址（源仓库）克隆所有代码和提交历史。
    
2. 在您自己的 GitHub 账户下创建一个新的私有或公有仓库。
    
3. 将克隆下来的完整内容推送到您的新仓库中。
    

这种方式非常适合用于创建个人备份、fork 一个项目作为自己的开发起点，或将学习资料完整地保存到自己的账户下。

## 2. 环境要求 (Prerequisites)

在运行此脚本之前，请确保您的 Windows 电脑满足以下条件：

- **操作系统**: Windows 10 或更高版本。
    
- **Git for Windows**: 脚本会自动检测 Git 是否安装。如果未安装，它会提示并引导您到 [官方网站](https://git-scm.com/download/win) 下载。请在安装完成后重启终端。
    
- **GitHub 账户**: 您需要一个自己的 GitHub 账户。
    
- **GitHub 个人访问令牌 (PAT)**: 由于 GitHub 不再支持密码进行 Git 操作，您必须创建一个 PAT。
    
    - 前往 GitHub **[创建新令牌页面](https://github.com/settings/tokens/new)**。
        
    - **Note**: 给令牌起一个描述性的名字，例如 `repo-migration-script`。
        
    - **Expiration**: 根据您的安全需求设置一个过期时间。
        
    - **Scopes**: **必须** 勾选 `repo` 权限。这允许脚本创建仓库和推送代码。
        
    - **生成令牌**: 点击页面底部的 "Generate token" 按钮。
        
    - **立即复制并保存**：**请立即复制生成的令牌 (例如 `ghp_xxxxxxxx`) 并妥善保管**，因为这个令牌只会显示一次。后续需要将它填入配置文件。
        

## 3. 配置文件 (`config.json`)

所有用户特定的信息都存储在 `config.json` 文件中，以避免在脚本中硬编码敏感信息。请在运行脚本前，用文本编辑器（如 VS Code, Notepad++ 或记事本）打开并修改此文件。

**文件结构与说明:**

JSON

```
{
  "githubUsername": "Your-GitHub-Username",
  "githubPat": "ghp_YourPersonalAccessTokenGoesHere",
  "newRepoName": "my-gushici-docs-from-config",
  "sourceRepoUrl": "https://github.com/yangbin09/gushici-intelligent-docs.git",
  "workingDirectory": "C:\\MyGitProjects"
}
```

- `githubUsername`: **(必填)** 您的 GitHub 用户名。
    
- `githubPat`: **(必填)** 您在第二步中创建的个人访问令牌 (PAT)。
    
- `newRepoName`: **(必填)** 您希望在自己账户下创建的新仓库的名称。请使用符合 GitHub 仓库命名规范的名称（例如，不要包含空格）。
    
- `sourceRepoUrl`: **(必填)** 您想要克隆的源仓库的 URL 地址。
    
- `workingDirectory`: **(必填)** 一个本地文件夹路径，脚本将在此路径下执行克隆操作。如果该文件夹不存在，脚本会自动创建。**注意**: 路径中的反斜杠 `\` 需要写成双反斜杠 `\\` (例如 `C:\\MyGitProjects`) 或者单斜杠 `/` (例如 `C:/MyGitProjects`)。
    

> ⚠️ 重要安全警告
> 
> config.json 文件包含您的个人访问令牌，切勿将此文件上传到任何公开或私有的 Git 仓库中。为防止意外提交，建议在项目文件夹中创建一个 .gitignore 文件，并添加一行 config.json。

## 4. 使用步骤

1. **准备文件**: 将 `migrate-repo.ps1` 和 `config.json` 这两个文件放在同一个文件夹下。
    
2. **编辑配置**: 按照第 3 节的说明，填写 `config.json` 文件中的所有字段。
    
3. **以管理员身份运行终端**:
    
    - 在 Windows 搜索栏中输入 "PowerShell"。
        
    - 右键点击 "Windows PowerShell"，选择 **"以管理员身份运行"**。
        
4. **导航到脚本目录**: 在打开的 PowerShell 窗口中，使用 `cd` 命令切换到您存放脚本和配置文件的目录。
    
    PowerShell
    
    ```
    # 示例: 如果您的文件存放在 D:\Scripts 文件夹
    cd D:\Scripts
    ```
    
5. **执行脚本**: 输入以下命令并按 Enter 键运行脚本。
    
    PowerShell
    
    ```
    .\migrate-repo.ps1
    ```
    
6. **查看结果**: 脚本会自动执行所有步骤。如果一切顺利，您将在最后看到成功信息以及指向您新创建的 GitHub 仓库的链接。您可以访问该链接进行检查。
    

## 5. 常见问题与解决方案 (Troubleshooting)

- **错误: "未检测到 Git"**
    
    - **原因**: 您的系统中没有安装 Git，或者没有正确添加到系统路径中。
        
    - **解决方案**: 按照脚本提示，访问 Git 官网下载并安装。安装时请使用推荐的默认设置，特别是要确保 Git 已被添加到系统 PATH 中。安装完成后，**必须关闭并重新打开** PowerShell 窗口。
        
- **错误: "在脚本目录中未找到 'config.json' 文件"**
    
    - **原因**: `config.json` 文件与 `migrate-repo.ps1` 不在同一个目录下，或者文件名不正确。
        
    - **解决方案**: 确保两个文件在同一文件夹内，并且文件名拼写完全正确。
        
- **错误: "'config.json' 文件格式不正确，无法解析"**
    
    - **原因**: `config.json` 的内容不符合 JSON 语法。常见错误包括：缺少逗号、多了逗号、引号使用了中文引号等。
        
    - **解决方案**: 仔细检查文件内容，确保所有字符串都用双引号包裹，键值对之间用冒号分隔，条目之间用逗号分隔（最后一个条目后不能有逗号）。
        
- **错误: "推送到新仓库失败"**
    
    - **原因 1**: 您的个人访问令牌 (PAT) 不正确或已过期。
        
        - **解决方案**: 重新生成一个 PAT，并确保其未过期且具有完整的 `repo` 权限。然后更新 `config.json` 文件。
            
    - **原因 2**: 您在 `newRepoName` 中指定的仓库在您的 GitHub 上已经存在且包含文件。
        
        - **解决方案**: 在 `config.json` 中为 `newRepoName` 更换一个新名称，或者登录 GitHub 删除已存在的同名仓库后再试。
            
    - **原因 3**: 网络问题。
        
        - **解决方案**: 检查您的网络连接是否可以访问 GitHub。