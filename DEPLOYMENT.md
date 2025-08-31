# VitePress 部署流水线文档

本文档描述了 VitePress 文档站点的完整部署流程，包括 CI/CD 流水线配置和自定义部署脚本的使用。

## 📋 目录结构

```
prompt-test/
├── docs/                          # VitePress 文档目录
│   ├── .vitepress/               # VitePress 配置
│   ├── pipeline.yaml             # CI/CD 流水线配置
│   ├── deploy-wrapper.py         # 部署包装器脚本
│   ├── .env.example              # 环境变量示例
│   └── DEPLOYMENT.md             # 本文档
├── vitepress-deploy-py/          # 自定义部署脚本
│   ├── src/                      # 部署核心模块
│   ├── deploy_new.py             # 主部署脚本
│   ├── requirements.txt          # Python 依赖
│   └── .env                      # 部署配置（敏感信息）
└── README.md
```

## 🚀 部署流程概述

### 1. 环境准备阶段 (prepare)
- **设置部署环境**: 安装 Python 依赖，验证部署配置
- **安装前端依赖**: 使用 pnpm 安装 VitePress 依赖（使用淘宝镜像）

### 2. 构建阶段 (build)
- **构建前检查**: 验证文档目录结构和配置文件
- **构建文档**: 使用 VitePress 构建静态文档
- **构建后验证**: 检查构建输出的完整性
- **上传制品**: 将构建结果上传为流水线制品

### 3. 部署阶段 (deploy)
- **部署到 Vercel**: 自动部署到 Vercel 平台
- **部署到自定义服务器**: 使用自定义脚本部署到指定服务器
- **部署后检查**: 验证网站可访问性

### 4. 发布阶段 (release)
- **创建发布快照**: 为发布版本创建备份快照
- **发布制品**: 创建正式发布版本
- **清理旧备份**: 清理过期的备份文件

## ⚙️ 配置说明

### 自动化部署配置

#### 流水线部署配置

在 `pipeline.yaml` 中已配置完整的自动化部署流程：

**部署阶段步骤：**
1. **发布文档制品** - 发布构建产物
2. **配置部署环境** - 安装 Python 依赖（使用清华大学镜像）
3. **部署到远程服务器** - 执行自动化部署脚本

**部署特性：**
- ✅ 增量部署 - 只上传变更的文件
- ✅ 自动备份 - 部署前自动备份现有文件
- ✅ 错误重试 - 支持失败重试机制
- ✅ 镜像加速 - 使用清华大学 PyPI 镜像

#### 部署脚本配置

在 `vitepress-deploy-py/.env` 文件中配置部署参数：

```bash
# SSH连接配置
SSH_HOSTNAME=your-server-ip
SSH_USERNAME=your-username
SSH_PASSWORD=your-password
SSH_PORT=22

# 项目路径配置
LOCAL_DOCS_DIR=../docs
LOCAL_DIST_DIR=../docs/.vitepress/dist
REMOTE_WEB_DIR=/var/www/html
REMOTE_BACKUP_DIR=/var/backups/vitepress

# 构建命令
BUILD_COMMAND=pnpm run docs:build

# Nginx配置
NGINX_CONFIG_DIR=/etc/nginx/sites-available
NGINX_SITE_NAME=vitepress-docs
NGINX_DOMAIN=your-domain.com

# 部署选项
MAX_RETRIES=3
BACKUP_RETENTION_DAYS=7
ENABLE_GZIP=true
ENABLE_CACHE_HEADERS=true
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置以下变量：

#### 构建配置
```bash
NODE_ENV=production
PNPM_REGISTRY=https://registry.npmmirror.com
```

#### SSH 连接配置
```bash
SSH_HOSTNAME=8.134.100.191
SSH_USERNAME=root
SSH_PASSWORD=your_password_here
SSH_PORT=22
SSH_TIMEOUT=30
```

#### 部署路径配置
```bash
REMOTE_WEB_DIR=/opt/1panel/apps/openresty/openresty/www/sites/wynlx.cn/index
REMOTE_BACKUP_DIR=/var/backups/vitepress
LOCAL_DOCS_DIR=../docs
LOCAL_DIST_DIR=../docs/.vitepress/dist
```

#### Nginx 配置
```bash
NGINX_CONFIG_DIR=/etc/nginx/sites-available
NGINX_SITE_NAME=vitepress-docs
NGINX_DOMAIN=wynlx.cn
```

### CI/CD 系统配置

在 CI/CD 系统中设置以下敏感环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `SSH_PASSWORD` | SSH 登录密码 | `your_secure_password` |
| `SSH_HOSTNAME` | 服务器地址 | `8.134.100.191` |
| `SSH_USERNAME` | SSH 用户名 | `root` |
| `REMOTE_WEB_DIR` | 远程网站目录 | `/opt/1panel/apps/...` |

## 🔧 使用方法

### 本地开发

```bash
# 安装依赖
cd docs
pnpm install

