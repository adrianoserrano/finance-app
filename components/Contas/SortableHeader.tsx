'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface SortableHeaderProps {
    label: string
    field: string
    className?: string
}

export function SortableHeader({ label, field, className = '' }: SortableHeaderProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get('sortBy')
    const currentOrder = searchParams.get('sortOrder') || 'asc'

    const isActive = currentSort === field
    const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc'

    const handleSort = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sortBy', field)
        params.set('sortOrder', nextOrder)
        router.push(`/contas?${params.toString()}`)
    }

    return (
        <th
            className={`px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-600 transition-colors ${className}`}
            onClick={handleSort}
        >
            <span className="inline-flex items-center gap-1.5">
                {label}
                {isActive ? (
                    currentOrder === 'asc' ? (
                        <ArrowUp size={12} className="text-violet-500" />
                    ) : (
                        <ArrowDown size={12} className="text-violet-500" />
                    )
                ) : (
                    <ArrowUpDown size={12} className="text-slate-300" />
                )}
            </span>
        </th>
    )
}
