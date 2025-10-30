n8n 自动化工作流：从0到1（10节课入门大纲）

课程目标

本课程专为零基础学员设计。课程将从最基本的概念和安装讲起，通过10节课的“理论+实践”，带领学员掌握 n8n 的核心功能，最终能独立构建实用的自动化工作流，解决实际问题。

课程大纲

第一节课：课程介绍 - 什么是 n8n？

课程目标： 建立宏观认知。理解 n8n 是什么，能做什么，为什么我们要用它。
理论知识：

什么是自动化？ 为什么要自动化？（告别重复劳动）

什么是 n8n？ 它和 Zapier, IFTTT, 脚本有什么区别？（开源、强大、灵活）

n8n 核心三要素（高阶认知）：

触发器 (Trigger)： 工作流如何开始？（如：”每小时“，”收到消息时“）

节点 (Node)： 它具体做了什么？（如：“读取数据“，”发送通知“）

数据流 (Data Flow)： 信息如何传递？（JSON 数据）

能力展示： 展示1-2个酷炫的成品（如：RSS自动发通知、AI自动回复邮件），激发学员兴趣。
本节无实践： 纯概念课，确保学员在同一认知起跑线。

第二节课：环境准备 - 跑起你的 n8n

课程目标： 成功安装并启动 n8n，熟悉基本界面。
理论知识：

两种运行方式：

n8n Cloud (云版本)： 优点（免维护、省事）、缺点（付费、国内访问可能慢）。

Self-Hosted (自托管)： 优点（免费、数据私有、功能全）、缺点（需技术维护）。

（重点）本地安装：

Docker 简介： 为什么我们用 Docker？（环境隔离、一键启动）

提供一个最简的 docker-compose.yml 文件。

演示如何通过 docker-compose up -d 一键启动 n8n。
动手实验（环境安装）：

目标： 所有学员都成功在本地（或云上）启动 n8n 并打开 Web 界面。

界面导览： 首次登录，快速介绍画布、节点面板、保存按钮、执行按钮。

第三节课：Hello World - 你的第一个工作流

课程目标： 建立“我能行”的信心，完成第一个最简单的工作流，理解“执行”的概念。
理论知识：

工作流 (Workflow) 和 节点 (Node) 的关系。

Start 节点： 所有工作流的起点（用于手动测试）。

Set 节点： 最常用的节点之一，用于设置、修改数据。

“执行” (Execute) 的概念：运行一次工作流，看看发生了什么。

Input / Output 面板： 如何查看节点的输入和输出。
动手实验（Hello World）：

目标： 构建一个手动触发，并能输出“Hello, n8n”的工作流。

节点： Start (手动触发) -> Set 节点。

步骤：

在 Set 节点中，设置一个 string 类型的 message 字段，值为 "Hello, n8n"。

点击 "Execute Workflow"。

重点： 在 Set 节点的 Output 面板中，看到 { "message": "Hello, n8n" } 的 JSON 结果。

第四节课：核心灵魂(上) - 理解数据流 (JSON)

课程目标： 彻底理解 n8n 的数据“语言”——JSON。
理论知识：

n8n 的数据结构： 一切皆 JSON。

什么是 JSON？ 键值对 (Key-Value Pairs) 的概念。

数据如何流动？ 上一个节点的 Output (输出)，会成为下一个节点的 Input (输入)。

数据包 (Items) 的概念： n8n 处理的是一个“项目数组” (Array of Items)。
动手实验（数据传递）：

目标： 观察数据是如何从一个节点原封不动地流到下一个节点的。

节点： Start -> Set (设置A) -> Set (设置B) -> NoOp (空操作)。

步骤：

Set A：设置 { "name": "Alice", "level": 10 }。

执行后，点击 Set B，查看它的 Input 面板，确认看到了来自 Set A 的数据。

重点： 让学员理解，数据默认是“透传”和“累加”的。

第五节课：核心灵魂(下) - 使用表达式 (Expressions)

课程目标： 学会“读取”数据。这是 n8n 最核心的技能。
理论知识：

什么是表达式？ ( {{ }} 语法)

如何引用数据？

{{ $json.key }}：如何从当前节点的 输入 中引用数据。

{{ $node["NodeName"].json.key }}：如何从 任意 历史节点中引用数据。

表达式面板： 如何使用可视化面板点选数据。
动手实验（数据引用）：

目标： 练习从不同节点、不同层级引用数据。

节点： Start -> Set (命名为 "用户信息") -> Set (命名为 "任务信息")。

步骤：

用户信息：设置 { "name": "Alice" }。

任务信息：设置 task_owner 字段，值为 {{ $node["用户信息"].json.name }}。

