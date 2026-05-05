import supabase from '../lib/supabase';

export const updateProfileDisplayName = async (userId: string, displayName: string) => {
  const { error } = await supabase.from('profiles').update({ displayName }).eq('id', userId);
  if (error) {
    console.warn('updateProfileDisplayName error:', error);
    return false;
  }
  return true;
};
