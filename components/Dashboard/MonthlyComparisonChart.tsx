'use client'

import { useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export type ChartDataPoint = {
    month: string
    receitas: number
    despesas: number
    isFuture?: boolean
}

const CURRENT_MONTH_INDEX = 12

type ViewMode = 'past3_future3' | 'past6' | 'past12' | 'future6'

interface MonthlyComparisonChartProps {
    data: ChartDataPoint[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('past3_future3')

    const getSlice = (): ChartDataPoint[] => {
        switch (viewMode) {
            case 'past3_future3': return data.slice(CURRENT_MONTH_INDEX - 3, CURRENT_MONTH_INDEX + 4)
            case 'past6': return data.slice(CURRENT_MONTH_INDEX - 6, CURRENT_MONTH_INDEX + 1)
            case 'past12': return data.slice(0, CURRENT_MONTH_INDEX + 1)
            case 'future6': return data.slice(CURRENT_MONTH_INDEX, CURRENT_MONTH_INDEX + 7)
        }
    }

    const chartData = getSlice()

    const selectStyle = {
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        outline: 'none',
    }

    return (
        <div
            className="rounded-2xl p-6 flex flex-col min-h-[360px]"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                <div>
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Comparativo Mensal</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Receitas vs Despesas</p>
                </div>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} style={selectStyle}>
                    <option value="past3_future3">3 passados + 3 futuros</option>
                    <option value="past6">Últimos 6 meses</option>
                    <option value="past12">Últimos 12 meses</option>
                    <option value="future6">Mês atual + 6 futuros</option>
                </select>
            </div>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[
                    { color: '#44e090', label: 'Receitas' },
                    { color: 'rgba(68,224,144,0.2)', label: 'Receitas previstas' },
                    { color: 'var(--red)', label: 'Despesas' },
                    { color: 'rgba(255,85,102,0.2)', label: 'Despesas previstas' },
                ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                        {label}
                    </span>
                ))}
            </div>

            <div className="flex-1 w-full h-[250px]">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-muted)' }}>
                        Nenhum dado encontrado para o período.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false}
                                tick={{ fill: '#55556a', fontSize: 11 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fill: '#55556a', fontSize: 11 }}
                                tickFormatter={(v) => `R$${v}`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-bright)',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    color: 'var(--text-primary)',
                                    fontSize: '12px',
                                }}
                                formatter={(value: number | string | undefined, name: string | undefined, props: { payload?: ChartDataPoint }) => {
                                    const isFuture = props?.payload?.isFuture
                                    const label = isFuture ? `${name ?? ''} (previsto)` : (name ?? '')
                                    return [`R$ ${Number(value || 0).toFixed(2)}`, label]
                                }}
                            />
                            <Bar dataKey="receitas" name="Receitas" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                {chartData.map((entry, i) => (
                                    <Cell key={`r-${i}`} fill={entry.isFuture ? 'rgba(68,224,144,0.2)' : '#44e090'} />
                                ))}
                            </Bar>
                            <Bar dataKey="despesas" name="Despesas" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                {chartData.map((entry, i) => (
                                    <Cell key={`d-${i}`} fill={entry.isFuture ? 'rgba(255,85,102,0.2)' : '#ff5566'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
