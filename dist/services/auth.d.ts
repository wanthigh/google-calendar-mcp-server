export declare class AuthService {
    private oauth2Client;
    private credentials;
    private tokenPath;
    constructor(credentialsPath?: string, tokenPath?: string);
    loadCredentials(credentialsPath: string): Promise<void>;
    private initializeServiceAccount;
    private initializeOAuth2;
    authorize(): Promise<void>;
    setAuthorizationCode(code: string): Promise<void>;
    private loadToken;
    private saveToken;
    refreshToken(): Promise<void>;
    getAuthClient(): any;
    isAuthenticated(): boolean;
    ensureAuthenticated(): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map