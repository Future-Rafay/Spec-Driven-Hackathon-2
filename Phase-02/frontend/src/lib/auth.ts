import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

console.log("DB URL:", process.env.DATABASE_URL)

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!
  },
  plugins: [
    jwt({
      jwt: {
        // Custom payload with user ID and email
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email
        }),
        // Token expiration (7 days as per spec)
        expiresIn: "7d",
        // Issuer and audience for verification
        issuer: process.env.NEXT_PUBLIC_APP_URL,
        audience: process.env.NEXT_PUBLIC_APP_URL,
      }
    })
  ],
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Refresh after 1 day
    // Cookie cache for performance
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "jwt" // Use JWT encoding for cookie cache
    }
  }
})
