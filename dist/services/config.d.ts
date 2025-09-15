export interface Config {
    credentialsPath?: string;
    tokenPath?: string;
    defaultCalendarId?: string;
    defaultTimeZone?: string;
}
export declare class ConfigManager {
    private config;
    private configPath;
    constructor(configPath?: string);
    loadConfig(): Promise<Config>;
    saveConfig(config: Config): Promise<void>;
    getConfig(): Config;
    private getDefaultConfig;
    getCredentialsPath(): string;
    getTokenPath(): string;
    getDefaultCalendarId(): string;
    getDefaultTimeZone(): string;
}
//# sourceMappingURL=config.d.ts.map