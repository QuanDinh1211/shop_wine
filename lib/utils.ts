import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


 export const getTypeName = (type: string) => {
    switch (type) {
      case 'red':
        return 'Đỏ';
      case 'white':
        return 'Trắng';
      case 'rose':
        return 'Hồng';
      case 'sparkling':
        return 'Sủi bọt';
      default:
        return type;
    }
  };