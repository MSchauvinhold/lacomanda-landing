import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onFinalizePedido: () => void;
  isOrderingEnabled: boolean;
}

const Cart: React.FC<CartProps> = ({ items, onRemoveItem, onFinalizePedido, isOrderingEnabled }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-marron-oscuro rounded-lg p-4 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Tu pedido</h3>
      
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div key={index} className="bg-bordo-oscuro rounded p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.product.name}</h4>
                {item.observations && (
                  <p className="text-naranja-calido text-sm mt-1">
                    Obs: {item.observations}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemoveItem(index)}
                className="text-rojo-intenso hover:text-red-400 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={onFinalizePedido}
        disabled={!isOrderingEnabled}
        className="w-full bg-rojo-intenso hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
      >
        Finalizar pedido
      </button>
    </div>
  );
};

export default Cart;