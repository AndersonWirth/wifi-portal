'use client'
// src/components/admin/sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Megaphone, Tag, Users,
  BarChart3, Settings, Wifi, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: { name?: string; email?: string; role?: string; companyId?: string }
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/companies', label: 'Empresas', icon: Building2, superOnly: true },
  { href: '/admin/campaigns', label: 'Campanhas', icon: Megaphone },
  { href: '/admin/promotions', label: 'Promoções', icon: Tag },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

export default function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = user.role === 'SUPER_ADMIN'

  return (
    <aside className="w-60 bg-gray-900 flex flex-col border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Wi-Fi Portal</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.superOnly && !isSuperAdmin) return null
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {user.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-gray-500 text-xs truncate">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
