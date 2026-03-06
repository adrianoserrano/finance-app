import { supabase } from '@/lib/supabase'
import type { Transaction } from '@/types'
import TransactionForm from '@/components/TransactionForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default async function EditarContaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const transaction = data as Transaction

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/contas"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Voltar para Transações
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Editar Transação</h1>
        <p className="text-slate-400 text-sm mt-0.5">{transaction.description}</p>
      </div>
      <TransactionForm transaction={transaction} />
    </div>
  )
}
