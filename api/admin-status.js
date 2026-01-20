import { createClient } from '@supabase/supabase-js';

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

// Crear cliente Supabase con service role para bypasear RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
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
    
    try {
      // Leer estado desde Supabase
      const { data, error } = await supabase
        .from('admin_settings')
        .select('orders_enabled')
        .eq('id', 1)
        .single();
      
      if (error) {
        console.error('Error reading from Supabase:', error);
        // Retornar true por defecto si hay error
        return res.status(200).json({ orderingEnabled: true });
      }
      
      return res.status(200).json({ orderingEnabled: data.orders_enabled });
    } catch (err) {
      console.error('Supabase error:', err);
      // Retornar true por defecto si hay error de conexión
      return res.status(200).json({ orderingEnabled: true });
    }
  }
  
  if (req.method === 'POST') {
    const { orderingEnabled, token } = req.body;
    
    // Verificar token de admin
    if (token !== 'admin-authenticated') {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    try {
      // Actualizar estado en Supabase
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ orders_enabled: orderingEnabled })
        .eq('id', 1)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating Supabase:', error);
        return res.status(500).json({ error: 'Error actualizando estado' });
      }
      
      return res.status(200).json({ orderingEnabled: data.orders_enabled });
    } catch (err) {
      console.error('Supabase update error:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}