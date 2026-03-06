'use client'

import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { duplicateTransaction } from '@/app/contas/actions'
import { useRouter } from 'next/navigation'

interface DuplicateTransactionButtonProps {
    id: string
}

export function DuplicateTransactionButton({ id }: DuplicateTransactionButtonProps) {
    const [isDuplicating, setIsDuplicating] = useState(false)
    const router = useRouter()

    const handleDuplicate = async () => {
        try {
            setIsDuplicating(true)
            const result = await duplicateTransaction(id)

            if (!result.success) {
                alert('Erro ao duplicar transação: ' + result.error)
                setIsDuplicating(false)
            } else {
                router.push(`/contas/${result.newId}/editar`)
            }
        } catch (error) {
            console.error(error)
            alert('Erro inesperado ao duplicar transação.')
            setIsDuplicating(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
            title="Duplicar Transação (Mês Seguinte)"
        >
            {isDuplicating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
        </button>
    )
}
