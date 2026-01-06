import React, { useState } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onLogin(data.token);
          onClose();
          setUsername('');
          setPassword('');
        } else {
          setError(data.error);
        }
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-marron-oscuro rounded-lg max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Login</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-bordo-oscuro text-white placeholder-gray-400"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-bordo-oscuro text-white placeholder-gray-400"
              required
            />
          </div>

          {error && (
            <p className="text-rojo-intenso text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rojo-intenso hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;