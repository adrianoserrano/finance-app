export type TransactionType = 'payable' | 'receivable'
export type TransactionStatus = 'pendente' | 'pago' | 'recebido'
export type TransactionCategory =
  | 'Alimentação'
  | 'Moradia'
  | 'Assinaturas'
  | 'Transporte'
  | 'Saúde'
  | 'Receita'
  | 'Outros'

export interface Transaction {
  id: string
  created_at: string
  description: string
  amount: number
  due_date: string
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>

// Formato exigido pelo Supabase SDK v2 (GenericSchema)
export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: Partial<TransactionInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export const CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Moradia',
  'Assinaturas',
  'Transporte',
  'Saúde',
  'Receita',
  'Outros',
]

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  recebido: 'Recebido',
}

export const TYPE_LABELS: Record<TransactionType, string> = {
  payable: 'A Pagar',
  receivable: 'A Receber',
}
