import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

// Define allowed users with their roles
const ALLOWED_USERS: Record<string, { role: UserRole }> = {
  'kenn.teoh@storehub.com': { role: UserRole.SUPER_ADMIN },
  // Add more users here as needed
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        // Check if the user's email is allowed
        const isAllowed = profile.email && ALLOWED_USERS[profile.email]
        
        return {
          id: profile.id.toString(),
          email: profile.email,
          role: isAllowed ? ALLOWED_USERS[profile.email].role : UserRole.USER,
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last sign in
        await prisma.user.update({
          where: { id: user.id },
          data: { lastSignInAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
    async signIn({ user, account }) {
      // For GitHub provider, check if user is allowed
      if (account?.provider === "github") {
        if (!user.email || !ALLOWED_USERS[user.email]) {
          return false
        }
        
        // Create or update user in database
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            lastSignInAt: new Date(),
          },
          create: {
            email: user.email,
            password: '', // GitHub users don't have passwords
            role: ALLOWED_USERS[user.email].role,
            lastSignInAt: new Date(),
          }
        })
      }
      
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
}