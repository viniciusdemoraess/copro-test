import { supabase } from '@/integrations/supabase/client';
import type { IPCA, CreateIPCAInput, UpdateIPCAInput } from '@/types/ipca';

export async function fetchIPCAList(): Promise<IPCA[]> {
  const { data, error } = await supabase
    .from('ipca')
    .select('*')
    .order('ano', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createIPCA(input: CreateIPCAInput): Promise<IPCA> {
  const { data, error } = await supabase
    .from('ipca')
    .insert([input])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateIPCA(id: number, input: UpdateIPCAInput): Promise<IPCA> {
  const { data, error } = await supabase
    .from('ipca')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIPCA(id: number): Promise<void> {
  const { error } = await supabase
    .from('ipca')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function fetchIPCAByYear(ano: number): Promise<IPCA | null> {
  const { data, error } = await supabase
    .from('ipca')
    .select('*')
    .eq('ano', ano)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}
