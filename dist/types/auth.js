import { z } from 'zod';
export const OAuth2ConfigSchema = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string(),
    scopes: z.array(z.string()),
});
export const ServiceAccountConfigSchema = z.object({
    type: z.literal('service_account'),
    project_id: z.string(),
    private_key_id: z.string(),
    private_key: z.string(),
    client_email: z.string(),
    client_id: z.string(),
    auth_uri: z.string(),
    token_uri: z.string(),
    auth_provider_x509_cert_url: z.string(),
    client_x509_cert_url: z.string(),
});
export const TokenSetSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
    expiry_date: z.number().optional(),
});
export const AuthConfigSchema = z.union([
    OAuth2ConfigSchema,
    ServiceAccountConfigSchema,
]);
export const UserCredentialsSchema = z.object({
    installed: z.object({
        client_id: z.string(),
        project_id: z.string(),
        auth_uri: z.string(),
        token_uri: z.string(),
        auth_provider_x509_cert_url: z.string(),
        client_secret: z.string(),
        redirect_uris: z.array(z.string()),
    }),
});
//# sourceMappingURL=auth.js.map