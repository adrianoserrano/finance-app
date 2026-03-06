'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TransactionStatus, TransactionType } from '@/types'
import { useRouter } from 'next/navigation'

const STATUS_STYLES: Record<TransactionStatus, { bg: string; color: string }> = {
  pendente: { bg: 'rgba(255,184,77,0.12)', color: '#ffb84d' },
  pago: { bg: 'rgba(68,224,144,0.12)', color: '#44e090' },
  recebido: { bg: 'rgba(85,136,255,0.12)', color: '#5588ff' },
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
  const styles = STATUS_STYLES[status]

  async function toggle() {
    if (!nextStatus) return
    setLoading(true)
    await supabase.from('transactions').update({ status: nextStatus }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || !nextStatus}
      title={nextStatus ? `Marcar como ${nextStatus}` : undefined}
      className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-40 cursor-pointer"
      style={{
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.color}30`,
      }}
    >
      {loading ? '...' : status}
    </button>
  )
}
