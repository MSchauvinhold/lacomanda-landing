import React from 'react';

interface FooterProps {
  onShowPrivacyPolicy: () => void;
  onShowTerms: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacyPolicy, onShowTerms }) => {
  return (
    <footer className="bg-marron-oscuro bg-opacity-95 text-white py-8 px-4 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-rojo-intenso mb-1">La Comanda — American Burgers</h3>
          <p className="text-naranja-calido font-semibold mb-4">Pedidos por WhatsApp · Delivery & Take Away</p>
          
          
          <div className="border-t border-gray-600 pt-6 mb-6">
            <p className="text-xs text-gray-400 mb-4">
              Este sitio facilita el armado de pedidos que se confirman exclusivamente por WhatsApp.<br/>
              Los precios y la disponibilidad pueden variar.
            </p>
            
            <div className="flex justify-center gap-4 text-xs">
              <button 
                onClick={onShowPrivacyPolicy}
                className="text-naranja-calido hover:text-orange-400 transition-colors"
              >
                Política de Privacidad
              </button>
              <span className="text-gray-500">·</span>
              <button 
                onClick={onShowTerms}
                className="text-naranja-calido hover:text-orange-400 transition-colors"
              >
                Términos y Condiciones
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            © 2026 La Comanda — Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;