# Google Calendar MCP Server 开发指导

## 项目概述

这是一个基于 Model Context Protocol (MCP) 的 Google Calendar 集成服务，提供了完整的日历事件管理功能。项目使用 TypeScript 开发，通过 MCP SDK 与 Claude 集成，支持单一和批量操作，并具备企业级的错误处理和重试机制。

## 核心架构

### 技术栈
- **TypeScript**: ES模块 (ESNext)
- **MCP SDK**: @modelcontextprotocol/sdk v0.4.0+
- **Google APIs**: googleapis v126.0.1+
- **验证库**: Zod v3.22.4+
- **运行时**: Node.js 18+

### 项目结构
```
google_chrome_calendar_server/
├── src/
│   ├── index.ts              # MCP Server 主入口
│   ├── services/
│   │   ├── auth.ts           # OAuth2 认证服务
│   │   ├── calendar.ts       # Google Calendar API 封装
│   │   └── config.ts         # 配置管理
│   ├── tools/
│   │   ├── create-event.ts   # 创建事件工具
│   │   ├── update-event.ts   # 更新事件工具
│   │   ├── delete-event.ts   # 删除事件工具
│   │   ├── list-events.ts    # 列表事件工具
│   │   ├── search-events.ts  # 搜索事件工具
│   │   ├── batch-create-events.ts  # 批量创建
│   │   ├── batch-update-events.ts  # 批量更新
│   │   └── batch-delete-events.ts  # 批量删除
│   ├── utils/
│   │   ├── validation.ts     # 输入验证
│   │   ├── error.ts          # 错误处理
│   │   └── retry.ts          # 重试机制
│   └── types/
│       └── calendar.ts       # 类型定义
├── config/
│   ├── config.json           # 应用配置
│   ├── credentials.json      # Google OAuth2 凭证
│   └── token.json           # OAuth2 令牌（自动生成）
└── dist/                     # 编译输出目录
```

## 关键实现细节

### 1. Google Calendar API 特性

#### 更新事件的重要注意事项
Google Calendar API 在更新事件时**要求提供完整的事件数据**，而不是仅提供更改的字段。必须先获取现有事件，然后合并更新：

```typescript
async updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
  // 先获取现有事件数据 - 这是关键步骤！
  const existingEvent = await this.calendar.events.get({
    calendarId: this.configManager.getDefaultCalendarId(),
    eventId: input.eventId,
  });

  // 保留所有现有数据，仅更新提供的字段
  const updateData = {
    summary: existingEvent.data.summary,
    start: existingEvent.data.start,
    end: existingEvent.data.end,
    // ... 其他必需字段
  };

  // 应用更新
  if (input.summary !== undefined) updateData.summary = input.summary;
  // ... 更多字段更新
}
```

### 2. 批量操作设计

#### 批量处理架构
- **分批处理**: 将大量操作分成小批次执行
- **并发控制**: 每批内并发，批次间串行
- **错误隔离**: 单个失败不影响其他操作
- **速率限制**: 批次间延迟避免触发API限制

```typescript
// 批量处理核心逻辑
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);

  // 批内并发执行
  const batchPromises = batch.map(async (item) => {
    try {
      return await processItem(item);
    } catch (error) {
      if (!continueOnError) throw error;
      return { error };
    }
  });

  await Promise.all(batchPromises);

  // 批次间延迟
  if (delayBetweenBatches > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### 3. 重试机制实现

#### 智能重试策略
- **指数退避**: 延迟按 `baseDelay * (backoffMultiplier ^ attempt)` 增长
- **可重试错误识别**: 仅重试临时性错误
- **最大延迟限制**: 避免等待时间过长

```typescript
// 可重试的错误类型
- 429 (Rate Limit Exceeded)
- 403 (Quota Exceeded)
- 503 (Service Unavailable)
- Network errors (ECONNRESET, ETIMEDOUT)
- Internal errors
```

#### 重试配置
```typescript
retryOptions: {
  maxRetries: 3,           // 最大重试次数
  baseDelay: 1000,         // 基础延迟 (ms)
  maxDelay: 10000,         // 最大延迟 (ms)
  backoffMultiplier: 2     // 退避倍数
}
```

### 4. OAuth2 认证流程

#### 认证步骤
1. **加载凭证**: 从 `credentials.json` 读取 OAuth2 配置
2. **检查令牌**: 查找已保存的 `token.json`
3. **刷新令牌**: 如果令牌过期，自动刷新
4. **授权流程**: 如果无令牌，引导用户完成授权

#### 处理未验证应用
开发阶段可能遇到 "应用未完成 Google 验证流程" 错误：
1. 在 Google Cloud Console 添加测试用户
2. 使用测试用户账号进行授权
3. 生产环境需完成 Google 验证流程

### 5. MCP 工具注册

#### 工具定义模式
每个工具包含三个部分：
1. **Schema定义**: 使用 Zod 定义输入验证
2. **Tool配置**: MCP 工具描述和参数定义
3. **Handler函数**: 实际执行逻辑

```typescript
// 1. Schema
export const CreateEventSchema = z.object({
  summary: z.string(),
  start: EventDateTimeSchema,
  end: EventDateTimeSchema,
  // ...
});

