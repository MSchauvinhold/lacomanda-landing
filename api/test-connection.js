import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test básico de conexión
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({ 
        connected: false, 
        error: error.message,
        details: error
      });
    }

    return res.status(200).json({ 
      connected: true, 
      message: 'Conexión exitosa',
      data: data
    });

  } catch (error) {
    return res.status(500).json({ 
      connected: false, 
      error: error.message 
    });
  }
}