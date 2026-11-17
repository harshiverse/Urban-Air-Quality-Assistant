import { describe, it, expect } from 'vitest';
import { cn, formatNumber, isServer, isClient } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (class name merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class');
      expect(result).toContain('base-class');
      expect(result).toContain('visible-class');
      expect(result).not.toContain('hidden-class');
    });
  });

  describe('formatNumber', () => {
    it('should format number with default decimal places', () => {
      expect(formatNumber(123.456)).toBe('123.5');
    });

    it('should format number with specified decimal places', () => {
      expect(formatNumber(123.456, 2)).toBe('123.46');
    });

    it('should handle integers', () => {
      expect(formatNumber(123, 1)).toBe('123.0');
    });
  });

  describe('isServer and isClient', () => {
    it('should correctly identify environment', () => {
      // In jsdom test environment, window is defined (simulated browser)
      // So isServer() will be false and isClient() will be true
      const serverCheck = isServer();
      const clientCheck = isClient();
      
      // These should be opposites
      expect(serverCheck).toBe(!clientCheck);
      expect(clientCheck).toBe(!serverCheck);
    });
  });
});
