'use client'

import { useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts'

export type ChartDataPoint = {
    month: string
    receitas: number
    despesas: number
    isFuture?: boolean
}

// chartData has 19 points: index 0 = -12 months, index 12 = current month, index 18 = +6 months
const CURRENT_MONTH_INDEX = 12

type ViewMode = 'past3_future3' | 'past6' | 'past12' | 'future6'

interface MonthlyComparisonChartProps {
    data: ChartDataPoint[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('past3_future3')

    const getSlice = (): ChartDataPoint[] => {
        switch (viewMode) {
            case 'past3_future3':
                // 3 past + current + 3 future = 7 points
                return data.slice(CURRENT_MONTH_INDEX - 3, CURRENT_MONTH_INDEX + 4)
            case 'past6':
                // 6 past + current = 7 points
                return data.slice(CURRENT_MONTH_INDEX - 6, CURRENT_MONTH_INDEX + 1)
            case 'past12':
                // 12 past + current = 13 points
                return data.slice(0, CURRENT_MONTH_INDEX + 1)
            case 'future6':
                // current + 6 future = 7 points
                return data.slice(CURRENT_MONTH_INDEX, CURRENT_MONTH_INDEX + 7)
        }
    }

    const chartData = getSlice()

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="font-semibold text-slate-800">Comparativo Mensal</h2>
                    <p className="text-sm text-slate-400">Receitas vs Despesas</p>
                </div>
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5"
                >
                    <option value="past3_future3">3 passados + 3 futuros</option>
                    <option value="past6">Últimos 6 meses</option>
                    <option value="past12">Últimos 12 meses</option>
                    <option value="future6">Mês atual + 6 futuros</option>
                </select>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                    Receitas confirmadas
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-200" />
                    Receitas previstas
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
                    Despesas confirmadas
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-red-200" />
                    Despesas previstas
                </span>
            </div>

            <div className="flex-1 w-full h-[300px]">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Nenhum dado encontrado para o período.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number | string | undefined, name: string | undefined, props: { payload?: ChartDataPoint }) => {
                                    const isFuture = props?.payload?.isFuture
                                    const label = isFuture ? `${name ?? ''} (previsto)` : (name ?? '')
                                    return [`R$ ${Number(value || 0).toFixed(2)}`, label]
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="receitas"
                                name="Receitas"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                                hide={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`receita-${index}`}
                                        fill={entry.isFuture ? '#6ee7b7' : '#10b981'}
                                    />
                                ))}
                            </Bar>
                            <Bar
                                dataKey="despesas"
                                name="Despesas"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`despesa-${index}`}
                                        fill={entry.isFuture ? '#fca5a5' : '#ef4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
