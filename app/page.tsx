import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'
import { TYPE_LABELS } from '@/types'
import { BarChart3, TrendingDown, TrendingUp, Wallet, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { MonthlyComparisonChart, ChartDataPoint } from '@/components/Dashboard/MonthlyComparisonChart'
import { subMonths, startOfMonth, format, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function getDashboardData() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return { rows: [], totalBalance: 0, totalPayable: 0, totalReceivable: 0, totalPending: 0, chartData: [] as ChartDataPoint[] }

  const rows = data as Transaction[]

  // A Pagar / A Receber: apenas pendentes (ainda não confirmados)
  const totalPayable = rows
    .filter((t) => t.type === 'payable' && t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalReceivable = rows
    .filter((t) => t.type === 'receivable' && t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalPending = rows
    .filter((t) => t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Saldo: considera TODAS as transações independente do status
  const allReceivable = rows
    .filter((t) => t.type === 'receivable')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const allPayable = rows
    .filter((t) => t.type === 'payable')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalBalance = allReceivable - allPayable

  // Aggregation logic for Monthly Comparison Chart (last 12 months)
  const chartData: ChartDataPoint[] = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const targetMonth = startOfMonth(subMonths(today, i))
    const monthName = format(targetMonth, 'MMM/yy', { locale: ptBR })

    // Sum only confirmed (pago/recebido) or all depending on requirement.
    // Assuming user wants to compare history, we should sum everything or only confirmed?
    // Let's sum absolute totals of the month regardless of status to reflect total expenses/incomes of that month's due_date.
    const monthTransactions = rows.filter((t) => {
      // Usamos o due_date para locar a transação no mês correto
      const [year, month, day] = t.due_date.split('-')
      const tDate = new Date(Number(year), Number(month) - 1, Number(day))
      return isSameMonth(tDate, targetMonth)
    })

    const receitas = monthTransactions
      .filter((t) => t.type === 'receivable')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const despesas = monthTransactions
      .filter((t) => t.type === 'payable')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    chartData.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      receitas,
      despesas
    })
  }

  return { rows: rows.slice(0, 5), totalBalance, totalPayable, totalReceivable, totalPending, chartData }
}

function currentMonthLabel() {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase())
}

export default async function DashboardPage() {
  const { rows, totalBalance, totalPayable, totalReceivable, totalPending, chartData } = await getDashboardData()

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{currentMonthLabel()}</p>
        </div>
        <Link
          href="/contas/nova"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova Transação
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="SALDO DO MÊS"
          value={totalBalance}
          sub={totalBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
          icon={<Wallet size={18} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          valueColor={totalBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}
        />
        <SummaryCard
          label="A RECEBER"
          value={totalReceivable}
          sub="Total do mês"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <SummaryCard
          label="A PAGAR"
          value={totalPayable}
          sub="Total do mês"
          icon={<TrendingDown size={18} />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          valueColor="text-red-500"
        />
        <SummaryCard
          label="PENDENTES"
          value={totalPending}
          sub="Aguardando confirmação"
          icon={<AlertCircle size={18} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-500"
          valueColor="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 flex flex-col">
          <MonthlyComparisonChart data={chartData} />
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Transações Recentes</h2>
            <Link href="/contas" className="text-sm text-violet-600 hover:underline">
              Ver todas →
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <BarChart3 size={40} className="text-slate-300" />
              <p className="font-medium text-slate-500">Nenhuma transação encontrada</p>
              <p className="text-sm">Adicione uma transação para começar</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-3 font-medium text-slate-400 text-xs uppercase">Descrição</th>
                  <th className="pb-3 font-medium text-slate-400 text-xs uppercase">Categoria</th>
                  <th className="pb-3 font-medium text-slate-400 text-xs uppercase">Tipo</th>
                  <th className="pb-3 font-medium text-slate-400 text-xs uppercase">Vencimento</th>
                  <th className="pb-3 font-medium text-slate-400 text-xs uppercase text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="py-3 text-slate-800 font-medium">{t.description}</td>
                    <td className="py-3 text-slate-500">{t.category}</td>
                    <td className="py-3 text-slate-500">{TYPE_LABELS[t.type]}</td>
                    <td className="py-3 text-slate-500">{formatDate(t.due_date)}</td>
                    <td className={`py-3 text-right font-semibold ${t.type === 'receivable' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'receivable' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label, value, sub, icon, iconBg, iconColor, valueColor,
}: {
  label: string
  value: number
  sub: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide">{label}</span>
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{formatCurrency(value)}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}
