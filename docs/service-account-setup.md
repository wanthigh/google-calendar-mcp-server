# 使用Service Account的步骤

## 创建Service Account

1. **在Google Cloud Console中**：
   - 进入 "IAM & Admin" > "Service Accounts"
   - 点击 "Create Service Account"
   - 名称：calendar-mcp-service
   - 描述：Service account for Calendar MCP Server

2. **生成密钥**：
   - 点击创建的Service Account
   - 进入 "Keys" 标签
   - 点击 "Add Key" > "Create new key"
   - 选择 "JSON" 格式
   - 下载文件并重命名为 `credentials.json`

3. **共享日历**：
   - 打开 Google Calendar
   - 在左侧的日历列表中，点击你要操作的日历的设置
   - 选择 "Share with specific people"
   - 添加Service Account的邮箱地址（在credentials.json文件中的client_email字段）
   - 给予 "Make changes to events" 权限

## Service Account的优点
- 无需用户授权流程
- 适合自动化和服务器端应用
- 不会过期（除非手动撤销）
- 绕过OAuth验证问题

使用Service Account后，MCP服务器将自动认证，无需手动授权流程。