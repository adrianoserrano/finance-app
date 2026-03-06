import TransactionForm from '@/components/TransactionForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovaContaPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/contas"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Voltar para Transações
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nova Transação</h1>
        <p className="text-slate-400 text-sm mt-0.5">Preencha os dados da nova transação</p>
      </div>
      <TransactionForm />
    </div>
  )
}
