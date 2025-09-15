# 部署指南 - Google Calendar MCP Server

本文档说明如何将 Google Calendar MCP Server 部署到 GitHub 并供外部调用。

## 📦 部署方式

### 方式 1: npm 包发布（推荐）

#### 发布步骤

1. **准备发布**
```bash
# 确保已登录 npm
npm login

# 更新版本号
npm version patch  # 或 minor, major

# 构建项目
npm run build

# 发布到 npm
npm publish --access public
```

2. **用户安装**
```bash
# 全局安装
npm install -g @dashuai/google-calendar-mcp-server

# 或作为项目依赖
npm install @dashuai/google-calendar-mcp-server
```

### 方式 2: GitHub 直接安装

用户可以直接从 GitHub 安装：

```bash
# 通过 npm 从 GitHub 安装
npm install -g github:dashuai/google-calendar-mcp-server

# 或克隆仓库
git clone https://github.com/dashuai/google-calendar-mcp-server.git
cd google-calendar-mcp-server
npm install
npm run build
npm link
```

### 方式 3: GitHub Release

创建可下载的发布版本：

1. **创建标签**
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **自动发布**
GitHub Actions 会自动创建 release 包含：
- 源代码压缩包
- 编译后的 dist 文件
- 安装说明

## 🔒 安全注意事项

### 敏感文件处理

**永远不要提交以下文件到 GitHub：**
- `config/credentials.json` - Google OAuth2 凭证
- `config/token.json` - OAuth2 令牌
- `config/config.json` - 包含敏感配置

**提供示例文件：**
- `config/config.example.json` - 配置示例
- `config/credentials.example.json` - 凭证格式示例

### 用户配置步骤

1. **获取 Google 凭证**
   - 用户需要创建自己的 Google Cloud 项目
   - 启用 Google Calendar API
   - 创建 OAuth2 凭证或服务账号

2. **配置本地环境**
```bash
# 复制示例文件
cp config/config.example.json config/config.json
cp config/credentials.example.json config/credentials.json

# 编辑 credentials.json，添加实际凭证
```

## 🌐 集成方式

### Claude Desktop 集成

用户在 `claude_desktop_config.json` 中配置：

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "google-calendar-mcp",
      "args": ["--credentials", "/path/to/credentials.json"]
    }
  }
}
```

### 作为 Node.js 模块使用

```javascript
import { GoogleCalendarMCPServer } from '@dashuai/google-calendar-mcp-server';

const server = new GoogleCalendarMCPServer();
await server.run();
```

## 📝 版本管理

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/):
- **MAJOR**: 破坏性更改
- **MINOR**: 新功能（向后兼容）
- **PATCH**: Bug 修复

### 更新版本

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

## 🚀 GitHub Actions 自动化

项目包含自动化工作流：

1. **自动测试** - 每次推送运行测试
2. **自动发布** - 标签推送时创建 release
3. **代码检查** - ESLint 和 TypeScript 检查

## 📊 使用统计

### npm 下载量
```bash
npm info @dashuai/google-calendar-mcp-server
```

### GitHub 统计
- Stars: 项目受欢迎程度
- Forks: 社区贡献
- Issues: 用户反馈

## 🤝 贡献指南

欢迎贡献！请遵循：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 允许商业和个人使用

## 🔗 相关链接

- [npm 包页面](https://www.npmjs.com/package/@dashuai/google-calendar-mcp-server)
- [GitHub 仓库](https://github.com/dashuai/google-calendar-mcp-server)
- [问题反馈](https://github.com/dashuai/google-calendar-mcp-server/issues)
- [MCP 协议文档](https://github.com/modelcontextprotocol/sdk)

## ❓ 常见问题

### Q: 用户需要自己的 Google 凭证吗？
A: 是的，每个用户需要创建自己的 Google Cloud 项目和凭证。

### Q: 可以共享凭证吗？
A: 不建议。Google API 有使用限制，共享可能导致超限。

### Q: 支持哪些认证方式？
A: OAuth2（个人使用）和 Service Account（自动化/服务器）。

### Q: 如何处理 API 限制？
A: 内置重试机制和批量操作优化，自动处理速率限制。

---

**最后更新**: 2024-12-17
**维护者**: @dashuai