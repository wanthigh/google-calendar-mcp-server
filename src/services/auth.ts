import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import {
  ServiceAccountConfig,
  UserCredentials,
  UserCredentialsSchema,
  ServiceAccountConfigSchema,
  TokenSetSchema
} from '../types/auth.js';
import { AuthenticationError } from '../utils/error.js';

export class AuthService {
  private oauth2Client: OAuth2Client | null = null;
  private credentials: ServiceAccountConfig | UserCredentials | null = null;
  private tokenPath: string;

  constructor(credentialsPath?: string, tokenPath?: string) {
    this.tokenPath = tokenPath || path.join(process.cwd(), 'token.json');
    if (credentialsPath) {
      this.loadCredentials(credentialsPath);
    }
  }

  async loadCredentials(credentialsPath: string): Promise<void> {
    try {
      const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
      const credentialsData = JSON.parse(credentialsContent);

      // Try to parse as service account first
      try {
        this.credentials = ServiceAccountConfigSchema.parse(credentialsData);
        await this.initializeServiceAccount(this.credentials);
        return;
      } catch {
        // If not service account, try OAuth2 user credentials
        this.credentials = UserCredentialsSchema.parse(credentialsData);
        await this.initializeOAuth2(this.credentials);
      }
    } catch (error) {
      throw new AuthenticationError(
        `Failed to load credentials from ${credentialsPath}`,
        error as Error
      );
    }
  }

  private async initializeServiceAccount(credentials: ServiceAccountConfig): Promise<void> {
    try {
      const auth = google.auth.fromJSON(credentials);
      if ('scopes' in auth) {
        auth.scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ];
      }

      google.options({ auth: auth as any });
      console.log('Service account authentication initialized successfully');
    } catch (error) {
      throw new AuthenticationError(
        'Failed to initialize service account authentication',
        error as Error
      );
    }
  }

  private async initializeOAuth2(credentials: UserCredentials): Promise<void> {
    try {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      this.oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

      // Try to load existing token
      try {
        await this.loadToken();
      } catch {
        console.log('No existing token found. Authorization required.');
      }
    } catch (error) {
      throw new AuthenticationError(
        'Failed to initialize OAuth2 authentication',
        error as Error
      );
    }
  }

  async authorize(): Promise<void> {
    if (!this.oauth2Client) {
      throw new AuthenticationError('OAuth2 client not initialized');
    }

    // Check if we already have valid credentials
    if (this.oauth2Client.credentials && this.oauth2Client.credentials.access_token) {
      return;
    }

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    throw new AuthenticationError(
      'Authorization required. Please visit the provided URL and complete the authorization flow.'
    );
  }

  async setAuthorizationCode(code: string): Promise<void> {
    if (!this.oauth2Client) {
      throw new AuthenticationError('OAuth2 client not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      await this.saveToken(tokens);
      console.log('Authorization successful');
    } catch (error) {
      throw new AuthenticationError(
        'Failed to exchange authorization code for tokens',
        error as Error
      );
    }
  }

  private async loadToken(): Promise<void> {
    try {
      const tokenContent = await fs.readFile(this.tokenPath, 'utf8');
      const tokenData = JSON.parse(tokenContent);
      const token = TokenSetSchema.parse(tokenData);

      if (this.oauth2Client) {
        this.oauth2Client.setCredentials(token);
      }

      console.log('Token loaded successfully');
    } catch (error) {
      throw new AuthenticationError('Failed to load token', error as Error);
    }
  }

  private async saveToken(tokens: any): Promise<void> {
    try {
      const tokenData = TokenSetSchema.parse(tokens);
      await fs.writeFile(this.tokenPath, JSON.stringify(tokenData, null, 2));
      console.log('Token saved successfully');
    } catch (error) {
      throw new AuthenticationError('Failed to save token', error as Error);
    }
  }

  async refreshToken(): Promise<void> {
    if (!this.oauth2Client) {
      throw new AuthenticationError('OAuth2 client not initialized');
    }

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      await this.saveToken(credentials);
      console.log('Token refreshed successfully');
    } catch (error) {
      throw new AuthenticationError('Failed to refresh token', error as Error);
    }
  }

  getAuthClient(): any {
    if (this.oauth2Client) {
      return this.oauth2Client;
    }

    // For service accounts, return the default auth
    return google.auth.getClient() as any;
  }

  isAuthenticated(): boolean {
    if (this.credentials && 'type' in this.credentials && this.credentials.type === 'service_account') {
      return true; // Service accounts are always authenticated once loaded
    }

    return !!(this.oauth2Client && this.oauth2Client.credentials && this.oauth2Client.credentials.access_token);
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated()) {
      if (this.oauth2Client && this.oauth2Client.credentials?.refresh_token) {
        await this.refreshToken();
      } else {
        await this.authorize();
      }
    }
  }
}