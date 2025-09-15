# Google Calendar MCP Server

A Model Context Protocol (MCP) server for Google Calendar integration with Claude Desktop. Create, update, delete, and manage calendar events with batch operations and enterprise-grade retry mechanisms.

## 🚀 Quick Start

### 1. Install

```bash
npm install -g github:wanthigh/google-calendar-mcp-server
```

### 2. Set up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the JSON file

### 3. Configure

Create a folder for your config files and save your credentials:

```bash
mkdir ~/.google-calendar-mcp
# Save your downloaded credentials.json to ~/.google-calendar-mcp/credentials.json
```

### 4. Add to Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "google-calendar-mcp",
      "args": ["--credentials", "/Users/YOUR_USERNAME/.google-calendar-mcp/credentials.json"]
    }
  }
}
```

### 5. First Run

Restart Claude Desktop. The first time you use a calendar function, you'll be prompted to authorize access through your browser.

**Note**: If you need to manually authorize (rare), you can run:
```bash
google-calendar-mcp --credentials /Users/YOUR_USERNAME/.google-calendar-mcp/credentials.json
```

## ✨ Features

- **Single Operations**: Create, update, delete, list, and search events
- **Batch Operations**: Process multiple events efficiently
- **Smart Retry**: Automatic retry with exponential backoff for API failures
- **Rate Limiting**: Built-in protection against quota exhaustion
- **Authentication**: OAuth2 and Service Account support

## 🛠️ Available Tools

### Basic Operations
- `create_event` - Create a new calendar event
- `update_event` - Update an existing event
- `delete_event` - Delete an event
- `list_events` - List events in a time range
- `search_events` - Search events by keyword

### Batch Operations
- `batch_create_events` - Create multiple events
- `batch_update_events` - Update multiple events
- `batch_delete_events` - Delete multiple events

## 🔧 Example Usage in Claude

> "Create a meeting tomorrow at 2pm called 'Team Sync'"

> "List all my events for next week"

> "Delete the event with ID abc123"

> "Create 5 training sessions every Monday at 10am for the next month"

## 🐛 Troubleshooting

**"Authentication failed"**
- Check your credentials.json file path
- Complete the OAuth authorization in your browser

**"Calendar not found"**
- Make sure you're using the correct calendar ID
- For service accounts, share your calendar with the service account email

**"Rate limit exceeded"**
- The server has built-in retry mechanisms
- Reduce batch sizes if needed

## 📞 Support

- [GitHub Issues](https://github.com/wanthigh/google-calendar-mcp-server/issues)
- [Documentation](https://github.com/wanthigh/google-calendar-mcp-server)

## 📄 License

MIT License

---

**Version**: 1.0.1 | **Author**: @wanthigh