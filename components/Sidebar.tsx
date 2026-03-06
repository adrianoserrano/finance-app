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
    <aside className="w-56 min-h-screen bg-slate-900 flex flex-col px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
          <BarChart2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">FinanceApp</p>
          <p className="text-slate-400 text-xs leading-tight">Controle Financeiro</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
