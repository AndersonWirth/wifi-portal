import { redirect } from 'next/navigation'
export default function ProtectedIndex() {
  redirect('/admin/dashboard')
}
