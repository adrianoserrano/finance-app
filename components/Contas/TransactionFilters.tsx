'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const selectStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
}

export function TransactionFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get('q') || '')
    const [type, setType] = useState(searchParams.get('type') || '')
    const [status, setStatus] = useState(searchParams.get('status') || '')
    const [dateMode, setDateMode] = useState(searchParams.get('dateMode') || '')
    const [dateValue, setDateValue] = useState(searchParams.get('dateValue') || '')

    const hasFilters = !!(q || type || status || dateMode)

    // Sync state if URL changes externally
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQ(searchParams.get('q') || '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setType(searchParams.get('type') || '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus(searchParams.get('status') || '')
        setDateMode(searchParams.get('dateMode') || '')
        setDateValue(searchParams.get('dateValue') || '')
    }, [searchParams])

    const handleApply = () => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (type) params.set('type', type)
        if (status) params.set('status', status)
        if (dateMode) params.set('dateMode', dateMode)
        if (dateValue && dateMode) params.set('dateValue', dateValue)
        router.push(`/contas?${params.toString()}`)
    }

    const handleClear = () => {
        setQ(''); setType(''); setStatus(''); setDateMode(''); setDateValue('')
        router.push('/contas')
    }

    return (
        <div
            className="rounded-xl p-4 mb-6 flex flex-col gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
            <div className="flex flex-col md:flex-row md:items-end gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Buscar</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '2.25rem' }}
                            placeholder="Descrição da transação..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        />
                    </div>
                </div>

                {/* Tipo */}
                <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
                        <option value="">Todos</option>
                        <option value="payable">A Pagar</option>
                        <option value="receivable">A Receber</option>
                    </select>
                </div>

                {/* Status */}
                <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
                        <option value="">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="recebido">Recebido</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-3">
                {/* Período */}
                <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Período</label>
                    <select
                        value={dateMode}
                        onChange={(e) => { setDateMode(e.target.value); setDateValue('') }}
                        style={selectStyle}
                    >
                        <option value="">Todo o período</option>
                        <option value="specific_month">Mês específico</option>
                        <option value="specific_year">Ano específico</option>
                        <option value="specific_date">Data específica</option>
                    </select>
                </div>

                {dateMode === 'specific_date' && (
                    <div className="w-full md:w-44">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Data</label>
                        <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="input" onKeyDown={(e) => e.key === 'Enter' && handleApply()} />
                    </div>
                )}
                {dateMode === 'specific_month' && (
                    <div className="w-full md:w-44">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Mês</label>
                        <input type="month" value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="input" onKeyDown={(e) => e.key === 'Enter' && handleApply()} />
                    </div>
                )}
                {dateMode === 'specific_year' && (
                    <div className="w-full md:w-44">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Ano</label>
                        <select value={dateValue} onChange={(e) => setDateValue(e.target.value)} style={selectStyle}>
                            <option value="">Selecione...</option>
                            {Array.from({ length: 11 }).map((_, i) => {
                                const year = new Date().getFullYear() - 5 + i
                                return <option key={year} value={year.toString()}>{year}</option>
                            })}
                        </select>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 md:mt-0 ml-auto">
                    <button
                        onClick={handleApply}
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                        style={{ background: 'var(--accent)', color: '#000' }}
                    >
                        <SlidersHorizontal size={15} />
                        Filtrar
                    </button>
                    {hasFilters && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-xl transition-all"
                            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                            <X size={14} />
                            Limpar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
