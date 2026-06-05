// src/components/ui/stat-card.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  iconClassName?: string
}

export function StatCard({ label, value, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-1 font-medium',
              trend.value >= 0 ? 'text-green-600' : 'text-red-500'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconClassName || 'bg-orange-50 text-orange-600')}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
