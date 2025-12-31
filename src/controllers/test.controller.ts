import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const testSupabase = async (_: Request, res: Response) => {
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
