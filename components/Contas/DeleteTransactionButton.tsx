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
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Excluir"
            >
                <Trash2 size={14} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Transação</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
