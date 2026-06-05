// src/app/admin/login/page.tsx
import LoginForm from './login-form'
import { Wifi } from 'lucide-react'

export const metadata = { title: 'Login — Wi-Fi Portal Admin' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Wi-Fi Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Painel Administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
