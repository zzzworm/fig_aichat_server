# Chat Conversation Create Message API

## 接口概述

`POST /api/chat-conversations/create-message` 接口用于创建聊天消息，通过AI Character的prompt调用Dify API生成回答。

`GET /api/chat-conversations/my-list` 接口用于获取当前用户的聊天对话列表。

## 功能特性

- ✅ 用户认证验证
- ✅ 接受 `character_id` 和 `query` 参数
- ✅ 自动查询AI Character的prompt
- ✅ 调用Dify API生成AI回答
- ✅ 支持流式响应（SSE）和非流式响应
- ✅ 自动保存聊天记录到数据库
- ✅ 完整的错误处理和验证
- ✅ 优先使用Dify返回的message_id和conversation_id
- ✅ 获取用户聊天历史列表
- ✅ 支持分页和排序
- ✅ 始终包含ai_character和user属性

## 接口参数

### create-message 请求参数

```json
{
  "data": {
    "character_id": "1",
    "query": "你好，请介绍一下你自己"
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| data.character_id | string | 是 | AI Character的documentId |
| data.query | string | 是 | 用户的问题或消息内容 |

### my-list 请求参数

```
GET /api/chat-conversations/my-list?page=1&pageSize=20&filters[ai_character][id][$eq]=1
```

#### 基础参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

#### 过滤条件 (filters)
| 过滤字段 | 操作符 | 示例 | 说明 |
|----------|--------|------|------|
| ai_character.id | $eq | `filters[ai_character][id][$eq]=1` | 按AI Character ID过滤 |
| conversation_id | $eq | `filters[conversation_id][$eq]=1234567890` | 按对话ID过滤 |
| message_status | $eq | `filters[message_status][$eq]=sent` | 按消息状态过滤 |
| createdAt | $gte, $lte | `filters[createdAt][$gte]=2024-01-01` | 按创建时间范围过滤 |
| query | $containsi | `filters[query][$containsi]=你好` | 按查询内容搜索（不区分大小写） |
| user.id | 自动添加 | - | 自动添加当前用户ID过滤 |

#### 查询示例

```bash
# 基础分页查询
GET /api/chat-conversations/my-list?page=1&pageSize=20

# 按AI Character过滤
GET /api/chat-conversations/my-list?filters[ai_character][id][$eq]=1

# 按时间范围过滤
GET /api/chat-conversations/my-list?filters[createdAt][$gte]=2024-01-01&filters[createdAt][$lte]=2024-12-31

# 组合过滤条件
GET /api/chat-conversations/my-list?filters[ai_character][id][$eq]=1&filters[createdAt][$gte]=2024-01-01&page=1&pageSize=15

# 搜索查询内容
GET /api/chat-conversations/my-list?filters[query][$containsi]=你好
```

### 响应格式

#### create-message 成功响应

```json
{
  "data": [
    {
      "id": 1,
      "message_id": "msg_1234567890_abc123",
      "query": "你好，请介绍一下你自己",
      "answer": "AI生成的回答内容",
      "conversation_id": "1234567890",
      "ai_character": {...},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "message_id": "msg_1234567890_def456",
      "query": "你好，请介绍一下你自己",
      "answer": "AI生成的回答内容",
      "conversation_id": "1234567890",
      "ai_character": {...},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### my-list 成功响应

```json
{
  "data": [
    {
      "id": 1,
      "message_id": "msg_1234567890_abc123",
      "query": "用户问题",
      "answer": "AI回答",
      "conversation_id": "1234567890",
      "ai_character": {
        "id": 1,
        "name": "AI助手",
        "prompt": "你是一个AI助手",
        "introduce": "我是AI助手"
      },
      "user": {
        "id": 1,
        "username": "user123",
        "email": "user@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### 错误响应

```json
{
  "error": {
    "message": "错误描述",
    "status": 400
  }
}
```

## 中间件配置

接口应用了 `global::koasseStream` 中间件，支持Server-Sent Events (SSE)流式响应。

### 中间件功能

- 实时流式数据传输
- 支持长连接
- 自动心跳保持
- 客户端断开检测

## 使用示例

### JavaScript/TypeScript

```typescript
// 创建聊天消息
const response = await fetch('/api/chat-conversations/create-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    data: {
      character_id: '1',
      query: '你好，请介绍一下你自己'
    }
  })
});

const result = await response.json();
console.log('用户消息:', result.data[0]);
console.log('AI回答:', result.data[1]);

