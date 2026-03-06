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
    ResponsiveContainer
} from 'recharts'

export type ChartDataPoint = {
    month: string
    receitas: number
    despesas: number
}

interface MonthlyComparisonChartProps {
    data: ChartDataPoint[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
    const [monthsToShow, setMonthsToShow] = useState<number>(6)

    // O slice pega sempre os N últimos itens do array (presumindo que está em ordem de data ascending)
    const chartData = data.slice(-monthsToShow)

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="font-semibold text-slate-800">Comparativo Mensal</h2>
                    <p className="text-sm text-slate-400">Receitas vs Despesas</p>
                </div>
                <select
                    value={monthsToShow}
                    onChange={(e) => setMonthsToShow(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5"
                >
                    <option value={3}>Últimos 3 meses</option>
                    <option value={6}>Últimos 6 meses</option>
                    <option value={12}>Últimos 12 meses</option>
                </select>
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
                            margin={{
                                top: 5,
                                right: 5,
                                left: -20,
                                bottom: 0,
                            }}
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
                                formatter={(value: number | string | undefined) => [`R$ ${Number(value || 0).toFixed(2)}`, '']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="receitas"
                                name="Receitas"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="despesas"
                                name="Despesas"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
