# Google Calendar MCP Server Setup Guide

This guide walks you through setting up the Google Calendar MCP Server step by step.

## Prerequisites

- Node.js 18.0.0 or higher
- A Google account
- Access to Google Cloud Console

## Step 1: Google Cloud Project Setup

### 1.1 Create a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "calendar-mcp-server")
5. Click "Create"

### 1.2 Enable Calendar API

1. In the Google Cloud Console, make sure your project is selected
2. Go to "APIs & Services" > "Library"
3. Search for "Google Calendar API"
4. Click on "Google Calendar API"
5. Click "Enable"

## Step 2: Create Credentials

Choose **one** of the following options:

### Option A: OAuth2 Credentials (Recommended for Personal Use)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace account)
   - Fill in the required fields:
     - App name: "Calendar MCP Server"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `auth/calendar` and `auth/calendar.events`
   - Add test users: Your email address
4. For Application type, choose "Desktop application"
5. Give it a name (e.g., "Calendar MCP Client")
6. Click "Create"
7. Download the JSON file
8. Save it as `config/credentials.json` in your project directory

### Option B: Service Account (For Automation)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter a name and description
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"
7. Click on the created service account
8. Go to the "Keys" tab
9. Click "Add Key" > "Create new key"
10. Choose JSON format
11. Download the key file
12. Save it as `config/credentials.json`

**Important for Service Accounts**: You'll need to share your calendar with the service account email address (found in the credentials file).

## Step 3: Install the Server

### Install from npm

```bash
npm install -g @dashuai/google-calendar-mcp-server
```

### Or install from source

```bash
git clone https://github.com/dashuai/google-calendar-mcp-server.git
cd google-calendar-mcp-server
npm install
npm run build
npm link
```

## Step 4: Configuration

1. Create the config directory:
   ```bash
   mkdir -p config
   ```

2. Copy your credentials file to `config/credentials.json`

3. Create a config file:
   ```bash
   cp config/config.example.json config/config.json
   ```

4. Edit `config/config.json` if needed (the defaults should work for most cases)

## Step 5: Initial Authorization (OAuth2 only)

If you're using OAuth2 credentials, you need to authorize the application:

1. Run the server:
   ```bash
   google-calendar-mcp --credentials ./config/credentials.json
   ```

2. The server will print an authorization URL. Copy and paste it into your browser.

3. Complete the Google authorization flow:
   - Sign in to your Google account
   - Grant permissions to the application
   - Copy the authorization code

4. The server will save the tokens automatically for future use.

## Step 6: Claude Desktop Integration

Add the server to your Claude Desktop configuration:

### macOS/Linux
Edit `~/.config/claude-desktop/claude_desktop_config.json`:

### Windows
Edit `%APPDATA%/claude-desktop/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "google-calendar-mcp",
      "args": ["--credentials", "/full/path/to/your/config/credentials.json"]
    }
  }
}
```

**Important**: Use the full absolute path to your credentials file.

## Step 7: Test the Installation

1. Restart Claude Desktop
2. Try creating a test event:
   ```
   Create a calendar event for tomorrow at 2 PM called "Test Event"
   ```

3. Try listing your events:
   ```
   List my calendar events for this week
   ```

## Troubleshooting

### Common Issues

**Error: "Authentication failed"**
- Verify your credentials.json file is valid JSON
- For OAuth2: Make sure you completed the authorization flow
- For Service Account: Ensure the calendar is shared with the service account email

**Error: "Command not found: google-calendar-mcp"**
- Make sure the package is installed globally with `-g` flag
- Try running `npm list -g` to verify installation
- On some systems, you may need to add npm's global bin directory to your PATH

**Error: "Permission denied"**
- Check that the Google Calendar API is enabled in your project
- Verify the OAuth2 scopes include calendar access
- For Service Account: Share your calendar with the service account email

**Error: "File not found"**
- Use absolute paths in the Claude Desktop configuration
- Verify the credentials file exists at the specified path

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify all files are in the correct locations
3. Test the credentials outside of Claude Desktop first
4. Check the [GitHub Issues](https://github.com/dashuai/google-calendar-mcp-server/issues) for similar problems

## Security Notes

- Keep your credentials.json file secure and never share it
- The token.json file contains access tokens - treat it as sensitive
- Use Service Accounts for automation, OAuth2 for personal use
- Regularly review and rotate your credentials if needed