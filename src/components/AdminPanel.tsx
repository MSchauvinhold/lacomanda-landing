import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onStatusChange: (enabled: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, token, onStatusChange }) => {
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin-status');
      if (response.ok) {
        const data = await response.json();
        setOrderingEnabled(data.orderingEnabled);
      }
    } catch (err) {
      console.error('Error fetching admin status:', err);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('Probando...');
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      if (data.connected) {
        setConnectionStatus('✅ Conectado');
      } else {
        setConnectionStatus(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setConnectionStatus(`❌ Error: ${err.message}`);
    }
  };

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderingEnabled: !orderingEnabled, 
          token 
        })
      });

      if (response.ok) {
        const newStatus = !orderingEnabled;
        setOrderingEnabled(newStatus);
        onStatusChange(newStatus);
      }
    } catch (err) {
      console.error('Error updating admin status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-marron-oscuro rounded-lg max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Panel Admin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-white mb-2">Estado del local:</p>
            <p className={`font-bold text-lg ${orderingEnabled ? 'text-green-400' : 'text-rojo-intenso'}`}>
              {orderingEnabled ? 'ABIERTO' : 'CERRADO'}
            </p>
          </div>

          <div className="flex items-center justify-between bg-bordo-oscuro rounded p-4">
            <span className="text-white">Pedidos:</span>
            <button
              onClick={toggleStatus}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                orderingEnabled ? 'bg-green-600' : 'bg-gray-600'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  orderingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-gray-400 text-xs text-center">
            {orderingEnabled 
              ? 'Los pedidos están habilitados' 
              : 'Los pedidos están bloqueados'
            }
          </p>

          <div className="border-t border-gray-600 pt-4">
            <button
              onClick={testConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
            >
              Probar Conexión DB
            </button>
            {connectionStatus && (
              <p className="text-xs text-center mt-2 text-gray-300">
                {connectionStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;