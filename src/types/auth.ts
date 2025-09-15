import { z } from 'zod';

// OAuth2 Configuration
export const OAuth2ConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
});

export type OAuth2Config = z.infer<typeof OAuth2ConfigSchema>;

// Service Account Configuration
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

export type ServiceAccountConfig = z.infer<typeof ServiceAccountConfigSchema>;

// Tokens
export const TokenSetSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
  expiry_date: z.number().optional(),
});

export type TokenSet = z.infer<typeof TokenSetSchema>;

// Auth Config Union
export const AuthConfigSchema = z.union([
  OAuth2ConfigSchema,
  ServiceAccountConfigSchema,
]);

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// User credentials for OAuth2
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

export type UserCredentials = z.infer<typeof UserCredentialsSchema>;