执行后，查看 任务信息 的 Output，确认 task_owner 变成了 "Alice"。

第六节课：自动运行 - 触发器 (Triggers)

课程目标： 学会如何让工作流自动开始，解放双手。
理论知识：

什么是触发器？ 工作流的“发动机”。

两类触发器：

轮询 (Polling)： 定时检查。（如：Schedule）

Webhook (即时)： 被动等待通知。（如：Webhook）

激活 (Activate) 工作流： （重要！）只有激活的工作流才能被触发器自动运行。
动手实验（定时任务 & Webhook）：

实验 A (定时)： Schedule (每分钟) -> Set (设置一个时间戳)。激活工作流，查看执行日志 (Executions) 确认它在自动运行。

实验 B (Webhook)： Webhook -> Set。复制 Webhook 的 Test URL，在浏览器中打开并添加查询参数（如 ?name=Bob）。在 Set 节点中，尝试获取 Bob 这个值 ( {{ $json.query.name }} )。

第七节课：逻辑分支 - IF 节点

课程目标： 让工作流学会“思考”，根据不同条件执行不同路径。
理论知识：

线性流 vs 分支流。

IF 节点： 最简单的二元判断（True / False）。

Merge 节点： (可选) 如何将分支合并回主流程。
动手实验（Webhook 判断）：

目标： 根据 Webhook 传入的 value 值，判断大小。

节点： Webhook -> IF -> Set (大) / Set (小)。

步骤：

Webhook 接收 query.value (如 ?value=10)。

IF 节点：设置条件 {{ $json.query.value }} > 5。

IF 的 True 出口连接 Set (大) (设置 result: "大于5")。

IF 的 False 出口连接 Set (小) (设置 result: "小于等于5")。

测试两次（value=10 和 value=3），观察工作流走了不同分支。

第八节课：连接世界 - HTTP Request 节点

课程目标： 掌握 n8n 的“万能钥匙”，学会从外部 API 获取数据。
理论知识：

什么是 API？ (把它想象成一个“数据菜单”)。

HTTP Request 节点：

GET 方法：获取数据。

URL 和查询参数 (Query Parameters)。

如何阅读简单的 API 文档（以天气API为例）。
动手实验（获取天气/名言）：

目标： 调用一个公开的 API，并提取返回的数据。

节点： Start -> HTTP Request -> Set。

步骤：

HTTP Request：请求一个公开 API (如 https://api.quotable.io/random 获取随机名言，或使用国内的天气API)。

执行后，查看 HTTP Request 的 Output，找到你需要的数据（如 content 和 author）。

Set 节点：提取数据，设置 名言: {{ $node["HTTP Request"].json.content }}。

第九节课：实战演练 - 打造 RSS 监控机器人

课程目标： 综合运用所学知识，构建第一个有用的工作流。
理论知识：

凭证 (Credentials) 管理： 如何安全地保存你的 API 密钥或 Webhook URL。

RSS Read 节点： 如何订阅一个 RSS 源。

WeCom (企业微信) / Telegram / Feishu 节点： 如何发送通知。
动手实验（RSS 更新提醒）：

目标： 定时检查特定 RSS 源，如有新文章，则发送到企业微信（或 Telegram）。

节点： RSS Read (触发器) -> WeCom (或 Telegram / Feishu)。

步骤：

RSS Read：设置为定时触发（如每10分钟），填入一个 RSS 源 URL。

配置 WeCom 凭证（一个企业微信机器人 Webhook URL）。

WeCom 节点：设置 Content 字段，发送 {{ $json.title }} - {{ $json.link }}。

激活工作流，等待接收通知。

第十节课：高级课题 - 处理多项数据与后续

课程目标： 理解 n8n 处理“列表”的机制，并指明后续学习方向。
理论知识：

n8n 的隐式循环： 当一个节点输出多个 items 时，后续节点会对每个 item 都执行一次。

Split in Batches 节点： (简介) 如何显式地循环。

错误处理： (简介) Settings -> Continue on Fail。

Code 节点： (简介) n8n 的终极武器——写 JS 代码。
动手实验（批量处理）：

目标： 观察 RSS Read (输出多项) 时，后续节点的执行情况。

节点： RSS Read -> Set (添加前缀)。

步骤：

RSS Read 执行后，查看 Output，确认它返回了 items 数组（比如10篇文章）。

Set 节点中，设置 newTitle 字段，值为 [已读] {{ $json.title }}。

查看 Set 节点的 Output，重点观察： 它也输出了 10 个 items，并且每个 item 都有了 newTitle。
总结： 课程回顾，以及后续学习路径（Code节点、错误处理、自定义节点）。
