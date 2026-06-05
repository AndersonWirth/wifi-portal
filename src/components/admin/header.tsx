'use client'
// src/components/admin/header.tsx

import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/companies': 'Empresas',
  '/admin/campaigns': 'Campanhas',
  '/admin/promotions': 'Promoções',
  '/admin/leads': 'Leads',
  '/admin/reports': 'Relatórios',
  '/admin/settings': 'Configurações',
}

export default function AdminHeader({ user }: { user: any }) {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] || 'Admin'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
    </header>
  )
}
