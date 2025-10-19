
# 【Windows 环境】使用 pnpm 和淘宝镜像安装 n8n 

## 简介

n8n 是一款非常强大的开源工作流自动化工具，它允许你通过可视化界面连接各种应用程序（如飞书、钉钉、MySQL、Airtable、OpenAI 等），实现复杂的自动化流程。它就像是你可以自己部署的、功能更强大的 Zapier。

本教程将手把手带你**在 Windows 10/11 操作系统**上，使用 `Node.js` 环境来安装 n8n。我们将采用目前最高效的组合：

- **nvm-windows**：用来管理 Node.js 版本，避免版本冲突。
    
- **pnpm**：目前最快、最节省磁盘空间的包管理工具。
    
- **淘宝 NPM 镜像**：解决国内网络环境下安装速度慢或失败的问题。
    

## 准备工作

在开始之前，请确保你的系统满足以下条件：

1. **Windows 10 或 Windows 11 操作系统**。
    
2. **一个好的终端工具（推荐）**：
    
    - **PowerShell**：Windows 自带的强大命令行工具（推荐使用）。
        
    - **Windows Terminal**：微软官方出品的新一代终端，可以从 Microsoft Store 免费下载。它能更好地管理多个 PowerShell 或 CMD 标签页。
        
3. **管理员权限**：安装和切换 Node.js 版本时，需要“以管理员身份运行”终端。
    

---

## 步骤一：安装 nvm-windows (Node.js 版本管理器)

**为什么使用 nvm？** nvm (Node Version Manager) 可以让你在电脑上同时安装多个 Node.js 版本，并能轻松切换。n8n 推荐使用 Node.js 的 LTS (长期支持) 版本（如 v18 或 v20）。

1. **卸载现有的 Node.js (重要！)**
    
    - 如果你之前通过 `.msi` 安装包安装过 Node.js，请**务必**先卸载它。
        
    - 打开 "控制面板" -> "程序和功能" (或 "设置" -> "应用")，找到 "Node.js"，右键点击并卸载。
        
    - 删除 `C:\Program Files\nodejs` 目录（如果它仍然存在）。
        
2. **下载 nvm-windows**
    
    - 访问 nvm-windows 的 GitHub 发布页面：
        
        https://github.com/coreybutler/nvm-windows/releases
        
    - 在最新版本的 "Assets" 部分，下载 `nvm-setup.exe`。
        
3. **安装 nvm-windows**
    
    - 双击运行 `nvm-setup.exe`。
        
    - 它会询问你两个路径：
        
        - **nvm 安装路径**：建议保持默认 (例如 `C:\Users\YourName\AppData\Roaming\nvm`)。
            
        - **Node.js 符号链接路径**：这是 nvm 用来切换版本的“快捷方式”路径。建议保持默认 (例如 `C:\Program Files\nodejs`)。
            
    - 一路点击 "Next" 完成安装。
        
4. **验证 nvm 安装**
    
    - **关键一步**：关闭你所有的终端窗口，然后**以管理员身份**重新打开一个新的 PowerShell 窗口。
        
    - _如何以管理员身份打开？_
        
        1. 点击 "开始" 菜单。
            
        2. 输入 "PowerShell"。
            
        3. 在搜索结果上右键，选择 "以管理员身份运行"。
            
    - 在打开的管理员 PowerShell 窗口中，输入：
        
    
    PowerShell
    
    ```
    nvm version
    ```
    
    - 如果你看到了版本号 (如 `1.1.12`)，说明 nvm 已安装成功。
        
5. **安装 Node.js LTS 版本**
    
    - 在**管理员 PowerShell** 窗口中，执行以下命令来安装最新的 LTS 版本（例如 v18.x.x 或 v20.x.x）：
        
    
    PowerShell
    
    ```
    nvm install lts
    ```
    
6. **使用新安装的 Node.js 版本**
    
    - 安装完成后，执行以下命令来“激活”这个版本：
        
    
    PowerShell
    
    ```
    nvm use 20.10.0 
    # (注意：这里的版本号 20.10.0 只是示例，请替换为你上一步安装时提示的具体版本号)
    ```
    
