// Rate limiting storage
const attempts = new Map();

function cleanOldAttempts() {
  const now = Date.now();
  for (const [key, data] of attempts.entries()) {
    if (now - data.firstAttempt > 60000) { // 1 minuto
      attempts.delete(key);
    }
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  cleanOldAttempts();
  
  const userAttempts = attempts.get(ip) || { count: 0, firstAttempt: now };
  
  if (userAttempts.count >= 5) {
    const timeLeft = Math.ceil((60000 - (now - userAttempts.firstAttempt)) / 1000);
    return res.status(429).json({ 
      success: false, 
      error: `Demasiados intentos. Esperá ${timeLeft} segundos.` 
    });
  }

  const { username, password } = req.body;
  
  // Usar variables de entorno
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'adminlacomanda';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Lacomanda@2026';
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Login exitoso - resetear intentos
    attempts.delete(ip);
    return res.status(200).json({ 
      success: true, 
      token: 'admin-authenticated' 
    });
  }
  
  // Login fallido - incrementar intentos
  attempts.set(ip, {
    count: userAttempts.count + 1,
    firstAttempt: userAttempts.firstAttempt
  });
  
  return res.status(401).json({ 
    success: false, 
    error: 'Credenciales incorrectas' 
  });
}