// 2. Tool配置
export const createEventTool: Tool = {
  name: 'create_event',
  description: '...',
  inputSchema: { /* JSON Schema */ }
};

// 3. Handler
export async function handleCreateEvent(
  args: unknown,
  calendarService: CalendarService
): Promise<string> {
  const input = validateInput(CreateEventSchema, args);
  // 执行逻辑
}
```

## 开发规范

### 1. 错误处理
- 使用自定义错误类（CalendarError, AuthenticationError等）
- 所有工具返回 JSON 格式的结果
- 包含成功状态、消息和详细信息

### 2. 输入验证
- 使用 Zod 进行运行时类型检查
- 在处理前验证所有用户输入
- 提供清晰的验证错误信息

### 3. 测试策略
- **单元测试**: 每个工具单独测试
- **集成测试**: 端到端流程测试
- **步进式验证**: 每步操作后等待用户确认

### 4. 性能优化
- 批量操作使用分批处理
- 实施速率限制保护
- 使用重试机制处理临时失败

## 常见问题及解决方案

### 1. "Missing end time" 错误
**问题**: 更新事件时缺少必需字段
**解决**: 先获取完整事件数据，再应用部分更新

### 2. OAuth2 授权失败
**问题**: "应用未完成 Google 验证流程"
**解决**: 添加测试用户或完成应用验证

### 3. 速率限制错误
**问题**: 429 Too Many Requests
**解决**: 使用批次间延迟和重试机制

### 4. 模块解析错误
**问题**: TypeScript 编译错误
**解决**: 确保 tsconfig.json 使用 ESNext 模块

## 测试和验证

### 测试文件说明
- `test-local.js`: 本地功能测试
- `step-by-step-test.js`: 步进式验证测试
- `test-all-batch.js`: 批量操作完整测试
- `test-retry-mechanism.js`: 重试机制测试

### 测试流程
1. **初始化服务**: 加载配置和认证
2. **创建测试数据**: 准备测试事件
3. **执行操作**: 运行 CRUD 操作
4. **验证结果**: 检查返回值
5. **清理数据**: 删除测试事件

## 部署和发布

### 构建步骤
```bash
npm install
npm run build
```

### 配置要求
1. 创建 `config/credentials.json` (Google OAuth2 凭证)
2. 首次运行时完成授权流程
3. 自动生成 `config/token.json`

### MCP 集成
在 Claude Desktop 配置中添加：
```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {}
    }
  }
}
```

## 维护和扩展

### 添加新功能
1. 在 `src/tools/` 创建新工具文件
2. 定义 Schema、Tool 和 Handler
3. 在 `index.ts` 注册工具
4. 编写测试用例
5. 更新文档

### 版本管理
- 遵循语义化版本规范
- 保持向后兼容性
- 记录所有破坏性更改

### 监控和日志
- 记录所有 API 调用
- 跟踪错误和重试
- 监控性能指标

## 安全注意事项

1. **凭证保护**: 永不提交 credentials.json 或 token.json
2. **权限最小化**: 仅请求必要的 Google Calendar 权限
3. **输入验证**: 严格验证所有用户输入
4. **错误信息**: 避免泄露敏感信息

## 未来改进方向

1. **缓存机制**: 减少 API 调用
2. **WebSocket 支持**: 实时事件通知
3. **多日历支持**: 管理多个日历
4. **高级搜索**: 更复杂的查询条件
5. **模板系统**: 事件模板快速创建
6. **统计分析**: 日历使用情况分析

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 编写测试
4. 提交 Pull Request
5. 等待代码审查

## 许可证

MIT License

---

**最后更新**: 2024-12-17
**版本**: 1.0.0
**作者**: @dashuai