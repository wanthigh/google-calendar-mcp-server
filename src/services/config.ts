import fs from 'fs/promises';
import path from 'path';

export interface Config {
  credentialsPath?: string;
  tokenPath?: string;
  defaultCalendarId?: string;
  defaultTimeZone?: string;
}

export class ConfigManager {
  private config: Config = {};
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'config', 'config.json');
  }

  async loadConfig(): Promise<Config> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      return this.config;
    } catch (error) {
      // If config file doesn't exist, use default config
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  async saveConfig(config: Config): Promise<void> {
    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });

      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  getConfig(): Config {
    return this.config;
  }

  private getDefaultConfig(): Config {
    return {
      credentialsPath: path.join(process.cwd(), 'config', 'credentials.json'),
      tokenPath: path.join(process.cwd(), 'config', 'token.json'),
      defaultCalendarId: 'primary',
      defaultTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  getCredentialsPath(): string {
    return this.config.credentialsPath || this.getDefaultConfig().credentialsPath!;
  }

  getTokenPath(): string {
    return this.config.tokenPath || this.getDefaultConfig().tokenPath!;
  }

  getDefaultCalendarId(): string {
    return this.config.defaultCalendarId || 'primary';
  }

  getDefaultTimeZone(): string {
    return this.config.defaultTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}