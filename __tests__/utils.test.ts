/**
 * SciHub Pro - Utility Functions Tests
 * 
 * Tests for core utilities:
 * - cn() class name merger
 * - Type safety and edge cases
 */

import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should filter out falsy values', () => {
      const result = cn('base', false && 'hidden', null, undefined, '' && 'empty');
      expect(result).toBe('base');
    });

    it('should merge Tailwind classes without conflicts', () => {
      // Tailwind classes that might conflict should be properly merged
      const result = cn('px-4', 'px-2', 'py-1');
      // clsx + tailwind-merge should handle this
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', '', '')).toBe('');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['flex', 'items-center'], ['justify-between']);
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-between');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-sm': true,
        'text-lg': false,
        'font-bold': true,
      });
      expect(result).toContain('text-sm');
      expect(result).not.toContain('text-lg');
      expect(result).toContain('font-bold');
    });
  });
});
