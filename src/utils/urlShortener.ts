export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const storeOrderData = (data: any): string => {
  const shortId = generateShortId();
  const key = `order_${shortId}`;
  localStorage.setItem(key, JSON.stringify(data));
  return shortId;
};

export const getOrderData = (shortId: string): any | null => {
  const key = `order_${shortId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const generateShortPrintUrl = (data: any, baseUrl: string): string => {
  const shortId = storeOrderData(data);
  return `${baseUrl}/print/${shortId}`;
};