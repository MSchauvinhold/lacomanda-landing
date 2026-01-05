export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  
  // Credenciales hardcodeadas (cambiar en producción)
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'lacomanda2024';
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ 
      success: true, 
      token: 'admin-authenticated' 
    });
  }
  
  return res.status(401).json({ 
    success: false, 
    error: 'Credenciales incorrectas' 
  });
}