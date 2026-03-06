-- Habilitar extensão para geração de UUID
create extension if not exists "pgcrypto";

-- Tabela principal de transações
create table public.transactions (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),
  description text        not null,
  amount      numeric     not null    check (amount > 0),
  due_date    date        not null,
  type        text        not null    check (type in ('payable', 'receivable')),
  category    text        not null    check (category in (
                                        'Alimentação',
                                        'Moradia',
                                        'Assinaturas',
                                        'Transporte',
                                        'Saúde',
                                        'Receita',
                                        'Outros'
                                      )),
  status      text        not null    default 'pendente'
                                      check (status in ('pendente', 'pago', 'recebido'))
);

-- Índices para as queries mais frequentes do dashboard
create index idx_transactions_type_status on public.transactions (type, status);
create index idx_transactions_due_date    on public.transactions (due_date);

-- Row Level Security (desabilitado — app pessoal sem autenticação)
alter table public.transactions disable row level security;

-- Comentários descritivos
comment on column public.transactions.amount   is 'Valor absoluto (positivo). O tipo define se é despesa ou receita.';
comment on column public.transactions.type     is 'payable = A pagar | receivable = A receber';
comment on column public.transactions.status   is 'pendente | pago | recebido';
comment on column public.transactions.category is 'Categoria fixa da transação';
