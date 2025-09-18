import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/database/connection'
import bcrypt from 'bcryptjs'
import config from '../../config.js' // استخدم ملف config.js اللي جهزته

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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) return null

          // OAuth users ممكن مايكونش عندهم password
          if (!('password' in user) || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || 'STUDENT',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
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
        token.role = 'role' in user ? user.role : 'STUDENT'
        token.id = user.id
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: 'STUDENT',
            }
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
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
    async signOut({ session }) {
      console.log(`User ${session?.user?.email} signed out`)
    },
  },
  debug: config.app.env === 'development',
  secret: config.auth.nextAuth.secret,
      }
