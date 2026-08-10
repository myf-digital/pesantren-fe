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
          const rawActiveRole = data.userdata.active_role
          const roleName = rawActiveRole?.role?.role_name || data.userdata.role_name || data.userdata.role?.role_name
          const cabangName = rawActiveRole?.cabang?.nama_cabang || data.userdata.cabang_name

          return {
            id: String(data.userdata.resource_id),
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            userdata: {
              resource_id: data.userdata.resource_id,
              username: data.userdata.username,
              full_name: data.userdata.full_name,
              email: data.userdata.email,
              role_name: roleName,
              id_resource_role: rawActiveRole?.id_resource_role || data.userdata.id_resource_role,
              cabang_name: cabangName,
              pegawai: data.userdata.pegawai
                ? { id_pegawai: data.userdata.pegawai.id_pegawai, nama_lengkap: data.userdata.pegawai.nama_lengkap }
                : null
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
