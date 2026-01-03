import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isOrderingEnabled: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isOrderingEnabled }) => {
  const handleAdd = () => {
    if (product.price === 0) return; // No agregar productos "Próximamente"
    onAddToCart(product);
  };

  const isHamburger = product.id !== '7'; // Todas excepto Papas

  return (
    <div className="bg-marron-oscuro bg-opacity-95 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02] group cursor-pointer min-h-[500px] flex flex-col">
      <div className="overflow-hidden aspect-[390/440] flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />
      </div>
      <div className="p-4 lg:p-6 flex-1 flex flex-col">
        <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{product.name}</h3>
        {isHamburger && (
          <p className="text-naranja-calido text-sm font-semibold mb-2">
            ✨ Todas nuestras hamburguesas salen con papas
          </p>
        )}
        <p className="text-gray-300 text-sm lg:text-base mb-4 flex-1">{product.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-2 sm:gap-3">
          <span className="text-rojo-intenso font-bold text-lg sm:text-xl text-center sm:text-left">
            {product.price === 0 ? '' : `$${product.price.toLocaleString()}`}
          </span>
          <button
            onClick={handleAdd}
            disabled={!isOrderingEnabled || product.price === 0}
            className="bg-rojo-intenso hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 text-xs sm:text-xs rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            {product.price === 0 ? 'Próximamente' : 'Agregar a carrito'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;