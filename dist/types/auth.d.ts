import { z } from 'zod';
export declare const OAuth2ConfigSchema: z.ZodObject<{
    clientId: z.ZodString;
    clientSecret: z.ZodString;
    redirectUri: z.ZodString;
    scopes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}>;
export type OAuth2Config = z.infer<typeof OAuth2ConfigSchema>;
export declare const ServiceAccountConfigSchema: z.ZodObject<{
    type: z.ZodLiteral<"service_account">;
    project_id: z.ZodString;
    private_key_id: z.ZodString;
    private_key: z.ZodString;
    client_email: z.ZodString;
    client_id: z.ZodString;
    auth_uri: z.ZodString;
    token_uri: z.ZodString;
    auth_provider_x509_cert_url: z.ZodString;
    client_x509_cert_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "service_account";
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}, {
    type: "service_account";
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}>;
export type ServiceAccountConfig = z.infer<typeof ServiceAccountConfigSchema>;
export declare const TokenSetSchema: z.ZodObject<{
    access_token: z.ZodString;
    refresh_token: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
    token_type: z.ZodOptional<z.ZodString>;
    expiry_date: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    access_token: string;
    refresh_token?: string | undefined;
    scope?: string | undefined;
    token_type?: string | undefined;
    expiry_date?: number | undefined;
}, {
    access_token: string;
    refresh_token?: string | undefined;
    scope?: string | undefined;
    token_type?: string | undefined;
    expiry_date?: number | undefined;
}>;
export type TokenSet = z.infer<typeof TokenSetSchema>;
export declare const AuthConfigSchema: z.ZodUnion<[z.ZodObject<{
    clientId: z.ZodString;
    clientSecret: z.ZodString;
    redirectUri: z.ZodString;
    scopes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"service_account">;
    project_id: z.ZodString;
    private_key_id: z.ZodString;
    private_key: z.ZodString;
    client_email: z.ZodString;
    client_id: z.ZodString;
    auth_uri: z.ZodString;
    token_uri: z.ZodString;
    auth_provider_x509_cert_url: z.ZodString;
    client_x509_cert_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "service_account";
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}, {
    type: "service_account";
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}>]>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export declare const UserCredentialsSchema: z.ZodObject<{
    installed: z.ZodObject<{
        client_id: z.ZodString;
        project_id: z.ZodString;
        auth_uri: z.ZodString;
        token_uri: z.ZodString;
        auth_provider_x509_cert_url: z.ZodString;
        client_secret: z.ZodString;
        redirect_uris: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        project_id: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    }, {
        project_id: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    installed: {
        project_id: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}, {
    installed: {
        project_id: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}>;
export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
//# sourceMappingURL=auth.d.ts.map