import { z } from 'zod';
export declare function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T;
export declare function isValidEmail(email: string): boolean;
export declare function isValidDateTime(dateTime: string): boolean;
export declare function isValidDate(date: string): boolean;
//# sourceMappingURL=validation.d.ts.map