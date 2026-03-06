'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'

export function TransactionFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get('q') || '')
    const [type, setType] = useState(searchParams.get('type') || '')
    const [status, setStatus] = useState(searchParams.get('status') || '')

    // Sync state if URL changes externally
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQ(searchParams.get('q') || '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setType(searchParams.get('type') || '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus(searchParams.get('status') || '')
    }, [searchParams])

    const handleApply = () => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (type) params.set('type', type)
        if (status) params.set('status', status)

        router.push(`/contas?${params.toString()}`)
    }

    const handleClear = () => {
        setQ('')
        setType('')
        setStatus('')
        router.push('/contas')
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row md:items-end gap-4 shadow-sm">
            <div className="flex-1 w-full relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Buscar</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full pl-9 p-2.5"
                        placeholder="Descrição da transação..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                </div>
            </div>

            <div className="w-full md:w-48">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5"
                >
                    <option value="">Todos</option>
                    <option value="payable">A Pagar</option>
                    <option value="receivable">A Receber</option>
                </select>
            </div>

            <div className="w-full md:w-48">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5"
                >
                    <option value="">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="recebido">Recebido</option>
                </select>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
                <button
                    onClick={handleApply}
                    className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <Filter size={16} />
                    Filtrar
                </button>
                {(q || type || status) && (
                    <button
                        onClick={handleClear}
                        className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors"
                        title="Limpar Filtros"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
