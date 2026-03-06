import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'
import { TYPE_LABELS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { DeleteTransactionButton } from '@/components/Contas/DeleteTransactionButton'
import { DuplicateTransactionButton } from '@/components/Contas/DuplicateTransactionButton'
import { TransactionFilters } from '@/components/Contas/TransactionFilters'
import { SortableHeader } from '@/components/Contas/SortableHeader'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

async function getTransactions(searchParams: { [key: string]: string | string[] | undefined }): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*')

  if (searchParams.q) query = query.ilike('description', `%${searchParams.q}%`)
  if (searchParams.type) query = query.eq('type', searchParams.type)
  if (searchParams.status) query = query.eq('status', searchParams.status)

  if (searchParams.dateMode && searchParams.dateValue && typeof searchParams.dateValue === 'string') {
    const value = searchParams.dateValue
    const mode = searchParams.dateMode
    if (mode === 'specific_date') {
      query = query.eq('due_date', value)
    } else if (mode === 'specific_month') {
      const [year, month] = value.split('-')
      const firstDay = `${year}-${month}-01`
      const lastDay = new Date(Number(year), Number(month), 0).toISOString().split('T')[0]
      query = query.gte('due_date', firstDay).lte('due_date', lastDay)
    } else if (mode === 'specific_year') {
      query = query.gte('due_date', `${value}-01-01`).lte('due_date', `${value}-12-31`)
    }
  }

  const allowedSortFields = ['category', 'type', 'due_date', 'amount', 'status']
  const sortBy = typeof searchParams.sortBy === 'string' && allowedSortFields.includes(searchParams.sortBy)
    ? searchParams.sortBy : 'due_date'
  const ascending = searchParams.sortOrder !== 'desc'

  const { data, error } = await query.order(sortBy, { ascending })
  if (error || !data) return []
  return data as Transaction[]
}

export default async function ContasPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams
  const transactions = await getTransactions(params)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Transações</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'} encontrada{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/contas/nova"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          <Plus size={16} />
          Nova Transação
        </Link>
      </div>

      <TransactionFilters />

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma transação encontrada.</p>
            <Link href="/contas/nova" className="text-sm" style={{ color: 'var(--accent)' }}>
              Adicionar a primeira transação →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-left" style={{ color: 'var(--text-muted)' }}>
                  Descrição
                </th>
                <SortableHeader label="Categoria" field="category" />
                <SortableHeader label="Tipo" field="type" />
                <SortableHeader label="Vencimento" field="due_date" />
                <SortableHeader label="Valor" field="amount" className="text-right" />
                <SortableHeader label="Status" field="status" className="text-center" />
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-center" style={{ color: 'var(--text-muted)' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={() => { }}
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t.description}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{t.category}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{TYPE_LABELS[t.type]}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(t.due_date)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold" style={{ color: t.type === 'receivable' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'receivable' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge id={t.id} status={t.status} type={t.type} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DuplicateTransactionButton id={t.id} />
                      <Link
                        href={`/contas/${t.id}/editar`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteTransactionButton id={t.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
