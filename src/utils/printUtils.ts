import { CartItem, CustomerData } from '../types';

export interface PrintData {
  customerData: CustomerData;
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const encodePrintData = (data: PrintData): string => {
  const jsonString = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonString));
};

export const decodePrintData = (encodedData: string): PrintData | null => {
  try {
    const jsonString = decodeURIComponent(atob(encodedData));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding print data:', error);
    return null;
  }
};

export const generatePrintUrl = (data: PrintData, baseUrl: string): string => {
  const encodedData = encodePrintData(data);
  return `${baseUrl}/print?data=${encodedData}`;
};