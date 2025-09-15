import { z } from 'zod';
import { ValidationError } from './error.js';

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Validation failed: ${messages.join(', ')}`);
    }
    throw new ValidationError('Invalid input format');
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDateTime(dateTime: string): boolean {
  try {
    const date = new Date(dateTime);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

export function isValidDate(date: string): boolean {
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && date === dateObj.toISOString().split('T')[0];
  } catch {
    return false;
  }
}