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
    <div className="bg-marron-oscuro bg-opacity-95 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-out md:hover:shadow-2xl md:hover:scale-[1.02] group cursor-pointer min-h-[260px] sm:min-h-[500px] flex flex-col active:scale-95 md:active:scale-100">
      <div className="overflow-hidden aspect-[390/440] sm:aspect-[390/440] flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out md:group-hover:scale-110"
        />
      </div>
      <div className="p-2 sm:p-4 lg:p-6 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight">{product.name}</h3>
        {isHamburger && (
          <p className="text-naranja-calido text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
            ✨ Todas nuestras hamburguesas salen con papas
          </p>
        )}
        <p className="text-gray-300 text-xs sm:text-sm lg:text-base mb-1 sm:mb-4 flex-1 leading-tight">{product.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-1 sm:gap-2">
          <span className="text-rojo-intenso font-bold text-sm sm:text-lg lg:text-xl text-center sm:text-left">
            {product.price === 0 ? '' : `$${product.price.toLocaleString()}`}
          </span>
          <button
            onClick={handleAdd}
            disabled={!isOrderingEnabled || product.price === 0}
            className="bg-rojo-intenso hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-1 sm:py-2 px-2 sm:px-3 text-xs rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            {product.price === 0 ? 'Próximamente' : 'Agregar a carrito'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;