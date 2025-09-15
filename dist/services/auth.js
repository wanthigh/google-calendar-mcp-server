import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import { UserCredentialsSchema, ServiceAccountConfigSchema, TokenSetSchema } from '../types/auth.js';
import { AuthenticationError } from '../utils/error.js';
export class AuthService {
    constructor(credentialsPath, tokenPath) {
        this.oauth2Client = null;
        this.credentials = null;
        this.tokenPath = tokenPath || path.join(process.cwd(), 'token.json');
        if (credentialsPath) {
            this.loadCredentials(credentialsPath);
        }
    }
    async loadCredentials(credentialsPath) {
        try {
            const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
            const credentialsData = JSON.parse(credentialsContent);
            try {
                this.credentials = ServiceAccountConfigSchema.parse(credentialsData);
                await this.initializeServiceAccount(this.credentials);
                return;
            }
            catch {
                this.credentials = UserCredentialsSchema.parse(credentialsData);
                await this.initializeOAuth2(this.credentials);
            }
        }
        catch (error) {
            throw new AuthenticationError(`Failed to load credentials from ${credentialsPath}`, error);
        }
    }
    async initializeServiceAccount(credentials) {
        try {
            const auth = google.auth.fromJSON(credentials);
            if ('scopes' in auth) {
                auth.scopes = [
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/calendar.events'
                ];
            }
            google.options({ auth: auth });
            console.log('Service account authentication initialized successfully');
        }
        catch (error) {
            throw new AuthenticationError('Failed to initialize service account authentication', error);
        }
    }
    async initializeOAuth2(credentials) {
        try {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            this.oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
            try {
                await this.loadToken();
            }
            catch {
                console.log('No existing token found. Authorization required.');
            }
        }
        catch (error) {
            throw new AuthenticationError('Failed to initialize OAuth2 authentication', error);
        }
    }
    async authorize() {
        if (!this.oauth2Client) {
            throw new AuthenticationError('OAuth2 client not initialized');
        }
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
        throw new AuthenticationError('Authorization required. Please visit the provided URL and complete the authorization flow.');
    }
    async setAuthorizationCode(code) {
        if (!this.oauth2Client) {
            throw new AuthenticationError('OAuth2 client not initialized');
        }
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            await this.saveToken(tokens);
            console.log('Authorization successful');
        }
        catch (error) {
            throw new AuthenticationError('Failed to exchange authorization code for tokens', error);
        }
    }
    async loadToken() {
        try {
            const tokenContent = await fs.readFile(this.tokenPath, 'utf8');
            const tokenData = JSON.parse(tokenContent);
            const token = TokenSetSchema.parse(tokenData);
            if (this.oauth2Client) {
                this.oauth2Client.setCredentials(token);
            }
            console.log('Token loaded successfully');
        }
        catch (error) {
            throw new AuthenticationError('Failed to load token', error);
        }
    }
    async saveToken(tokens) {
        try {
            const tokenData = TokenSetSchema.parse(tokens);
            await fs.writeFile(this.tokenPath, JSON.stringify(tokenData, null, 2));
            console.log('Token saved successfully');
        }
        catch (error) {
            throw new AuthenticationError('Failed to save token', error);
        }
    }
    async refreshToken() {
        if (!this.oauth2Client) {
            throw new AuthenticationError('OAuth2 client not initialized');
        }
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            await this.saveToken(credentials);
            console.log('Token refreshed successfully');
        }
        catch (error) {
            throw new AuthenticationError('Failed to refresh token', error);
        }
    }
    getAuthClient() {
        if (this.oauth2Client) {
            return this.oauth2Client;
        }
        return google.auth.getClient();
    }
    isAuthenticated() {
        if (this.credentials && 'type' in this.credentials && this.credentials.type === 'service_account') {
            return true;
        }
        return !!(this.oauth2Client && this.oauth2Client.credentials && this.oauth2Client.credentials.access_token);
    }
    async ensureAuthenticated() {
        if (!this.isAuthenticated()) {
            if (this.oauth2Client && this.oauth2Client.credentials?.refresh_token) {
                await this.refreshToken();
            }
            else {
                await this.authorize();
            }
        }
    }
}
//# sourceMappingURL=auth.js.map