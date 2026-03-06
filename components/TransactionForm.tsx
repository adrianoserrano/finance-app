'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { Transaction, TransactionType, TransactionCategory, TransactionStatus } from '@/types'

type Props = {
  transaction?: Transaction
}

export default function TransactionForm({ transaction }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!transaction

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      due_date: formData.get('due_date') as string,
      type: formData.get('type') as TransactionType,
      category: formData.get('category') as TransactionCategory,
      status: (formData.get('status') as TransactionStatus) ?? 'pendente',
    }

    const { error: dbError } = isEdit
      ? await supabase.from('transactions').update(payload).eq('id', transaction.id)
      : await supabase.from('transactions').insert([{ ...payload, status: 'pendente' }])

    setLoading(false)

    if (dbError) {
      setError('Erro ao salvar. Verifique os dados e tente novamente.')
      return
    }

    router.push('/contas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
      <div className="flex flex-col gap-4">
        <Field label="Descrição">
          <input
            name="description"
            required
            defaultValue={transaction?.description}
            placeholder="Ex: Conta de luz"
            className="input"
          />
        </Field>

        <Field label="Valor (R$)">
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={transaction?.amount}
            placeholder="0,00"
            className="input"
          />
        </Field>

        <Field label="Data de Vencimento">
          <input
            name="due_date"
            type="date"
            required
            defaultValue={transaction?.due_date}
            className="input"
          />
        </Field>

        <Field label="Tipo">
          <select name="type" required defaultValue={transaction?.type ?? ''} className="input">
            <option value="">Selecione...</option>
            <option value="payable">A Pagar</option>
            <option value="receivable">A Receber</option>
          </select>
        </Field>

        <Field label="Categoria">
          <select name="category" required defaultValue={transaction?.category ?? ''} className="input">
            <option value="">Selecione...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </Field>

        {isEdit && (
          <Field label="Status">
            <select name="status" defaultValue={transaction.status} className="input">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="recebido">Recebido</option>
            </select>
          </Field>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Transação'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}
