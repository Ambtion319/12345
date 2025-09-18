// lib/auth/config.ts
import { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import { AdapterUser } from 'next-auth/adapters'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/database/connection'
import bcrypt from 'bcryptjs'

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
  },
  auth: {
    nextAuth: {
      secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret',
    },
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
    }),
    GitHubProvider({
      clientId: config.oauth.github.clientId,
      clientSecret: config.oauth.github.clientSecret,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !(user as { password?: string }).password) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password!
        )

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        } as AdapterUser & { role: string }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (user) {
        // type assertion
        const u = user as AdapterUser & { role: string }
        token.role = u.role
        token.id = u.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    },
    async signIn({ user }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: 'STUDENT',
            },
          })
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  debug: config.app.env === 'development',
  secret: config.auth.nextAuth.secret,
        }
