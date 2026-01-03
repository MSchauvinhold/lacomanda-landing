import React, { useState } from 'react';
import { CartItem, CustomerData } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSendWhatsApp: (customerData: CustomerData) => void;
  onRemoveItem: (index: number) => void;
  onUpdateObservations: (index: number, observations: string) => void;
  total: number;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, cartItems, onSendWhatsApp, onRemoveItem, onUpdateObservations, total }) => {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    paymentMethod: '',
    orderType: 'pickup',
    generalObservations: ''
  });

  const [address, setAddress] = useState({
    street: '',
    number: '',
    between: '',
    neighborhood: ''
  });

  const [editingObservations, setEditingObservations] = useState<number | null>(null);
  const [tempObservations, setTempObservations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !customerData.paymentMethod) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const finalCustomerData: CustomerData = {
      ...customerData,
      address: customerData.orderType === 'delivery' ? address : undefined
    };

    onSendWhatsApp(finalCustomerData);
  };

  return (
    <div className="fixed inset-0 bg-negro-suave bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-marron-oscuro rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Tu pedido</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Resumen del pedido */}
          <div className="mb-6">
            <div className="space-y-3 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-bordo-oscuro rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{index + 1}. {item.product.name}</h4>
                      <p className="text-naranja-calido font-bold">${item.product.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-rojo-intenso hover:text-red-400 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {editingObservations === index ? (
                    <div className="mt-2">
                      <textarea
                        value={tempObservations}
                        onChange={(e) => setTempObservations(e.target.value)}
                        placeholder="Especificaciones del producto..."
                        className="w-full p-2 text-sm rounded bg-marron-oscuro text-white placeholder-gray-400 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            onUpdateObservations(index, tempObservations);
                            setEditingObservations(null);
                            setTempObservations('');
                          }}
                          className="bg-rojo-intenso hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingObservations(null);
                            setTempObservations('');
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {item.observations && (
                        <p className="text-naranja-calido text-sm mb-2">
                          Obs: {item.observations}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setEditingObservations(index);
                          setTempObservations(item.observations);
                        }}
                        className="bg-naranja-calido hover:bg-orange-600 text-white text-xs px-3 py-1 rounded"
                      >
                        {item.observations ? 'Editar observación' : 'Agregar observación'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-rojo-intenso rounded p-3 text-center">
              <p className="text-white font-bold text-lg">Total: ${total.toLocaleString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white border-t border-gray-600 pt-4">Datos para el pedido</h3>
            {/* Datos del cliente */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                className="w-full p-2 rounded bg-bordo-oscuro text-white"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={customerData.phone}
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                className="w-full p-2 rounded bg-bordo-oscuro text-white"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Método de pago *
              </label>
              <select
                required
                value={customerData.paymentMethod}
                onChange={(e) => setCustomerData({...customerData, paymentMethod: e.target.value})}
                className="w-full p-2 rounded bg-bordo-oscuro text-white"
              >
                <option value="">Seleccionar método</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            {/* Tipo de pedido */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Tipo de pedido
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pickup"
                    checked={customerData.orderType === 'pickup'}
                    onChange={(e) => setCustomerData({...customerData, orderType: e.target.value as 'pickup' | 'delivery'})}
                    className="mr-2"
                  />
                  <span className="text-white">Retiro en el local</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="delivery"
                    checked={customerData.orderType === 'delivery'}
                    onChange={(e) => setCustomerData({...customerData, orderType: e.target.value as 'pickup' | 'delivery'})}
                    className="mr-2"
                  />
                  <span className="text-white">Envío a domicilio</span>
                </label>
              </div>
            </div>

            {/* Dirección (solo si es delivery) */}
            {customerData.orderType === 'delivery' && (
              <div className="space-y-3 border-t border-gray-600 pt-4">
                <h3 className="text-white font-semibold">Dirección de entrega</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-white text-sm mb-1">Calle</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full p-2 rounded bg-bordo-oscuro text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">Número</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => setAddress({...address, number: e.target.value})}
                      className="w-full p-2 rounded bg-bordo-oscuro text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm mb-1">Entre calles</label>
                  <input
                    type="text"
                    value={address.between}
                    onChange={(e) => setAddress({...address, between: e.target.value})}
                    className="w-full p-2 rounded bg-bordo-oscuro text-white"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm mb-1">Barrio (opcional)</label>
                  <input
                    type="text"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                    className="w-full p-2 rounded bg-bordo-oscuro text-white"
                  />
                </div>
              </div>
            )}

            {/* Observaciones generales */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Observaciones generales
              </label>
              <textarea
                value={customerData.generalObservations}
                onChange={(e) => setCustomerData({...customerData, generalObservations: e.target.value})}
                placeholder="Aclaraciones adicionales..."
                className="w-full p-2 rounded bg-bordo-oscuro text-white placeholder-gray-400 resize-none"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rojo-intenso hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
               Realizar pedido
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;