---
title: 批量转换脚本使用指南
sidebarTitle: 批量转换
---

# 批量转换脚本使用指南

## 📖 概述

本工具提供了一个自动化的批量转换脚本，可以将目录下所有的 Word 文档（.doc, .docx）批量转换为 Markdown 格式。脚本使用 `markitdown` 库进行转换，保持原有的目录结构。

## 🔧 脚本功能

### 主要特性

- **批量处理**: 自动查找并转换目录下所有 Word 文件
- **目录结构保持**: 转换后保持原有的文件夹结构
- **进度显示**: 实时显示转换进度和结果
- **错误处理**: 详细的错误报告和统计信息
- **自动创建目录**: 自动创建输出目录

### 支持格式

- `.doc` - Microsoft Word 97-2003 文档
- `.docx` - Microsoft Word 2007+ 文档

## 🚀 使用方法

### 1. 环境准备

确保已安装必要的依赖：

```bash
# 安装 markitdown 库
pip install markitdown

# 或者使用指定的 Python 路径
C:\Users\16922\AppData\Local\Programs\Python\Python312\python.exe -m pip install markitdown
```

### 2. 脚本使用

#### 方法一：直接运行

```bash
# 在包含 Word 文件的目录中运行
python auto_convert_word_to_md.py
```

#### 方法二：使用完整路径

```bash
# 使用完整的 Python 路径
C:\Users\16922\AppData\Local\Programs\Python\Python312\python.exe auto_convert_word_to_md.py
```

### 3. 运行示例

```
============================================================
自动批量 Word 文件转 Markdown 工具
============================================================
当前工作目录: D:\BaiduNetdiskDownload\prompt-test

正在查找 Word 文件...
✅ 找到 15 个 Word 文件

开始自动转换，输出目录: D:\BaiduNetdiskDownload\prompt-test\converted_markdown
------------------------------------------------------------
[1/15] 转换: 1，AI写小说指令【指令+教程】\AI写小说.docx
  ✅ 成功 -> converted_markdown\1，AI写小说指令【指令+教程】\AI写小说.md
[2/15] 转换: 2，小红书爆款文案【指令+教程】\小红书爆款文案.docx
  ✅ 成功 -> converted_markdown\2，小红书爆款文案【指令+教程】\小红书爆款文案.md
...
------------------------------------------------------------
转换完成!
✅ 成功: 14 个文件
❌ 失败: 1 个文件

失败的文件:
  - 某个文件.docx: 文件已损坏或格式不支持

所有转换的 Markdown 文件保存在: D:\BaiduNetdiskDownload\prompt-test\converted_markdown
```

## 📁 输出结构

脚本会在当前目录下创建 `converted_markdown` 文件夹，并保持原有的目录结构：

```
当前目录/
├── auto_convert_word_to_md.py
├── 1，AI写小说指令【指令+教程】/
│   └── AI写小说.docx
├── 2，小红书爆款文案【指令+教程】/
│   └── 小红书爆款文案.docx
└── converted_markdown/          # 输出目录
    ├── 1，AI写小说指令【指令+教程】/
    │   └── AI写小说.md
    └── 2，小红书爆款文案【指令+教程】/
        └── 小红书爆款文案.md
```

## 🔧 脚本详解

### 核心函数

#### 1. `find_word_files(directory)`

- **功能**: 递归查找目录下所有 Word 文件
- **参数**: `directory` - 要搜索的目录路径
- **返回**: Word 文件路径列表

#### 2. `convert_word_to_markdown(word_file_path, output_dir)`

- **功能**: 将单个 Word 文件转换为 Markdown
- **参数**:
  - `word_file_path` - Word 文件路径
  - `output_dir` - 输出目录（可选）
- **返回**: (输出文件路径, 成功标志, 错误信息)

#### 3. `main()`

- **功能**: 主程序入口，协调整个转换流程
- **流程**:
  1. 查找 Word 文件
  2. 创建输出目录
  3. 批量转换
  4. 显示结果统计

### 关键特性

#### 目录结构保持

```python
# 保持目录结构
rel_dir = os.path.dirname(rel_path)
output_dir = os.path.join(output_base_dir, rel_dir) if rel_dir else output_base_dir
os.makedirs(output_dir, exist_ok=True)
```

#### 错误处理

```python
try:
    # 转换逻辑
    result = md.convert(word_file_path)
    return output_file, True, None
except Exception as e:
    return None, False, str(e)
```

