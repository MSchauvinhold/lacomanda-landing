// Estado global simple (en producción usar base de datos)
let globalState = {
  orderingEnabled: true
};

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
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