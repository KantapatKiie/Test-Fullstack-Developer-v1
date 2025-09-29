import { useState, useEffect } from 'react';

/**
 * Custom hook สำหรับ debounce value
 * @param value - ค่าที่จะ debounce
 * @param delay - เวลา delay ในมิลลิวินาที
 * @returns debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function ที่จะ cancel timeout ถ้า value เปลี่ยนก่อน delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}