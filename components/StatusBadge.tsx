'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TransactionStatus, TransactionType } from '@/types'
import { useRouter } from 'next/navigation'

const STATUS_STYLES: Record<TransactionStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-emerald-100 text-emerald-700',
  recebido: 'bg-sky-100 text-sky-700',
}

const NEXT_STATUS: Record<string, TransactionStatus> = {
  'payable:pendente': 'pago',
  'receivable:pendente': 'recebido',
  'payable:pago': 'pendente',
  'receivable:recebido': 'pendente',
}

export default function StatusBadge({
  id,
  status,
  type,
}: {
  id: string
  status: TransactionStatus
  type: TransactionType
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const key = `${type}:${status}`
  const nextStatus = NEXT_STATUS[key]

  async function toggle() {
    if (!nextStatus) return
    setLoading(true)
    await supabase
      .from('transactions')
      .update({ status: nextStatus })
      .eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || !nextStatus}
      title={nextStatus ? `Marcar como ${nextStatus}` : undefined}
      className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50 ${STATUS_STYLES[status]}`}
    >
      {loading ? '...' : status}
    </button>
  )
}
