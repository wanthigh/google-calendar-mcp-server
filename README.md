# Google Calendar MCP Server

A Model Context Protocol (MCP) server that provides comprehensive Google Calendar integration for Claude Desktop and other MCP clients. Features include single and batch operations with enterprise-grade retry mechanisms and error handling.

## 🚀 Features

### Core Functionality
- **Create Events**: Create single or batch calendar events with full details
- **Update Events**: Modify existing events including time, attendees, and details
- **Delete Events**: Remove single or batch events from your calendar
- **List Events**: Retrieve events within specified date ranges
- **Search Events**: Find events by keywords across title, description, and location

### Advanced Features
- **Batch Operations**: Process multiple events efficiently with rate limiting
- **Retry Mechanism**: Automatic retry with exponential backoff for transient failures
- **Error Recovery**: Continue processing on individual failures with detailed error reporting
- **OAuth2 & Service Account**: Support for both authentication methods
- **Rate Limiting Protection**: Built-in safeguards against API quota exhaustion

## 📦 Installation

### Prerequisites

- Node.js 18.0.0 or higher

### Quick Install (Recommended)

```bash
# Install directly from GitHub (no npm publish required)
npm install -g github:wanthigh/google-calendar-mcp-server
```

### Alternative Methods

<details>
<summary>Click to expand other installation options</summary>

#### Install from Source
```bash
git clone https://github.com/wanthigh/google-calendar-mcp-server.git
cd google-calendar-mcp-server
npm install
npm run build
npm link
```

#### Publish to npm (optional for maintainer)
```bash
# First time: login to npm
npm login

# Publish to npm registry
npm publish --access public

# Then users can install via:
# npm install -g @wanthigh/google-calendar-mcp-server
```

</details>

## 🔧 Setup

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create Credentials

#### Option A: OAuth2 Credentials (Recommended for personal use)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Desktop application" as the application type
4. Download the credentials JSON file
5. Save it as `config/credentials.json`

**Note**: For development, add test users in OAuth consent screen to bypass verification requirements.

#### Option B: Service Account (For automation/server use)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Create and download the JSON key
5. Save it as `config/credentials.json`
6. Share your calendar with the service account email

### 3. Configure the Server

Create configuration files:

```bash
mkdir -p config
```

Create `config/config.json`:

```json
{
  "credentialsPath": "./config/credentials.json",
  "tokenPath": "./config/token.json",
  "defaultCalendarId": "primary",
  "defaultTimeZone": "America/New_York"
}
```

### 4. First Run Authorization (OAuth2 only)

For OAuth2, complete the authorization flow:

```bash
node dist/index.js --credentials ./config/credentials.json
```

Follow the authorization URL to grant permissions. The token will be saved automatically.

## 🎯 Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "google-calendar-mcp",
      "args": []
    }
  }
}
```

**Note**: After installation, `google-calendar-mcp` will be available globally in your PATH.

### Command Line Options

```bash
google-calendar-mcp [options]

Options:
  --config <path>       Path to config file
  --credentials <path>  Path to credentials file
  --help               Show help message
