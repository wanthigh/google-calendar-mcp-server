#!/bin/bash

# Google Calendar MCP Server startup script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Google Calendar MCP Server${NC}"
echo "=================================="

# Check if credentials file exists
CREDENTIALS_FILE="./config/credentials.json"
CONFIG_FILE="./config/config.json"

if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo -e "${YELLOW}Warning: Credentials file not found at $CREDENTIALS_FILE${NC}"
    echo "Please follow the setup guide to create your Google credentials:"
    echo "1. Go to Google Cloud Console"
    echo "2. Enable Calendar API"
    echo "3. Create OAuth2 or Service Account credentials"
    echo "4. Save as config/credentials.json"
    echo ""
    echo "See docs/setup.md for detailed instructions."
    echo ""
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}Warning: Config file not found. Creating default config...${NC}"
    cp config/config.example.json config/config.json
    echo "Created config/config.json from example."
fi

# Start the server
echo "Starting Google Calendar MCP Server..."
echo "Press Ctrl+C to stop"
echo ""

if [ -f "$CREDENTIALS_FILE" ]; then
    node dist/index.js --credentials "$CREDENTIALS_FILE"
else
    echo -e "${RED}Error: Cannot start without credentials file${NC}"
    echo "Please create $CREDENTIALS_FILE first"
    exit 1
fi