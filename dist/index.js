#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { AuthService } from './services/auth.js';
import { CalendarService } from './services/calendar.js';
import { ConfigManager } from './services/config.js';
import { createEventTool, handleCreateEvent } from './tools/create-event.js';
import { updateEventTool, handleUpdateEvent } from './tools/update-event.js';
import { deleteEventTool, handleDeleteEvent } from './tools/delete-event.js';
import { listEventsTool, handleListEvents } from './tools/list-events.js';
import { searchEventsTool, handleSearchEvents } from './tools/search-events.js';
import { batchCreateEventsTool, handleBatchCreateEvents } from './tools/batch-create-events.js';
import { batchUpdateEventsTool, handleBatchUpdateEvents } from './tools/batch-update-events.js';
import { batchDeleteEventsTool, handleBatchDeleteEvents } from './tools/batch-delete-events.js';
class GoogleCalendarMCPServer {
    constructor() {
        this.server = new Server({
            name: 'google-calendar-mcp-server',
            version: '1.0.0',
        });
        this.configManager = new ConfigManager();
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                createEventTool,
                updateEventTool,
                deleteEventTool,
                listEventsTool,
                searchEventsTool,
                batchCreateEventsTool,
                batchUpdateEventsTool,
                batchDeleteEventsTool,
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                await this.ensureInitialized();
                switch (request.params.name) {
                    case 'create_event':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleCreateEvent(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'update_event':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleUpdateEvent(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'delete_event':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleDeleteEvent(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'list_events':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleListEvents(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'search_events':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleSearchEvents(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'batch_create_events':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleBatchCreateEvents(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'batch_update_events':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleBatchUpdateEvents(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    case 'batch_delete_events':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: await handleBatchDeleteEvents(request.params.arguments, this.calendarService),
                                },
                            ],
                        };
                    default:
                        throw new Error(`Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                                tool: request.params.name,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async ensureInitialized() {
        if (!this.authService) {
            await this.configManager.loadConfig();
            this.authService = new AuthService(this.configManager.getCredentialsPath(), this.configManager.getTokenPath());
            this.calendarService = new CalendarService(this.authService, this.configManager);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Google Calendar MCP Server running on stdio');
    }
}
async function main() {
    const args = process.argv.slice(2);
    let configPath;
    let credentialsPath;
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--config':
                configPath = args[++i];
                break;
            case '--credentials':
                credentialsPath = args[++i];
                break;
            case '--help':
                console.log(`
Google Calendar MCP Server

Usage: google-calendar-mcp [options]

Options:
  --config <path>       Path to config file
  --credentials <path>  Path to credentials file
  --help               Show this help message

Examples:
  google-calendar-mcp
  google-calendar-mcp --credentials ./credentials.json
  google-calendar-mcp --config ./config.json --credentials ./credentials.json
        `);
                process.exit(0);
            default:
                console.error(`Unknown argument: ${args[i]}`);
                process.exit(1);
        }
    }
    try {
        const server = new GoogleCalendarMCPServer();
        if (configPath || credentialsPath) {
            const configManager = new ConfigManager(configPath);
            await configManager.loadConfig();
            if (credentialsPath) {
                const config = configManager.getConfig();
                config.credentialsPath = credentialsPath;
                await configManager.saveConfig(config);
            }
        }
        await server.run();
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGINT', () => {
    console.error('Shutting down Google Calendar MCP Server');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.error('Shutting down Google Calendar MCP Server');
    process.exit(0);
});
if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
    main().catch((error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map