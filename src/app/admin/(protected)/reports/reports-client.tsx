'use client'
// src/app/admin/reports/reports-client.tsx

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, Users, Wifi, Megaphone, Tag } from 'lucide-react'

export default function ReportsClient() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/dashboard')
      setStats(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Carregando relatórios...</div>
  if (!stats) return null

  const chartData = stats.dailyLeads.map((d: any) => ({
    date: format(parseISO(d.date), 'dd/MM', { locale: ptBR }),
    leads: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-orange-600 bg-orange-50' },
          { label: 'Conexões', value: stats.totalConnections, icon: Wifi, color: 'text-blue-600 bg-blue-50' },
          { label: 'Hoje', value: stats.leadsToday, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Esta semana', value: stats.leadsThisWeek, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          { label: 'Este mês', value: stats.leadsThisMonth, icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Leads por dia — 30 dias */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" /> Leads por dia — últimos 30 dias
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -20, right: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)', fontSize: '13px' }}
            />
            <Bar dataKey="leads" fill="#f97316" radius={[4, 4, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Crescimento acumulado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Crescimento acumulado
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData.reduce((acc: any[], d: any, i: number) => {
              const prev = acc[i - 1]?.acumulado || 0
              acc.push({ ...d, acumulado: prev + d.leads })
              return acc
            }, [])}
            margin={{ left: -20, right: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)', fontSize: '13px' }} />
            <Line type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total acumulado" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
