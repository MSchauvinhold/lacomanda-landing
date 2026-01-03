export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export interface CartItem {
  product: Product;
  observations: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  paymentMethod: string;
  orderType: 'pickup' | 'delivery';
  address?: {
    street: string;
    number: string;
    between: string;
    neighborhood: string;
  };
  generalObservations: string;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; observations: string } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_OBSERVATIONS'; payload: { index: number; observations: string } }
  | { type: 'CLEAR_CART' };