7. **验证 Node.js 安装**
    
    - 现在，检查 Node.js 和 npm (npm 会随 Node.js 一起安装) 是否成功：
        
    
    PowerShell
    
    ```
    node -v
    # 应显示 v20.10.0 (或你安装的版本)
    
    npm -v
    # 应显示一个版本号，如 10.2.3
    ```
    

## 步骤二：配置淘宝镜像并安装 pnpm

现在我们的环境有了 `npm`，我们将用它来安装 `pnpm`。为了加快速度，我们先切换到淘宝镜像。

1. **配置 npm 使用淘宝镜像**
    
    - 在你的**管理员 PowerShell** 窗口中，执行：
        
    
    PowerShell
    
    ```
    npm config set registry https://registry.npmmirror.com/
    ```
    
2. **使用 npm 全局安装 pnpm**
    
    - `pnpm` 是一个更快速、更高效的包管理器。我们用 `npm` 来全局安装它：
        
    
    PowerShell
    
    ```
    npm install -g pnpm
    ```
    
3. **配置 pnpm 使用淘宝镜像**
    
    - 同样，我们也需要告诉 `pnpm` 使用淘宝镜像：
        
    
    PowerShell
    
    ```
    pnpm config set registry https://registry.npmmirror.com/
    ```
    
4. **验证 pnpm 安装**
    
    - 关闭并**重新打开一个新的管理员 PowerShell 窗口** (这一步很重要，为了让系统识别到 pnpm 命令)。
        
    - 输入：
        
    
    PowerShell
    
    ```
    pnpm -v
    # 应显示 pnpm 的版本号，如 8.x.x 或 9.x.x
    ```
    

## 步骤三：使用 pnpm 全局安装 n8n

一切准备就绪！现在我们使用 `pnpm` 来安装 n8n 主程序。

1. **执行安装命令**
    
    - 在你的**管理员 PowerShell** 窗口中，执行：
        
    
    PowerShell
    
    ```
    pnpm add -g n8n
    ```
    
2. **等待安装**
    
    - `pnpm` 会开始下载 n8n 及其依赖。由于配置了淘宝镜像，这个过程通常只需要1-2分钟。
        

## 步骤四：启动 n8n 并配置防火墙

1. **启动 n8n**
    
    - 安装完成后，你可以在**任何终端窗口** (管理员或非管理员均可) 中启动 n8n：
        
    
    PowerShell
    
    ```
    n8n
    ```
    
2. **处理 Windows 防火墙弹窗 (关键！)**
    
    - 当你第一次运行 `n8n` 时，**Windows Defender 防火墙**很可能会弹出一个窗口，提示 "Windows 安全警报"。
        
    - 这个弹窗是询问你是否允许 Node.js (n8n 运行所依赖的环境) 访问网络。
        
    - 你**必须**勾选 "**专用网络**" (如家庭或工作网络)。
        
    - 如果你希望局域网内的其他电脑也能访问你的 n8n，请同时勾选 "**公用网络**" (不推荐，除非你清楚安全风险)。
        
    - 点击 "**允许访问**"。
        
    - _(这是一个示例图，请根据你的实际弹窗操作)_
        
3. **访问 n8n 界面**
    
    - 当终端显示以下信息时，说明 n8n 已经成功启动：
        
    
    ```
    n8n ready on 0.0.0.0, port 5678
    Editor is now available on: http://localhost:5678
    ```
    
    - 打开你的浏览器 (Chrome, Edge, Firefox 等)，访问地址：`http://localhost:5678`
        
    - 首次访问，n8n 会引导你设置一个所有者账户（Owner Account）。设置完成后，你就可以开始创建你的自动化工作流了！
        

---

## 常用问题解答 (FAQ)

**Q1: 我输入 `nvm`, `pnpm` 或 `n8n` 时，提示 `command not found` (命令未找到)？**

