// src/app/admin/layout.tsx
// This layout applies to ALL /admin routes including login
// So we must NOT redirect here - redirect happens in (protected) layout
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