## 🛠️ 自定义修改

### 1. 修改输出目录

```python
# 在 main() 函数中修改这一行
output_base_dir = os.path.join(current_dir, "my_custom_output")
```

### 2. 添加更多文件格式

```python
# 在 find_word_files() 函数中修改
word_extensions = ['.doc', '.docx', '.rtf', '.odt']  # 添加更多格式
```

### 3. 自定义文件名格式

```python
# 在 convert_word_to_markdown() 函数中修改
base_name = os.path.splitext(os.path.basename(word_file_path))[0]
output_file = os.path.join(output_dir, f"{base_name}_converted.md")  # 添加后缀
```

### 4. 添加过滤条件

```python
def find_word_files(directory):
    """查找目录下所有的 Word 文件"""
    word_extensions = ['.doc', '.docx']
    word_files = []

    for root, dirs, files in os.walk(directory):
        # 跳过特定目录
        if 'backup' in root or 'temp' in root:
            continue

        for file in files:
            # 跳过临时文件
            if file.startswith('~$'):
                continue

            if any(file.lower().endswith(ext) for ext in word_extensions):
                word_files.append(os.path.join(root, file))

    return word_files
```

## 🔍 故障排除

### 常见问题

#### 1. 模块导入错误

**错误**: `ModuleNotFoundError: No module named 'markitdown'`
**解决方案**:

```bash
pip install markitdown
# 或使用完整路径
C:\Users\16922\AppData\Local\Programs\Python\Python312\python.exe -m pip install markitdown
```

#### 2. 权限错误

**错误**: `PermissionError: [Errno 13] Permission denied`
**解决方案**:

- 确保文件未被其他程序打开
- 以管理员身份运行脚本
- 检查文件和目录权限

#### 3. 编码错误

**错误**: `UnicodeDecodeError` 或乱码
**解决方案**:

- 确保脚本以 UTF-8 编码保存
- 检查 Word 文档的语言设置
- 尝试重新保存 Word 文档

#### 4. 转换质量问题

**问题**: 转换后格式不理想
**解决方案**:

- 检查原 Word 文档的格式
- 确保文档结构清晰
- 避免复杂的表格和图形

### 调试方法

#### 启用详细输出

```python
# 在转换函数中添加调试信息
def convert_word_to_markdown(word_file_path, output_dir=None):
    try:
        print(f"  正在处理: {word_file_path}")
        md = MarkItDown()
        result = md.convert(word_file_path)
        print(f"  转换内容长度: {len(result.text_content)} 字符")
        # ... 其余代码
```

#### 单文件测试

```python
# 创建测试脚本
if __name__ == "__main__":
    test_file = "path/to/test.docx"
    output_file, success, error = convert_word_to_markdown(test_file)
    if success:
        print(f"成功: {output_file}")
    else:
        print(f"失败: {error}")
```

## 📊 性能优化

### 大批量文件处理

```python
# 添加进度条（需要安装 tqdm）
from tqdm import tqdm

for i, word_file in enumerate(tqdm(word_files, desc="转换进度"), 1):
    # 转换逻辑
```

### 并行处理

```python
# 使用多进程加速（适合大量文件）
from multiprocessing import Pool
import multiprocessing

def parallel_convert(file_list):
    with Pool(processes=multiprocessing.cpu_count()) as pool:
        results = pool.map(convert_single_file, file_list)
    return results
```

## 🔗 相关工具

### 配套脚本

- **清理脚本**: 清理转换过程中的临时文件
- **验证脚本**: 验证转换结果的完整性
- **统计脚本**: 生成转换统计报告

### 扩展功能

- **GUI 界面**: 使用 tkinter 创建图形界面
- **配置文件**: 支持配置文件自定义参数
- **日志记录**: 详细的日志记录功能

::: tip 💡 使用建议

1. **备份原文件**: 转换前备份重要的 Word 文档
2. **分批处理**: 对于大量文件，建议分批处理
3. **检查结果**: 转换后检查重要文档的格式
4. **定期清理**: 定期清理输出目录避免占用过多空间
   :::

::: warning ⚠️ 注意事项

- 转换过程中不要移动或删除原文件
- 确保有足够的磁盘空间存储转换结果
- 复杂格式的文档可能需要手动调整
- 图片和表格的转换效果可能有限
  :::

---

_最后更新: 2024年12月_
