'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, LayoutDashboard, ArrowLeftRight } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/contas', label: 'Transações', icon: ArrowLeftRight },
  ]

  return (
    <aside
      className="w-56 min-h-screen flex flex-col px-3 py-6 shrink-0"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 0 16px rgba(200,240,110,0.3)' }}
        >
          <BarChart2 size={18} className="text-black" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
            FinanceApp
          </p>
          <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
            Controle Financeiro
          </p>
        </div>
      </div>

      {/* Nav label */}
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Menu
      </p>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                active
                  ? {
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(200,240,110,0.2)',
                  }
                  : {
                    color: 'var(--text-secondary)',
                    border: '1px solid transparent',
                  }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              A
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>Adriano</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>Minha conta</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
