'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteTransaction } from '@/app/contas/actions'

interface DeleteTransactionButtonProps {
    id: string
}

export function DeleteTransactionButton({ id }: DeleteTransactionButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const result = await deleteTransaction(id)
            if (!result.success) {
                alert('Erro ao excluir transação: ' + result.error)
            } else {
                setIsOpen(false)
            }
        } catch (error) {
            console.error(error)
            alert('Erro inesperado ao excluir transação.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                title="Excluir"
            >
                <Trash2 size={14} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <div
                        className="rounded-2xl shadow-2xl max-w-sm w-full p-6 text-left animate-in zoom-in-95 duration-200"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}
                    >
                        <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Excluir Transação
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                                style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,85,102,0.3)' }}
                            >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
