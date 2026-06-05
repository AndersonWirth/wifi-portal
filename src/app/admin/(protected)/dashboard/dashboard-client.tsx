'use client'
// src/app/admin/dashboard/dashboard-client.tsx

import { Users, Wifi, Megaphone, Tag, TrendingUp, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Stats {
  totalLeads: number; totalConnections: number; leadsToday: number
  leadsThisWeek: number; leadsThisMonth: number; activeCampaigns: number
  activePromotions: number; dailyLeads: { date: string; count: number }[]
}

function StatCard({ label, value, icon: Icon, sub, color = 'orange' }: {
  label: string; value: number; icon: any; sub?: string; color?: string
}) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value.toLocaleString('pt-BR')}</p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardClient({ stats }: { stats: Stats }) {
  const chartData = stats.dailyLeads.slice(-14).map((d) => ({
    date: format(parseISO(d.date), 'dd/MM', { locale: ptBR }),
    leads: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Leads" value={stats.totalLeads} icon={Users} color="orange" />
        <StatCard label="Conexões" value={stats.totalConnections} icon={Wifi} color="blue" />
        <StatCard label="Campanhas Ativas" value={stats.activeCampaigns} icon={Megaphone} color="green" />
        <StatCard label="Promoções Ativas" value={stats.activePromotions} icon={Tag} color="purple" />
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Hoje</p>
          <p className="text-3xl font-bold text-orange-500">{stats.leadsToday}</p>
          <p className="text-gray-400 text-xs mt-1">leads</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Esta semana</p>
          <p className="text-3xl font-bold text-blue-500">{stats.leadsThisWeek}</p>
          <p className="text-gray-400 text-xs mt-1">leads</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Este mês</p>
          <p className="text-3xl font-bold text-green-500">{stats.leadsThisMonth}</p>
          <p className="text-gray-400 text-xs mt-1">leads</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Leads — últimos 14 dias</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)', fontSize: '13px' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="leads" stroke="#f97316" strokeWidth={2} fill="url(#leadsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
