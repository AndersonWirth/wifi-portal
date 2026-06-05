// src/components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-300" />
      </div>
      <p className="font-medium text-gray-600 text-sm">{title}</p>
      {description && <p className="text-gray-400 text-xs mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
