'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { Transaction, TransactionType, TransactionCategory, TransactionStatus } from '@/types'
import { Loader2 } from 'lucide-react'

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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 max-w-lg"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col gap-5">
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

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Transação'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
