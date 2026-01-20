import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { SecurityLogger, SecurityAction } from "./security-logger"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log('Attempting authentication for:', credentials.email)

          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          if (!user) {
            console.log('User not found in database:', credentials.email)
            await SecurityLogger.log({
              userId: 'anonymous',
              action: SecurityAction.LOGIN_FAILED,
              resource: 'authentication',
              details: `Login attempt for non-existent user: ${credentials.email}`,
              ipAddress: '127.0.0.1',
              userAgent: 'NextAuth',
              success: false,
              riskLevel: 'MEDIUM' as any
            })
            return null
          }

          // Check if user is active
          if (!user.isActive) {
            console.log('User account is inactive:', credentials.email)
            await SecurityLogger.log({
              userId: user.id,
              action: SecurityAction.LOGIN_FAILED,
              resource: 'authentication',
              details: 'Login attempt on inactive account',
              ipAddress: '127.0.0.1',
              userAgent: 'NextAuth',
              success: false,
              riskLevel: 'HIGH' as any
            })
            return null
          }

          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            console.log('User account is locked:', credentials.email)
            await SecurityLogger.log({
              userId: user.id,
              action: SecurityAction.LOGIN_FAILED,
              resource: 'authentication',
              details: 'Login attempt on locked account',
              ipAddress: '127.0.0.1',
              userAgent: 'NextAuth',
              success: false,
              riskLevel: 'HIGH' as any
            })
            return null
          }

          // Verify password
          if (!user.password) {
            console.log('User has no password set:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email)

            // Increment login attempts
            const newAttempts = (user.loginAttempts || 0) + 1
            const shouldLock = newAttempts >= 5

            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes
              }
            })

            await SecurityLogger.log({
              userId: user.id,
              action: SecurityAction.LOGIN_FAILED,
              resource: 'authentication',
              details: `Invalid password attempt ${newAttempts}/5`,
              ipAddress: '127.0.0.1',
              userAgent: 'NextAuth',
              success: false,
              riskLevel: (shouldLock ? 'HIGH' : 'MEDIUM') as any
            })

            return null
          }

          // Successful login - reset login attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date()
            }
          })

          console.log('Successful authentication for:', credentials.email)

          await SecurityLogger.log({
            userId: user.id,
            action: SecurityAction.LOGIN_SUCCESS,
            resource: 'authentication',
            details: 'Successful login',
            ipAddress: '127.0.0.1',
            userAgent: 'NextAuth',
            success: true,
            riskLevel: 'LOW' as any
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'User',
            role: user.role || 'user',
            subscription: user.subscription || 'free',
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.role = user.role
          token.subscription = user.subscription
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.sub!
          session.user.role = token.role as string
          session.user.subscription = token.subscription as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      // Force production URL for liftplannerpro.org domain
      const isLiftPlannerDomain = url.includes('liftplannerpro.org') || baseUrl.includes('liftplannerpro.org')
      const isProduction = process.env.NODE_ENV === 'production' || isLiftPlannerDomain
      const productionUrl = 'https://liftplannerpro.org'
      const developmentUrl = 'http://localhost:3000'

      // Always use production URL if accessing via liftplannerpro.org
      const configuredBaseUrl = (isProduction || isLiftPlannerDomain) ? productionUrl : developmentUrl

      console.log('NextAuth redirect:', {
        url,
        baseUrl,
        configuredBaseUrl,
        isProduction,
        isLiftPlannerDomain,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      })

      // If url is relative, prepend configured baseUrl
      if (url.startsWith('/')) {
        const redirectUrl = `${configuredBaseUrl}${url}`
        console.log('Relative URL redirect:', redirectUrl)
        return redirectUrl
      }

      // If url starts with configured baseUrl, it's safe
      if (url.startsWith(configuredBaseUrl)) {
        console.log('Same origin redirect:', url)
        return url
      }

      // For logout, always redirect to home page
      if (url.includes('signout') || url.includes('logout')) {
        const homeUrl = `${configuredBaseUrl}/`
        console.log('Logout redirect to home:', homeUrl)
        return homeUrl
      }

      // Default to configured baseUrl for safety
      console.log('Default redirect to base:', configuredBaseUrl)
      return configuredBaseUrl
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email)
    },
    async signOut({ session, token }) {
      console.log('User signed out:', session?.user?.email)
    },
    async session() {
      // Session accessed
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/", // Redirect to home page after logout
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  },
}
