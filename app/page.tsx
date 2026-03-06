import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

import { TrendingDown, TrendingUp, Wallet, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MonthlyComparisonChart, ChartDataPoint } from '@/components/Dashboard/MonthlyComparisonChart'
import { addMonths, subMonths, startOfMonth, format, isSameMonth, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function getDashboardData() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return { rows: [], totalBalance: 0, totalPayable: 0, totalReceivable: 0, totalPending: 0, chartData: [] as ChartDataPoint[] }

  const rows = data as Transaction[]

  const totalPayable = rows
    .filter((t) => t.type === 'payable' && t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalReceivable = rows
    .filter((t) => t.type === 'receivable' && t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalPending = rows
    .filter((t) => t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const allReceivable = rows
    .filter((t) => t.type === 'receivable')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const allPayable = rows
    .filter((t) => t.type === 'payable')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalBalance = allReceivable - allPayable

  // Generate 19 months: -12 to +6
  const chartData: ChartDataPoint[] = []
  const today = new Date()
  const currentMonthStart = startOfMonth(today)

  for (let i = -12; i <= 6; i++) {
    const targetMonth = i >= 0
      ? startOfMonth(addMonths(today, i))
      : startOfMonth(subMonths(today, Math.abs(i)))

    const monthName = format(targetMonth, 'MMM/yy', { locale: ptBR })
    const future = isAfter(targetMonth, currentMonthStart)

    const monthTransactions = rows.filter((t) => {
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
      despesas,
      isFuture: future
    })
  }

  return { rows: rows.slice(0, 5), totalBalance, totalPayable, totalReceivable, totalPending, chartData }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function currentMonthLabel() {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase())
}

export default async function DashboardPage() {
  const { rows, totalBalance, totalPayable, totalReceivable, totalPending, chartData } = await getDashboardData()

  const cards = [
    {
      label: 'Saldo Geral',
      value: totalBalance,
      sub: totalBalance >= 0 ? 'Saldo positivo ↑' : 'Saldo negativo ↓',
      icon: <Wallet size={16} />,
      accentColor: totalBalance >= 0 ? 'var(--green)' : 'var(--red)',
      accentDim: totalBalance >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
    },
    {
      label: 'A Receber',
      value: totalReceivable,
      sub: 'Pendentes',
      icon: <TrendingUp size={16} />,
      accentColor: 'var(--blue)',
      accentDim: 'var(--blue-dim)',
    },
    {
      label: 'A Pagar',
      value: totalPayable,
      sub: 'Pendentes',
      icon: <TrendingDown size={16} />,
      accentColor: 'var(--red)',
      accentDim: 'var(--red-dim)',
    },
    {
      label: 'Pendentes',
      value: totalPending,
      sub: 'Aguardando confirmação',
      icon: <AlertCircle size={16} />,
      accentColor: 'var(--amber)',
      accentDim: 'var(--amber-dim)',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{currentMonthLabel()}</p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {greeting()},{' '}
            <span style={{ color: 'var(--accent)' }}>Adriano</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Aqui está um resumo das suas finanças.
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </span>
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: card.accentDim, color: card.accentColor }}
              >
                {card.icon}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.accentColor }}>
              {formatCurrency(card.value)}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyComparisonChart data={chartData} />
        </div>

        {/* Recent transactions */}
        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Transações Recentes</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Últimas 5 movimentações</p>
            </div>
            <Link
              href="/contas"
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: 'var(--text-muted)' }}>
              <Wallet size={36} className="opacity-30" />
              <p className="text-sm">Nenhuma transação ainda</p>
              <Link href="/contas/nova" className="text-xs" style={{ color: 'var(--accent)' }}>
                Adicionar primeira →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: 'var(--bg-base)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: t.type === 'receivable' ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: t.type === 'receivable' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {t.type === 'receivable' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {t.description}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t.category} · {formatDate(t.due_date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-sm font-bold shrink-0 ml-3"
                    style={{ color: t.type === 'receivable' ? 'var(--green)' : 'var(--red)' }}
                  >
                    {t.type === 'receivable' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
