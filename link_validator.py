#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文档链接验证和修复工具
自动检测和修复Markdown文档中的链接引用问题
"""

import os
import re
import sys
import argparse
from pathlib import Path
from urllib.parse import urlparse
import requests
from typing import List, Tuple, Dict

class LinkValidator:
    def __init__(self, target_file: str, dry_run: bool = False):
        self.target_file = Path(target_file)
        self.dry_run = dry_run
        self.base_dir = self.target_file.parent
        self.fixes_count = 0
        
        # Markdown链接正则表达式
        self.link_patterns = [
            # [text](url)
            r'\[([^\]]+)\]\(([^\)]+)\)',
            # ![alt](url)
            r'!\[([^\]]*)\]\(([^\)]+)\)',
            # [text]: url
            r'^\s*\[([^\]]+)\]:\s*(.+)$'
        ]
    
    def is_url(self, link: str) -> bool:
        """检查是否为URL"""
        parsed = urlparse(link)
        return bool(parsed.scheme and parsed.netloc)
    
    def is_valid_url(self, url: str) -> bool:
        """验证URL是否可访问"""
        try:
            response = requests.head(url, timeout=5, allow_redirects=True)
            return response.status_code < 400
        except:
            return False
    
    def find_file_in_project(self, filename: str) -> List[Path]:
        """在项目中查找文件"""
        # 从当前文件目录开始向上查找项目根目录
        current_dir = self.target_file.parent
        project_root = current_dir
        
        # 向上查找，直到找到包含.git或package.json的目录，或到达根目录
        while project_root.parent != project_root:
            if (project_root / '.git').exists() or (project_root / 'package.json').exists():
                break
            project_root = project_root.parent
        
        matches = []
        for root, dirs, files in os.walk(project_root):
            if filename in files:
                matches.append(Path(root) / filename)
        
        return matches
    
    def get_relative_path(self, target_path: Path) -> str:
        """获取相对路径"""
        try:
            return os.path.relpath(target_path, self.base_dir).replace('\\', '/')
        except ValueError:
            return str(target_path).replace('\\', '/')
    
    def fix_local_link(self, link: str) -> str:
        """修复本地链接"""
        # 移除锚点
        clean_link = link.split('#')[0]
        anchor = '#' + link.split('#')[1] if '#' in link else ''
        
        # 如果是绝对路径或已经正确的相对路径
        target_path = self.base_dir / clean_link
        if target_path.exists():
            return link
        
        # 尝试查找文件
        filename = Path(clean_link).name
        if filename:
            matches = self.find_file_in_project(filename)
            if matches:
                # 选择最近的匹配
                best_match = min(matches, key=lambda p: len(str(p)))
                new_path = self.get_relative_path(best_match)
                return new_path + anchor
        
        return link
    
    def process_links(self, content: str) -> str:
        """处理文档中的所有链接"""
        modified_content = content
        
        for pattern in self.link_patterns:
            def replace_link(match):
                text = match.group(1)
                link = match.group(2)
                
                # 跳过URL
                if self.is_url(link):
                    return match.group(0)
                
                # 修复本地链接
                fixed_link = self.fix_local_link(link)
                if fixed_link != link:
                    self.fixes_count += 1
                    print(f"修复链接: {link} -> {fixed_link}")
                
                # 重构链接
                if pattern.startswith('!'):
                    return f"![{text}]({fixed_link})"
                elif pattern.startswith('^'):
                    return f"[{text}]: {fixed_link}"
                else:
                    return f"[{text}]({fixed_link})"
            
            modified_content = re.sub(pattern, replace_link, modified_content, flags=re.MULTILINE)
        
        return modified_content
    
    def validate_and_fix(self):
        """验证和修复链接"""
        if not self.target_file.exists():
            print(f"错误: 文件不存在 {self.target_file}")
            return False
        
        print(f"处理文件: {self.target_file}")
        
        # 读取文件内容
        try:
            with open(self.target_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"错误: 无法读取文件 {e}")
            return False
        
        # 处理链接
        modified_content = self.process_links(content)
        
        # 保存修改
        if not self.dry_run and modified_content != content:
            try:
                with open(self.target_file, 'w', encoding='utf-8') as f:
                    f.write(modified_content)
                print(f"文件已更新: {self.target_file}")
            except Exception as e:
                print(f"错误: 无法写入文件 {e}")
                return False
        
        print(f"完成! 修复了 {self.fixes_count} 个链接")
        return True

def main():
    parser = argparse.ArgumentParser(description='文档链接验证和修复工具')
    parser.add_argument('file', help='要处理的Markdown文件路径')
    parser.add_argument('--dry-run', action='store_true', help='只检查不修改文件')
    
    args = parser.parse_args()
    
    validator = LinkValidator(args.file, args.dry_run)
    success = validator.validate_and_fix()
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()