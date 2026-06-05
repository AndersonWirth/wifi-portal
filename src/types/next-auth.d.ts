// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from 'next-auth'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      companyId: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: UserRole
    companyId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    companyId: string | null
  }
}
