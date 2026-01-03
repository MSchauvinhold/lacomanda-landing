import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-marron-oscuro bg-opacity-80 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <img 
          src="/logo.png" 
          alt="La Comanda" 
          className="w-20 h-20 object-contain"
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
        <div className="w-20"></div>
      </div>
    </header>
  );
};

export default Header;