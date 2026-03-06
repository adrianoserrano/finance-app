import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'
import { TYPE_LABELS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { DeleteTransactionButton } from '@/components/Contas/DeleteTransactionButton'
import { DuplicateTransactionButton } from '@/components/Contas/DuplicateTransactionButton'
import { TransactionFilters } from '@/components/Contas/TransactionFilters'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

async function getTransactions(searchParams: { [key: string]: string | string[] | undefined }): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')

  if (searchParams.q) {
    query = query.ilike('description', `%${searchParams.q}%`)
  }
  if (searchParams.type) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.dateMode && searchParams.dateValue && typeof searchParams.dateValue === 'string') {
    const value = searchParams.dateValue
    const mode = searchParams.dateMode

    if (mode === 'specific_date') {
      query = query.eq('due_date', value)
    } else if (mode === 'specific_month') {
      // value comes as "YYYY-MM"
      // first day: "YYYY-MM-01"
      // last day is tricky to calculate natively without date-fns, but Supabase handles `.like()` on dates if casted, 
      // or we can build the bounds manually.
      const [year, month] = value.split('-')
      const firstDay = `${year}-${month}-01`
      const lastDay = new Date(Number(year), Number(month), 0).toISOString().split('T')[0] // local last day of month
      query = query.gte('due_date', firstDay).lte('due_date', lastDay)
    } else if (mode === 'specific_year') {
      // value comes as "YYYY"
      const firstDay = `${value}-01-01`
      const lastDay = `${value}-12-31`
      query = query.gte('due_date', firstDay).lte('due_date', lastDay)
    }
  }

  const { data, error } = await query.order('due_date', { ascending: true })

  if (error || !data) return []
  return data as Transaction[]
}

export default async function ContasPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams
  const transactions = await getTransactions(params)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transações</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'} cadastrada{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/contas/nova"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova Transação
        </Link>
      </div>

      <TransactionFilters />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <p className="font-medium text-slate-500">Nenhuma transação cadastrada.</p>
            <Link href="/contas/nova" className="text-sm text-violet-600 hover:underline">
              Adicionar a primeira transação
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Descrição</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Categoria</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Vencimento</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Valor</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-800 font-medium">{t.description}</td>
                  <td className="px-5 py-3.5 text-slate-500">{t.category}</td>
                  <td className="px-5 py-3.5 text-slate-500">{TYPE_LABELS[t.type]}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(t.due_date)}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${t.type === 'receivable' ? 'text-emerald-600' : 'text-red-500'}`}>
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
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
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
