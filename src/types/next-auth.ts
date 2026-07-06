import type { DefaultSession, DefaultUser } from "next-auth"

import type { PermissionMap } from "./permission"

declare module "next-auth" {
  interface Session {
    access_token?: string
    userdata?: {
      username?: string
      full_name?: string
      email?: string
      role_name?: string
      pegawai?: any
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    access_token?: string
    permissions?: PermissionMap
    userdata?: {
      username?: string
      full_name?: string
      email?: string
      role_name?: string
      pegawai?: any
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string
    permissions?: PermissionMap
    userdata?: {
      username?: string
      full_name?: string
      email?: string
      role_name?: string
      pegawai?: any
    }
  }
}
