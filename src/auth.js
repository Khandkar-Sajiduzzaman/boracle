import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { getMongoClient, dbConnect } from "@/lib/db"
import  userInfo from "@/models/userInfo"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient),
  providers: [
    Google({
      profile(profile) {
        return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.image,
            role: profile.role ?? "user", // Set default role
          }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Basic user data from Auth.js
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.image = user.image;
      session.user.name = user.name;
      
      // Get MongoDB client
      await dbConnect();
      
      // Fetch additional user data from another collection
      // For example, a userProfile collection that has more detailed information
      const userProfile = await userInfo.findOne({ email: user.email });
      
      if (userProfile) {
        session.user.semester = userProfile.semester;
      }
      
      return session;
    }
  }
})

