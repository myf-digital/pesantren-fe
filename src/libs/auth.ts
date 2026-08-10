import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

import { normalizeAbility } from './permission'

export const authOptions: NextAuthOptions = {
  adapter: undefined, // DO NOT USE PrismaAdapter for external API

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'username' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })

          const json = await res.json()

          if (!res.ok || !json?.data) {
            throw new Error(
              JSON.stringify({
                message: 'Username atau password salah',
                message_dev: json?.message || 'Login gagal'
              })
            )
          }

          const data = json.data

          const sanitizeRoleItem = (item: any) => {
            if (!item) return null

            const res: any = { id_resource_role: item.id_resource_role }

            if (item.is_default) res.is_default = item.is_default
            if (item.id_lembaga) res.id_lembaga = item.id_lembaga
            if (item.role?.role_name) res.role = { role_id: item.role.role_id, role_name: item.role.role_name }
            if (item.cabang?.nama_cabang)
              res.cabang = { id_cabang: item.cabang.id_cabang, nama_cabang: item.cabang.nama_cabang }
            if (item.organizationUnit?.nama_orgunit)
              res.organizationUnit = {
                id_orgunit: item.organizationUnit.id_orgunit,
                nama_orgunit: item.organizationUnit.nama_orgunit
              }
            if (item.lembagaPendidikanFormal?.nama_lembaga)
              res.lembagaPendidikanFormal = {
                id_lembaga: item.lembagaPendidikanFormal.id_lembaga,
                nama_lembaga: item.lembagaPendidikanFormal.nama_lembaga
              }
            if (item.lembagaPendidikanKepesantrenan?.nama_lembaga)
              res.lembagaPendidikanKepesantrenan = {
                id_lembaga: item.lembagaPendidikanKepesantrenan.id_lembaga,
                nama_lembaga: item.lembagaPendidikanKepesantrenan.nama_lembaga
              }
            if (item.pegawai?.nama_lengkap)
              res.pegawai = { id_pegawai: item.pegawai.id_pegawai, nama_lengkap: item.pegawai.nama_lengkap }

            return res
          }

          const sanitizeAvailableRoles = (roles: any[]) => {
            if (!Array.isArray(roles)) return []

            return roles.map(sanitizeRoleItem)
          }

          const activeRole = sanitizeRoleItem(data.userdata.active_role)
          const availableRoles = sanitizeAvailableRoles(data.userdata.available_roles || [])

          return {
            id: String(data.userdata.resource_id),
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            userdata: {
              resource_id: data.userdata.resource_id,
              username: data.userdata.username,
              full_name: data.userdata.full_name,
              email: data.userdata.email,
              role_name: activeRole?.role?.role_name || data.userdata.role?.role_name,
              pegawai: data.userdata.pegawai
                ? { id_pegawai: data.userdata.pegawai.id_pegawai, nama_lengkap: data.userdata.pegawai.nama_lengkap }
                : null,
              active_role: activeRole,
              available_roles: availableRoles
            },

            permissions: normalizeAbility(data.userdata.ability || [])
          }
        } catch (err) {
          console.error('LOGIN ERROR:', err)

          return null
        }
      }
    })
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.access_token = user.access_token
        token.userdata = user.userdata
        token.permissions = user.permissions
      }

      if (trigger === 'update' && session) {
        if (session.access_token) token.access_token = session.access_token
        if (session.userdata) token.userdata = session.userdata
        if (session.permissions) token.permissions = session.permissions
      }

      return token
    },

    async session({ session, token }) {
      session.access_token = token.access_token
      session.userdata = token.userdata

      return session
    }
  },

  pages: {
    signIn: '/login'
  }
}
