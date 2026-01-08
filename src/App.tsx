import { useReducer, useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import OrderModal from './components/OrderModal';
import AdminModal from './components/AdminModal';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { products } from './data/products';
import { CartState, CartAction, Product, CustomerData } from './types';

// Carrito
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

const getStatusMessage = (): string => {
  return "Estamos cerrados temporalmente. Volvemos pronto.";
};

const isOrderingTime = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;
  
  const isValidDay = day === 0 || day === 4 || day === 5 || day === 6;
  const startTime = 20 * 60 + 30;
  const endTime = 23 * 60 + 50;
  const isValidTime = currentTime >= startTime && currentTime <= endTime;
  
  return isValidDay && isValidTime;
};

function App() {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminEnabled, setAdminEnabled] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const canOrder = adminEnabled === true;
  
  console.log('Debug - isOrderingTime():', isOrderingTime());
  console.log('Debug - adminEnabled:', adminEnabled);
  console.log('Debug - canOrder:', canOrder);

  useEffect(() => {
    fetchAdminStatus();
    
    // Polling cada 10 segundos
    const interval = setInterval(() => {
      fetchAdminStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin-status');
      if (response.ok) {
        const data = await response.json();
        console.log('Admin status fetched:', data);
        setAdminEnabled(data.orderingEnabled);
      }
    } catch (err) {
      console.error('Error fetching admin status:', err);
    }
  };


  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setIsLoggedIn(true);
    setShowAdminModal(false);
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setAdminToken('');
  };

  const toggleStoreStatus = async () => {
    const newStatus = !adminEnabled;
    try {
      const response = await fetch('/api/admin-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderingEnabled: newStatus, 
          token: adminToken 
        })
      });
      if (response.ok) {
        setAdminEnabled(newStatus);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAdminStatusChange = (enabled: boolean | null) => {
    setAdminEnabled(enabled);
  };

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, observations: '' } });
  };

  const removeFromCart = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index });
  };

  const updateObservations = (index: number, observations: string) => {
    dispatch({ type: 'UPDATE_OBSERVATIONS', payload: { index, observations } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getDeliveryFee = (orderType: string, neighborhood?: string): number => {
    if (orderType !== 'delivery') return 0;
    return neighborhood && neighborhood.trim() ? 3000 : 2500;
  };

  const getTotal = (orderType: string = 'pickup', neighborhood?: string): number => {
    const subtotal = cartState.items.reduce((total, item) => total + item.product.price, 0);
    const deliveryFee = getDeliveryFee(orderType, neighborhood);
    return subtotal + deliveryFee;
  };

  const buildWhatsAppMessage = (customerData: CustomerData): string => {
    let message = `*NUEVO PEDIDO - LA COMANDA*\n\n`;
    
    message += `*Cliente:* ${customerData.name}\n`;
    message += `*Telefono:* ${customerData.phone}\n`;
    message += `*Pago:* ${customerData.paymentMethod}\n`;
    message += `*Tipo:* ${customerData.orderType === 'pickup' ? 'Retiro en local' : 'Envio a domicilio'}\n\n`;
    
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
    
    // Generar resumen de productos
    const productCounts: { [key: string]: number } = {};
    cartState.items.forEach(item => {
      const name = item.product.name;
      productCounts[name] = (productCounts[name] || 0) + 1;
    });
    
    const summaryText = Object.entries(productCounts)
      .map(([name, count]) => `*${count}x* ${name}`)
      .join(', ');
    
    message += `*RESUMEN:* ${summaryText}\n\n`;
    
    message += `*PEDIDO DETALLADO:*\n`;
    cartState.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}`;
      if (item.observations && item.observations.trim()) {
        message += ` - Observacion: *${item.observations}*`;
      }
      message += ` ($${item.product.price.toLocaleString()})\n`;
    });
    
    const deliveryFee = getDeliveryFee(customerData.orderType, customerData.address?.neighborhood);
    if (deliveryFee > 0) {
      message += `\nEnvio: $${deliveryFee.toLocaleString()}\n`;
    }
    
    const total = getTotal(customerData.orderType, customerData.address?.neighborhood);
    message += `\n*Total: $${total.toLocaleString()}*\n`;
    
    if (customerData.generalObservations) {
      message += `\n*Observaciones:* ${customerData.generalObservations}`;
    }
    
    return encodeURIComponent(message);
  };

  const sendToWhatsApp = (customerData: CustomerData) => {
    const message = buildWhatsAppMessage(customerData);
    const whatsappNumber = '5493772300876';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    dispatch({ type: 'CLEAR_CART' });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-bordo-oscuro relative" style={{backgroundImage: 'url(/LogoMenu.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed'}}>
      <div className="absolute inset-0 bg-bordo-oscuro bg-opacity-60"></div>
      <div className="relative z-10">
        <Header onAdminClick={() => setShowAdminModal(true)} />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Productos - Grid Responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isOrderingEnabled={canOrder}
            />
          ))}
        </div>
        
        {/* Información del local */}
        <div className="mt-8 sm:mt-12 max-w-md mx-auto bg-marron-oscuro bg-opacity-95 rounded-lg p-4 sm:p-6 text-center">
          <h3 className="text-white font-bold mb-4 text-xl">La Comanda</h3>
          <div className="space-y-2 text-sm">
            <p className="text-naranja-calido font-semibold">
              🍔 American Burgers
            </p>
            <p className="text-gray-300">
              ⏰ Jueves a Domingos - 20:30 a 23:50
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
      
      <Footer 
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        onShowTerms={() => setShowTerms(true)}
      />
      
      {/* Carrito Flotante */}
      {cartState.items.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-rojo-intenso hover:bg-red-700 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40"
        >
          <div className="relative">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-naranja-calido text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
              {cartState.items.length}
            </span>
          </div>
        </button>
      )}
      
      {/* Panel Admin Flotante */}
      {isLoggedIn && (
        <div className="fixed top-4 right-4 bg-marron-oscuro rounded-lg p-4 shadow-lg z-40">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-semibold">Admin</span>
            <button
              onClick={toggleStoreStatus}
              className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                adminEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-rojo-intenso hover:bg-red-700 text-white'
              }`}
            >
              {adminEnabled ? 'CERRAR LOCAL' : 'ABRIR LOCAL'}
            </button>
            <button
              onClick={handleAdminLogout}
              className="text-gray-400 hover:text-white text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay de cargando */}
      {adminEnabled === null && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center text-white p-8 pointer-events-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja-calido mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando...</h2>
            <p className="text-gray-300">Un momento por favor</p>
          </div>
        </div>
      )}
      
      {/* Overlay de cerrado */}
      {adminEnabled === false && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center text-white p-8 pointer-events-auto">
            <h2 className="text-4xl font-bold text-rojo-intenso mb-4">Cerrado</h2>
            <p className="text-xl mb-2">{getStatusMessage()}</p>
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
        onClearCart={clearCart}
        total={getTotal()}
        calculateTotal={getTotal}
        calculateDeliveryFee={getDeliveryFee}
      />
      
      {/* Modales de Admin */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLogin={handleAdminLogin}
      />
      
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        token={adminToken}
        onStatusChange={handleAdminStatusChange}
      />
      
      {/* Modal Política de Privacidad */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-marron-oscuro rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-rojo-intenso">Política de Privacidad</h2>
                <button onClick={() => setShowPrivacyPolicy(false)} className="text-gray-400 hover:text-white text-2xl">
                  ✕
                </button>
              </div>
              <div className="text-white text-sm space-y-4">
                <p>En La Comanda valoramos tu privacidad y nos comprometemos a proteger los datos personales que nos brindás al realizar un pedido a través de nuestro sitio web.</p>
                <h3 className="text-naranja-calido font-semibold">Datos que recopilamos</h3>
                <p>Al realizar un pedido, solicitamos:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nombre y apellido</li>
                  <li>Teléfono de contacto</li>
                  <li>Dirección</li>
                  <li>Información del pedido (productos, observaciones, tipo de entrega y método de pago)</li>
                </ul>
                <h3 className="text-naranja-calido font-semibold">Uso de la información</h3>
                <p>Los datos se utilizan exclusivamente para armar y gestionar tu pedido, y para contactarte por WhatsApp con el fin de confirmar o coordinar la entrega.</p>
                <h3 className="text-naranja-calido font-semibold">Almacenamiento y uso de datos</h3>
                <p>Este sitio no almacena ni guarda los datos personales ingresados. La información se envía directamente al WhatsApp del comercio y no se comparte con terceros.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Términos y Condiciones */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-marron-oscuro rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-rojo-intenso">Términos y Condiciones</h2>
                <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-white text-2xl">
                  ✕
                </button>
              </div>
              <div className="text-white text-sm space-y-4">
                <p>El uso de este sitio web implica la aceptación de los siguientes términos y condiciones:</p>
                <h3 className="text-naranja-calido font-semibold">1. Función del sitio</h3>
                <p>Este sitio facilita el armado de pedidos que serán confirmados exclusivamente a través de WhatsApp. El envío del pedido no garantiza su aceptación automática por parte del comercio.</p>
                <h3 className="text-naranja-calido font-semibold">2. Confirmación de pedidos</h3>
                <p>Todos los pedidos deben ser confirmados por el local vía WhatsApp. El comercio se reserva el derecho de rechazar pedidos fuera de horario, por falta de stock o por información incompleta.</p>
                <h3 className="text-naranja-calido font-semibold">3. Horarios de atención</h3>
                <p>Los pedidos solo se reciben dentro de los horarios informados: jueves a domingos de 20:30 a 23:50.</p>
                <h3 className="text-naranja-calido font-semibold">4. Precios y tiempos</h3>
                <p>Los precios publicados pueden estar sujetos a modificaciones sin previo aviso. Los tiempos de preparación y entrega son estimados y pueden variar según la demanda.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;