```

## 🛠️ Available Tools

### Single Event Operations

#### create_event
Create a new calendar event.

```json
{
  "summary": "Team Meeting",
  "description": "Weekly team sync",
  "location": "Conference Room A",
  "start": {
    "dateTime": "2024-12-25T10:00:00Z",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2024-12-25T11:00:00Z",
    "timeZone": "America/New_York"
  },
  "attendees": [
    {
      "email": "colleague@example.com",
      "displayName": "Colleague Name"
    }
  ]
}
```

#### update_event
Update an existing event. Requires `eventId` and any fields to update.

#### delete_event
Delete an event. Requires `eventId`.

#### list_events
List events within a time range.

```json
{
  "timeMin": "2024-12-01T00:00:00Z",
  "timeMax": "2024-12-31T23:59:59Z",
  "maxResults": 100,
  "singleEvents": true
}
```

#### search_events
Search events by keyword.

```json
{
  "q": "meeting",
  "timeMin": "2024-12-01T00:00:00Z",
  "maxResults": 50
}
```

### Batch Operations

#### batch_create_events
Create multiple events efficiently with retry support.

```json
{
  "events": [
    {
      "summary": "Event 1",
      "start": { "dateTime": "2024-12-25T10:00:00Z" },
      "end": { "dateTime": "2024-12-25T11:00:00Z" }
    },
    {
      "summary": "Event 2",
      "start": { "dateTime": "2024-12-25T14:00:00Z" },
      "end": { "dateTime": "2024-12-25T15:00:00Z" }
    }
  ],
  "options": {
    "batchSize": 10,
    "delayBetweenBatches": 500,
    "continueOnError": true,
    "retryOptions": {
      "maxRetries": 3,
      "baseDelay": 1000,
      "maxDelay": 10000,
      "backoffMultiplier": 2
    }
  }
}
```

#### batch_update_events
Update multiple events with retry support.

```json
{
  "updates": [
    {
      "eventId": "event1_id",
      "summary": "Updated Event 1"
    },
    {
      "eventId": "event2_id",
      "location": "New Location"
    }
  ],
  "options": {
    "batchSize": 10,
    "continueOnError": true,
    "retryOptions": {
      "maxRetries": 3
    }
  }
}
```

#### batch_delete_events
Delete multiple events with confirmation option.

```json
{
  "eventIds": ["event1_id", "event2_id", "event3_id"],
  "options": {
    "batchSize": 10,
    "confirmationRequired": false,
    "retryOptions": {
      "maxRetries": 5
    }
  }
}
```

## ⚙️ Configuration

### Configuration Files

- `config/credentials.json`: Google API credentials (OAuth2 or Service Account)
- `config/config.json`: Server configuration
- `config/token.json`: OAuth2 tokens (auto-generated)

### Retry Configuration

All batch operations support configurable retry mechanisms:

```json
{
  "retryOptions": {
    "maxRetries": 3,           // Maximum retry attempts (0-10)
    "baseDelay": 1000,         // Base delay in ms (100-10000)
    "maxDelay": 10000,         // Maximum delay in ms (1000-60000)
    "backoffMultiplier": 2     // Exponential backoff multiplier (1-5)
  }
}
```

### Batch Processing Options

```json
{
  "batchSize": 10,              // Events processed simultaneously (1-50)
  "delayBetweenBatches": 500,   // Delay between batches in ms (0-5000)
  "continueOnError": true       // Continue if individual operations fail
}
```

## 🔍 Error Handling

The server provides comprehensive error handling with automatic retry for transient failures:

### Retryable Errors
- `429 Rate Limit Exceeded`
- `403 Quota Exceeded`
- `503 Service Unavailable`
- Network errors (ECONNRESET, ETIMEDOUT)
- Internal server errors

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "tool": "tool_name",
  "retriesAttempted": 3,
  "errors": [
    {
      "index": 0,
      "eventId": "failed_event_id",
      "error": "Specific error message"
    }
  ]
}
```

## 🧪 Testing

### Run Test Suites

```bash
# Test all functionality
node test-local.js

# Step-by-step validation
node step-by-step-test.js

# Batch operations test
node test-all-batch.js

# Retry mechanism test
node test-retry-mechanism.js
```

### Development Commands

```bash
# Build TypeScript
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **"Calendar MCP Server尚未完成 Google 验证流程"**
   - Add yourself as a test user in Google Cloud Console
   - Or complete the OAuth consent screen verification

2. **"Missing end time" when updating events**
   - This is handled automatically by fetching existing event data first
   - The server preserves all required fields during updates

3. **Rate Limiting (429 errors)**
   - Batch operations include automatic retry with exponential backoff
   - Adjust `batchSize` and `delayBetweenBatches` for your quota

4. **Authentication Failed**
   - Verify credentials.json is valid
   - For OAuth2: Re-run authorization flow
   - For Service Account: Ensure calendar is shared

### Debug Mode

Enable verbose logging:

```bash
DEBUG=google-calendar-mcp node dist/index.js
```

## 📚 Architecture

### Key Components

- **Services**
  - `AuthService`: OAuth2 and Service Account authentication
  - `CalendarService`: Google Calendar API wrapper
  - `ConfigManager`: Configuration management

- **Tools**
  - Single operation tools for CRUD operations
  - Batch operation tools with retry mechanisms

- **Utils**
  - `retry.ts`: Exponential backoff retry logic
  - `validation.ts`: Zod-based input validation
  - `error.ts`: Custom error classes

### Important Implementation Details

1. **Event Updates**: Google Calendar API requires complete event data when updating. The server automatically fetches existing data before applying updates.

2. **Batch Processing**: Operations are processed in configurable batches with concurrency control and rate limiting.

3. **Retry Mechanism**: Implements exponential backoff with jitter for optimal retry behavior.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/dashuai/google-calendar-mcp-server/issues)
- **Documentation**: [Read the docs](https://github.com/dashuai/google-calendar-mcp-server#readme)
- **Development Guide**: See [CLAUDE.md](./CLAUDE.md) for detailed development guidance

## 🙏 Acknowledgments

- Built with [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Google Calendar API](https://developers.google.com/calendar)
- Type validation by [Zod](https://github.com/colinhacks/zod)

---

**Version**: 1.0.0
**Author**: @dashuai
**Last Updated**: December 2024