// 获取聊天列表
const listResponse = await fetch('/api/chat-conversations/my-list?page=1&pageSize=20', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const listResult = await listResponse.json();
console.log('聊天列表:', listResult.data);
console.log('分页信息:', listResult.meta.pagination);
```

### cURL

```bash
# 创建聊天消息
curl -X POST http://localhost:1337/api/chat-conversations/create-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "character_id": "1",
      "query": "你好，请介绍一下你自己"
    }
  }'

# 获取聊天列表
curl -X GET "http://localhost:1337/api/chat-conversations/my-list?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### HTTP测试文件

项目根目录包含 `test-create-message.http` 文件，可直接在VS Code或支持HTTP文件的编辑器中测试。

## 错误处理

| 状态码 | 错误类型 | 说明 |
|--------|----------|------|
| 401 | Unauthorized | 用户未认证 |
| 400 | Bad Request | 缺少必要参数（character_id或query） |
| 400 | Bad Request | AI Character不存在 |
| 400 | Bad Request | AI Character缺少prompt配置 |
| 500 | Internal Server Error | 服务器内部错误 |

## 数据库结构

### Chat Conversation 表

```sql
CREATE TABLE chat_conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  message_id VARCHAR(255) NOT NULL UNIQUE,
  query TEXT NOT NULL,
  answer TEXT,
  conversation_id VARCHAR(255),
  ai_character BIGINT,
  user BIGINT,
  message_status ENUM('sent', 'read') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### AI Character 表

```sql
CREATE TABLE ai_characters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  prompt TEXT,
  introduce TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 环境配置

确保以下环境变量已正确配置：

```bash
# Dify API配置
DIFFBOT_API_URL=https://your-dify-instance.com
DIFFBOT_API_KEY=your-dify-api-key

# Strapi配置
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

## 开发说明

### 文件结构

```
src/api/chat-conversation/
├── controllers/
│   └── chat-conversation.ts    # 控制器逻辑
├── routes/
│   ├── chat-conversation.ts    # 标准路由配置
│   └── custom.ts               # 自定义路由配置
├── services/
│   └── chat-conversation.ts    # 服务层
└── content-types/
    └── chat-conversation/
        └── schema.json         # 数据模型定义
```

### 核心组件

1. **控制器**: 处理HTTP请求，验证参数，调用服务
2. **服务**: 业务逻辑处理，数据库操作
3. **路由**: API端点定义，中间件配置
4. **中间件**: SSE流式响应支持

### 核心逻辑流程

#### create-message 流程
1. **用户认证验证**: 检查ctx.state.user是否存在
2. **参数验证**: 验证data.character_id和data.query
3. **AI Character查询**: 使用strapi.documents查询AI Character
4. **创建用户消息**: 记录用户的查询
5. **调用Dify API**: 传递prompt和query参数
6. **处理响应**: 兼容流式和非流式响应
7. **更新记录**: 使用Dify返回的message_id和conversation_id
8. **创建AI回答**: 记录AI的回答
9. **响应处理**: 根据是否有SSE返回不同格式

#### my-list 流程
1. **用户认证验证**: 检查ctx.state.user是否存在
2. **参数处理**: 获取分页参数（page, pageSize）和过滤条件（filters）
3. **分页计算**: 计算start和limit值
4. **过滤条件构建**: 合并外部传入的过滤条件和用户ID过滤
5. **数据查询**: 使用strapi.documents查询用户聊天记录，支持所有传入的查询参数
6. **关联数据**: 始终包含ai_character和user属性
7. **数据清理**: 使用strapi.contentAPI.sanitize.output清理输出数据
8. **分页处理**: 计算完整的分页信息（page, pageSize, pageCount, total）
9. **返回结果**: 使用transformResponse返回标准化的响应格式

### 扩展功能

- 支持多种AI模型
- 聊天历史记录查询
- 用户权限控制
- 实时通知推送
- 分页和排序支持

## 注意事项

1. **认证**: 接口需要用户认证，请确保传递有效的JWT Token
2. **性能**: 大量并发请求时注意Dify API的限流
3. **安全**: 确保API密钥安全存储，避免泄露
4. **监控**: 建议添加请求日志和性能监控
5. **缓存**: 可考虑对AI Character的prompt进行缓存优化
6. **流式响应**: 支持SSE和普通HTTP响应两种模式
7. **分页**: my-list接口支持分页，避免一次性返回过多数据
8. **关联数据**: 始终返回ai_character和user的完整信息
9. **过滤条件**: 支持多种过滤操作符，如$eq, $gte, $lte, $containsi等
10. **查询灵活性**: 支持组合过滤条件，满足复杂的查询需求
11. **数据清理**: 使用Strapi内置的数据清理功能，确保输出数据安全
12. **用户隔离**: 自动添加用户ID过滤，确保用户只能访问自己的数据