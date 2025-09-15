import fs from 'fs/promises';
import path from 'path';
export class ConfigManager {
    constructor(configPath) {
        this.config = {};
        this.configPath = configPath || path.join(process.cwd(), 'config', 'config.json');
    }
    async loadConfig() {
        try {
            const configContent = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(configContent);
            return this.config;
        }
        catch (error) {
            this.config = this.getDefaultConfig();
            return this.config;
        }
    }
    async saveConfig(config) {
        try {
            const configDir = path.dirname(this.configPath);
            await fs.mkdir(configDir, { recursive: true });
            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
            this.config = config;
        }
        catch (error) {
            throw new Error(`Failed to save config: ${error}`);
        }
    }
    getConfig() {
        return this.config;
    }
    getDefaultConfig() {
        return {
            credentialsPath: path.join(process.cwd(), 'config', 'credentials.json'),
            tokenPath: path.join(process.cwd(), 'config', 'token.json'),
            defaultCalendarId: 'primary',
            defaultTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    }
    getCredentialsPath() {
        return this.config.credentialsPath || this.getDefaultConfig().credentialsPath;
    }
    getTokenPath() {
        return this.config.tokenPath || this.getDefaultConfig().tokenPath;
    }
    getDefaultCalendarId() {
        return this.config.defaultCalendarId || 'primary';
    }
    getDefaultTimeZone() {
        return this.config.defaultTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}
//# sourceMappingURL=config.js.map