# 启动开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build
```

### 手动部署

```bash
# 验证配置
cd docs
python deploy-wrapper.py --validate-only

# 执行部署（不清理远程文件）
python deploy-wrapper.py --no-clean

# 强制清理并部署
python deploy-wrapper.py --force-clean

# 模拟运行（不实际执行）
python deploy-wrapper.py --dry-run
```

### 自动部署触发条件

流水线会在以下情况自动触发：

1. **推送到主分支**: `main`, `master`, `develop`
2. **标签推送**: 以 `v`, `docs-`, `release-` 开头的标签
3. **文件变更**: `/docs` 或 `/vitepress-deploy-py` 目录下的文件

### 发布流程

1. **创建发布标签**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **手动触发发布**: 在 CI/CD 系统中手动触发 `release` 阶段

## 🛠️ 故障排除

### 常见问题

#### 1. 部署脚本找不到
```
错误: 部署脚本目录不存在
```
**解决方案**: 确保 `vitepress-deploy-py` 目录存在且包含必要文件

#### 2. 环境变量缺失
```
错误: 缺少必需的环境变量: SSH_HOSTNAME, SSH_USERNAME
```
**解决方案**: 检查 CI/CD 系统的环境变量配置

#### 3. SSH 连接失败
```
部署失败: SSH connection failed
```
**解决方案**: 
- 检查服务器地址和端口
- 验证 SSH 用户名和密码
- 确保服务器允许 SSH 连接

#### 4. 构建失败
```
构建输出目录不存在
```
**解决方案**: 
- 检查 VitePress 配置
- 确保所有依赖已正确安装
- 查看构建日志获取详细错误信息

### 调试模式

启用详细日志输出：
```bash
export LOG_LEVEL=DEBUG
python deploy-wrapper.py --validate-only
```

## 📊 监控和维护

### 备份管理

- **自动备份**: 每次部署前自动创建备份
- **备份保留**: 默认保留 7 天的备份文件
- **手动清理**: 可通过脚本手动清理旧备份

### 日志管理

- **日志位置**: `vitepress-deploy-py/logs/`
- **日志级别**: INFO（可调整为 DEBUG）
- **日志轮转**: 自动管理日志文件大小

### 性能优化

- **Gzip 压缩**: 启用静态文件压缩
- **缓存头**: 设置适当的缓存策略
- **CDN 集成**: 可配合 Vercel CDN 使用

## 🔒 安全注意事项

1. **敏感信息管理**: 
   - 不要在代码中硬编码密码
   - 使用 CI/CD 系统的密钥管理功能
   - 定期更换 SSH 密码

2. **访问控制**:
   - 限制 SSH 访问来源 IP
   - 使用强密码或密钥认证
   - 定期审查服务器访问日志

3. **备份安全**:
   - 备份文件包含敏感信息
   - 确保备份目录访问权限正确
   - 定期清理过期备份

## 📞 支持和联系

如遇到问题，请：

1. 查看部署日志获取详细错误信息
2. 检查本文档的故障排除部分
3. 验证环境配置是否正确
4. 联系系统管理员获取技术支持

---

**最后更新**: 2024年
**版本**: 1.0.0
**维护者**: VitePress 部署团队