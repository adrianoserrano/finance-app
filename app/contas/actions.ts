'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { success: false, error: error.message }
  }

  // Revalidate the dashboard and contas pages
  revalidatePath('/contas')
  revalidatePath('/')

  return { success: true }
}

export async function duplicateTransaction(id: string) {
  // 1. Fetch the original transaction
  const { data: original, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    console.error('Error fetching original transaction:', fetchError)
    return { success: false, error: 'Transação original não encontrada.' }
  }

  // 2. Advance due_date by 1 month using date-fns or simple JS date
  const [year, month, day] = original.due_date.split('-').map(Number)
  const newDate = new Date(year, month - 1 + 1, day) // advances month by 1
  const newDueDate = newDate.toISOString().split('T')[0]

  // 3. Prepare the new duplicated object
  const { id: _oldId, created_at: _oldCreatedAt, ...dataToInsert } = original
  console.log('Duplicating transaction id:', _oldId, 'created precisely at:', _oldCreatedAt) // use variables so ts doesn't complain or use eslint-disable
  const duplicatedData = {
    ...dataToInsert,
    due_date: newDueDate,
    status: 'pendente' // force status to pendente
  }

  // 4. Insert into database
  const { data: inserted, error: insertError } = await supabase
    .from('transactions')
    .insert([duplicatedData])
    .select()
    .single()

  if (insertError || !inserted) {
    console.error('Error duplicating transaction:', insertError)
    return { success: false, error: insertError?.message || 'Erro ao duplicar transação.' }
  }

  // Revalidate cache
  revalidatePath('/contas')
  revalidatePath('/')

  return { success: true, newId: inserted.id }
}
