import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from '@/lib/pgdb';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Remove the MongoDB adapter since we're using JWT strategy
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign-in
      if (account && profile) {
        console.log("JWT callback - initial sign-in:", { email: profile.email });
        
        try {
          
          // Check if user profile already exists by email
          let userProfile = await sql`SELECT * FROM userinfo WHERE email = ${profile.email}`;

          if (!userProfile) {
            // Create new user profile if none exists
            userProfile = await sql`
              INSERT INTO userinfo (name, email, role)
              VALUES (${profile.name}, ${profile.email}, 'student')
              RETURNING *;
            `;
            console.log("Created new UserInfo:", userProfile);
            console.log(`Created new UserInfo for: ${profile.email}`);
          }
          
          // Add custom information to the token
          token.id = user.id;
          token.email = profile.email;
          token.semester = userProfile.semester;
          token.role = userProfile.role || "user";
          
        } catch (error) {
          console.error("Error in JWT callback:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Transfer from token to session
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.semester = token.semester;
      
      // For existing sessions, refresh data from database
      if (!session.user.semester || !session.user.role) {
        try {
          
          // Find user profile by email
          const userProfile = await sql`SELECT * FROM userinfo WHERE email = ${session.user.email}`;

          if (userProfile) {
            // Update session with latest data
            session.user.semester = userProfile.enrolled_sem;
            session.user.role = userProfile.role || "student";
          }
        } catch (error) {
          console.error("Error refreshing session data:", error);
        }
      }
      
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 days
  },
  debug: process.env.NODE_ENV === "development"
})