- **A**: 90% 的原因是终端没有重新打开。
    
    1. **解决方法**：**关闭你当前所有的 PowerShell 或 CMD 窗口，然后重新打开一个新的终端窗口**。
        
    2. **管理员权限**：确保你是 "以管理员身份运行" 终端来执行安装和 `nvm use` 命令的。
        
    3. **检查环境变量**：如果重启终端无效，请检查系统的 `Path` 环境变量。
        
        - 在 "开始" 菜单搜索 "编辑系统环境变量"。
            
        - 点击 "环境变量..." 按钮。
            
        - 在 "系统变量" (或 "用户变量") 列表中找到 `Path`，双击它。
            
        - 确保列表中包含 `C:\Program Files\nodejs` (nvm 符号链接) 和 `C:\Users\YourName\AppData\Roaming\nvm` (nvm 安装目录，`YourName` 替换为你的用户名)。
            

**Q2: 我执行 `nvm use <版本号>` 成功了，但新开窗口 `node -v` 还是旧版本？**

- **A**: 这是 `nvm-windows` 最常见的问题。你**必须在管理员权限的终端**中执行 `nvm use` 命令。
    
    - **正确流程**：1. 以管理员身份打开 PowerShell -> 2. 执行 `nvm use 20.10.0` -> 3. 提示 "Now using node v20.10.0 (64-bit)" -> 4. 现在，_所有_新打开的终端窗口（包括非管理员的）都会使用这个版本了。
        

**Q3: 启动 n8n 时报错 `EPERM` (Operation not permitted) 或其他权限错误？**

- **A**: 这通常是你没有使用管理员终端来执行全局安装。
    
    - **解决方法**：
        
        1. 确保你的 PowerShell 是 "以管理员身份运行" 的。
            
        2. 尝试重新执行安装命令：`pnpm add -g n8n`
            

**Q4: 启动 n8n 时报错，提示端口 `5678` 已被占用 (Error: listen EADDRINUSE: address already in use :::5678)？**

- **A**: 说明你电脑上已有其他程序占用了 `5678` 端口。
    
    - **解决方法1 (推荐)**：启动 n8n 时指定一个新端口，例如 `5679`：
        
        PowerShell
        
        ```
        n8n --port=5679
        ```
        
        然后访问 `http://localhost:5679`。
        
    - **解决方法2 (查找并关闭)**：
        
        1. 在 PowerShell 中运行 `netstat -ano | findstr ":5678"`。
            
        2. 你会看到一行信息，最后那个数字是 PID (进程 ID)。
            
        3. 打开 "任务管理器" -> "详细信息" 标签页。
            
        4. 找到对应的 PID，看看是哪个程序，右键 "结束任务"。
            

**Q5: n8n 启动了，但我局域网内的其他电脑 (如我的手机或 iPad) 无法访问 `http://我的电脑IP:5678`？**

- **A**: 这是 Windows 防火墙问题。
    
    1. **检查防火墙规则**：
        
        - 在 "开始" 菜单搜索 "高级安全的 Windows Defender 防火墙"。
            
        - 点击 "入站规则"。
            
        - 在列表中找到所有和 "Node.js (TCP-In)" 相关的规则。
            
        - 确保它们的状态是 "已启用" (绿色勾)，并且 "配置文件" 包含了 "专用" (Private)。
            
    2. **创建新规则 (如果需要)**：
        
        - 在 "入站规则" 上右键 -> "新建规则..."。
            
        - 选择 "端口" -> "下一步"。
            
        - 选择 "TCP"，在 "特定本地端口" 中输入 `5678` -> "下一步"。
            
        - 选择 "允许连接" -> "下一步"。
            
        - 勾选 "专用" 和 "域" (如果需要) -> "下一步"。
            
        - 命名为 "n8n Access" -> "完成"。
            
    3. **检查网络类型**：确保你当前的 WiFi 或以太网连接在 Windows 中被设置为 "专用网络"，而不是 "公用网络"。
        

**Q6: 如何更新 n8n 到最新版本？**

- **A**: 同样在**管理员 PowerShell** 窗口中，执行 `pnpm` 的更新命令：
    
    PowerShell
    
    ```
    pnpm up -g n8n
    ```
    
