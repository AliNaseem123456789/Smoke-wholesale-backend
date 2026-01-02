// controllers/test.controller.js
const { supabase } = require('../lib/supabase');

const testSupabase = async (_, res) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .limit(5);

  if (error) {
    return res.status(500).json({
      message: 'Supabase error',
      error: error.message
    });
  }

  res.json({
    message: 'Supabase connected ✅',
    data
  });
};

module.exports = {
  testSupabase
};
