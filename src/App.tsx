import { useReducer, useState } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import OrderModal from './components/OrderModal';
import { products } from './data/products';
import { CartState, CartAction, Product, CustomerData } from './types';

// Reducer para manejar el carrito
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, { product: action.payload.product, observations: action.payload.observations }]
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload)
      };
    case 'UPDATE_OBSERVATIONS':
      return {
        ...state,
        items: state.items.map((item, index) => 
          index === action.payload.index 
            ? { ...item, observations: action.payload.observations }
            : item
        )
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
};

// Función para verificar si está en horario de pedidos
const isOrderingTime = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute; // minutos desde medianoche
  
  // Jueves (4) a domingo (0) - considerando que domingo es 0
  const isValidDay = day === 0 || day === 4 || day === 5 || day === 6;
  
  // 20:30 a 23:50
  const startTime = 20 * 60 + 30; // 20:30 en minutos
  const endTime = 23 * 60 + 49;   // 23:49 en minutos
  const isValidTime = currentTime >= startTime && currentTime <= endTime;
  
  return isValidDay && isValidTime;
};

function App() {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOrderingEnabled = isOrderingTime();

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, observations: '' } });
  };

  const removeFromCart = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index });
  };

  const updateObservations = (index: number, observations: string) => {
    dispatch({ type: 'UPDATE_OBSERVATIONS', payload: { index, observations } });
  };

  const calculateTotal = (): number => {
    return cartState.items.reduce((total, item) => total + item.product.price, 0);
  };

  const generateWhatsAppMessage = (customerData: CustomerData): string => {
    let message = `*NUEVO PEDIDO - LA COMANDA*\n\n`;
    
    // Datos del cliente
    message += `*Cliente:* ${customerData.name}\n`;
    message += `*Telefono:* ${customerData.phone}\n`;
    message += `*Pago:* ${customerData.paymentMethod}\n`;
    message += `*Tipo:* ${customerData.orderType === 'pickup' ? 'Retiro en local' : 'Envio a domicilio'}\n\n`;
    
    // Dirección si es delivery
    if (customerData.orderType === 'delivery' && customerData.address) {
      message += `*Direccion:*\n`;
      message += `${customerData.address.street} ${customerData.address.number}\n`;
      if (customerData.address.between) {
        message += `Entre: ${customerData.address.between}\n`;
      }
      if (customerData.address.neighborhood) {
        message += `Barrio: ${customerData.address.neighborhood}\n`;
      }
      message += `\n`;
    }
    
    // Productos
    message += `*PEDIDO:*\n`;
    cartState.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}`;
      if (item.observations && item.observations.trim()) {
        message += ` - ${item.observations}`;
      }
      message += ` ($${item.product.price.toLocaleString()})\n`;
    });
    
    // Total
    const total = calculateTotal();
    message += `\n*Total: $${total.toLocaleString()}*\n`;
    
    // Observaciones generales
    if (customerData.generalObservations) {
      message += `\n*Observaciones:* ${customerData.generalObservations}`;
    }
    
    return encodeURIComponent(message);
  };

  const sendToWhatsApp = (customerData: CustomerData) => {
    const message = generateWhatsAppMessage(customerData);
    const whatsappNumber = '5493772406996'; // Número de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito y cerrar modal
    dispatch({ type: 'CLEAR_CART' });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-bordo-oscuro relative" style={{backgroundImage: 'url(/LogoMenu.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="absolute inset-0 bg-bordo-oscuro bg-opacity-70"></div>
      <div className="relative z-10">
        <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Mensaje de horarios */}
        {!isOrderingEnabled && (
          <div className="bg-rojo-intenso text-white p-4 rounded-lg mb-6 text-center">
            <p className="font-semibold">Los pedidos están disponibles</p>
            <p>de jueves a domingo de 20:30 a 23:50</p>
          </div>
        )}
        
        {/* Productos - Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isOrderingEnabled={isOrderingEnabled}
            />
          ))}
        </div>
        
        {/* Información del local */}
        <div className="mt-12 max-w-md mx-auto bg-marron-oscuro bg-opacity-95 rounded-lg p-6 text-center">
          <h3 className="text-white font-bold mb-4 text-xl">La Comanda</h3>
          <div className="space-y-2 text-sm">
            <p className="text-naranja-calido font-semibold">
              🍔 American Burgers
            </p>
            <p className="text-gray-300">
              ⏰ Jueves a Domingos - 20:30 a 23:50
            </p>
            <p className="text-gray-300">
              ☎️ 3772406996
            </p>
            <p className="text-gray-300">
              🏠 Belgrano 1215
            </p>
            <p className="text-naranja-calido font-semibold">
              🛵 Delivery & Take Away
            </p>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-gray-300 text-sm mb-2">
                Seguinos en Instagram
              </p>
              <a 
                href="https://www.instagram.com/lacomanda.libres/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-naranja-calido hover:text-orange-400 font-semibold text-sm transition-colors"
              >
                @lacomanda.libres
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Carrito Flotante */}
      {cartState.items.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-rojo-intenso hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-naranja-calido text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cartState.items.length}
            </span>
          </div>
        </button>
      )}
      
      {/* Overlay de cerrado */}
      {!isOrderingEnabled && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold text-rojo-intenso mb-4">Estamos cerrados</h2>
            <p className="text-xl mb-2">Vuelve el jueves a partir de las 20:30</p>
            <p className="text-lg text-gray-300">Horarios: Jueves a Domingos - 20:30 a 23:50</p>
          </div>
        </div>
      )}
      
      {/* Modal de pedido */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={cartState.items}
        onSendWhatsApp={sendToWhatsApp}
        onRemoveItem={removeFromCart}
        onUpdateObservations={updateObservations}
        total={calculateTotal()}
      />
      </div>
    </div>
  );
}

export default App;