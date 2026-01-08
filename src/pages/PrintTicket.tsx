import React, { useEffect, useState } from 'react';
import { decodePrintData, PrintData } from '../utils/printUtils';
import { getOrderData } from '../utils/urlShortener';

const PrintTicket: React.FC = () => {
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if it's a short URL (/print/abc123)
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length === 3 && pathParts[1] === 'print') {
      const shortId = pathParts[2];
      const data = getOrderData(shortId);
      
      if (!data) {
        setError('Pedido no encontrado o expirado');
        return;
      }
      
      setPrintData(data);
    } else {
      // Original long URL method
      const urlParams = new URLSearchParams(window.location.search);
      const encodedData = urlParams.get('data');
      
      if (!encodedData) {
        setError('No hay datos para imprimir');
        return;
      }

      const decoded = decodePrintData(encodedData);
      if (!decoded) {
        setError('Error al decodificar los datos');
        return;
      }

      setPrintData(decoded);
    }
    
    // Auto print after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!printData) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  const { customerData, cartItems, subtotal, deliveryFee, total } = printData;

  // Generate product counts for summary
  const productCounts: { [key: string]: { count: number, price: number } } = {};
  cartItems.forEach(item => {
    const name = item.product.name;
    if (!productCounts[name]) {
      productCounts[name] = { count: 0, price: item.product.price };
    }
    productCounts[name].count += 1;
  });

  return (
    <div className="ticket-container">
      <div className="ticket">
        <div className="header">
          <h1>LA COMANDA - PEDIDO</h1>
        </div>

        <div className="customer-info">
          <p><strong>Cliente:</strong> {customerData.name}</p>
          <p><strong>Telefono:</strong> {customerData.phone}</p>
          <p><strong>Pago:</strong> {customerData.paymentMethod}</p>
          <p><strong>Tipo:</strong> {customerData.orderType === 'pickup' ? 'Retiro en local' : 'Envio a domicilio'}</p>
          
          {customerData.orderType === 'delivery' && customerData.address && (
            <>
              <p><strong>Direccion:</strong></p>
              <p>{customerData.address.street} {customerData.address.number}</p>
              {customerData.address.between && <p>Entre: {customerData.address.between}</p>}
              {customerData.address.neighborhood && <p>Barrio: {customerData.address.neighborhood}</p>}
            </>
          )}
        </div>

        <div className="separator">-------------------------</div>

        <div className="summary">
          <h2>RESUMEN</h2>
          {Object.entries(productCounts).map(([name, data]) => (
            <p key={name}>{data.count}x {name} - ${data.price.toLocaleString()}</p>
          ))}
          <p>Total ítems: {cartItems.length}</p>
        </div>

        <div className="separator">-------------------------</div>

        <div className="detailed-order">
          <h2>PEDIDO DETALLADO</h2>
          {cartItems.map((item, index) => (
            <div key={index} className="order-item">
              <p><strong>{index + 1}. {item.product.name}</strong></p>
              {item.observations && item.observations.trim() && (
                <div className="observations">
                  {item.observations.split(',').map((obs, obsIndex) => (
                    <p key={obsIndex}>- {obs.trim()}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="separator">-------------------------</div>

        <div className="totals">
          {customerData.orderType === 'delivery' ? (
            <>
              <h2>TOTALES</h2>
              <p>Subtotal: ${subtotal.toLocaleString()}</p>
              <p>Envio: ${deliveryFee.toLocaleString()}</p>
              <p><strong>TOTAL: ${total.toLocaleString()}</strong></p>
            </>
          ) : (
            <p><strong>TOTAL: ${total.toLocaleString()}</strong></p>
          )}
        </div>

        {customerData.generalObservations && (
          <>
            <div className="separator">-------------------------</div>
            <div className="general-observations">
              <p><strong>Observaciones:</strong> {customerData.generalObservations}</p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .ticket-container {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: #f5f5f5;
        }

        .ticket {
          width: 80mm;
          max-width: 300px;
          background: white;
          padding: 10px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.3;
          color: black;
        }

        .header h1 {
          text-align: center;
          margin: 0 0 15px 0;
          font-size: 14px;
          font-weight: bold;
        }

        .customer-info p,
        .summary p,
        .totals p,
        .general-observations p {
          margin: 2px 0;
        }

        .separator {
          text-align: center;
          margin: 10px 0;
          font-weight: normal;
        }

        .summary h2,
        .detailed-order h2,
        .totals h2 {
          font-size: 12px;
          font-weight: bold;
          margin: 5px 0;
          text-align: center;
        }

        .order-item {
          margin: 8px 0;
        }

        .order-item p {
          margin: 1px 0;
        }

        .observations {
          margin-left: 5px;
        }

        .error-container,
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: Arial, sans-serif;
        }

        @media print {
          .ticket-container {
            padding: 0;
            background: white;
          }

          .ticket {
            width: 80mm;
            max-width: none;
            margin: 0;
            padding: 5mm;
            font-size: 10px;
          }

          .header h1 {
            font-size: 12px;
          }

          .summary h2,
          .detailed-order h2,
          .totals h2 {
            font-size: 10px;
          }
        }

        @media print and (max-width: 58mm) {
          .ticket {
            width: 58mm;
            font-size: 9px;
          }

          .header h1 {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintTicket;