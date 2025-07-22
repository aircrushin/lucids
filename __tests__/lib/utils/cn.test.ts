import { cn } from '@/lib/utils';

// Unmock the function since we want to test the actual implementation
jest.unmock('@/lib/utils');

describe('cn (Class Name Utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });
  
  it('should handle conditional class names', () => {
    const condition = true;
    expect(cn('base', condition && 'active')).toBe('base active');
    
    const falseCondition = false;
    expect(cn('base', falseCondition && 'active')).toBe('base');
  });
  
  it('should handle objects of class names', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
    expect(cn('base', { active: false, disabled: true })).toBe('base disabled');
  });
  
  it('should handle arrays of class names', () => {
    expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2');
  });
  
  it('should handle nested arrays and objects', () => {
    expect(cn('base', ['class1', { active: true }], { disabled: false })).toBe('base class1 active');
  });
  
  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'class1')).toBe('base class1');
  });
  
  it('should handle empty strings', () => {
    expect(cn('base', '', 'class1')).toBe('base class1');
  });
  
  it('should handle tailwind class conflicts using tailwind-merge', () => {
    // tailwind-merge should resolve conflicts by using the last class
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500 text-white', 'bg-blue-500')).toBe('text-white bg-blue-500');
  });
  
  it('should handle complex tailwind class combinations', () => {
    const result = cn(
      'flex items-center',
      'p-4 md:p-6',
      'text-sm md:text-base',
      { 'bg-blue-500': true, 'text-white': true, 'rounded-lg': false },
      ['shadow-md', 'hover:shadow-lg']
    );
    
    expect(result).toBe('flex items-center p-4 md:p-6 text-sm md:text-base bg-blue-500 text-white shadow-md hover:shadow-lg');
  });
});