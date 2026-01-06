// Estado global simple (en producción usar base de datos)
let globalState = {
  orderingEnabled: true
};

// Rate limiting para consultas de estado
const statusAttempts = new Map();

function cleanOldStatusAttempts() {
  const now = Date.now();
  for (const [key, data] of statusAttempts.entries()) {
    if (now - data.firstAttempt > 60000) { // 1 minuto
      statusAttempts.delete(key);
    }
  }
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    // Rate limiting para GET (consultas de estado)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    cleanOldStatusAttempts();
    
    const userAttempts = statusAttempts.get(ip) || { count: 0, firstAttempt: now };
    
    if (userAttempts.count >= 20) { // 20 consultas por minuto máximo
      return res.status(429).json({ 
        error: 'Demasiadas consultas. Esperá un momento.' 
      });
    }
    
    // Incrementar contador
    statusAttempts.set(ip, {
      count: userAttempts.count + 1,
      firstAttempt: userAttempts.firstAttempt
    });
    
    return res.status(200).json(globalState);
  }
  
  if (req.method === 'POST') {
    const { orderingEnabled, token } = req.body;
    
    // Verificar token de admin
    if (token !== 'admin-authenticated') {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    globalState.orderingEnabled = orderingEnabled;
    return res.status(200).json(globalState);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}