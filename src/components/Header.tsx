import React from 'react';

interface HeaderProps {
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
  return (
    <header className="bg-marron-oscuro bg-opacity-80 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <img 
          src="/logo.png" 
          alt="La Comanda" 
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-rojo-intenso mb-2">
            Hacé tu pedido
          </h1>
          <p className="text-lg text-naranja-calido font-semibold mb-1">
            La Comanda: sabor, estilo y hambre de más
          </p>
          <p className="text-sm text-gray-300">
            Agregá productos al carrito y hacé tu pedido por WhatsApp
          </p>
        </div>
        <button
          onClick={onAdminClick}
          className="w-8 h-8 text-gray-500 hover:text-white transition-colors p-1"
          title="Admin"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;