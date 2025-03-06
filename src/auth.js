import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { dbConnect } from "@/lib/db"
import  getMongoClient  from "@/lib/clientdb"
import UserInfo from "@/models/userInfo"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient, {
    databaseName: process.env.MONGODB_DB
  }), // Use await to ensure connected client
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
  events: {
    createUser: async ({ user }) => {
      console.log("User created event triggered:", user);
      
      try {
        // Connect to database
        await dbConnect();
        
        // Check if user profile already exists by email
        const existingUser = await UserInfo.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user profile if none exists
          const newUserInfo = new UserInfo({
            email: user.email,
            name: user.name
          });
          
          await newUserInfo.save();
          console.log(`Created new UserInfo for: ${user.email}`);
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    }
  },
  callbacks: {
    async session({ session, user }) {
      // Add basic user data
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.image = user.image;
      session.user.name = user.name;
      
      try {
        // Connect to database
        await dbConnect();
        
        // Find user profile by email
        const userProfile = await UserInfo.findOne({ email: user.email });
        
        if (userProfile) {
          // Add custom fields to session
          session.user.semester = userProfile.semester;
          session.user.role = userProfile.role;
        } else {
          // Create user profile if none exists
          console.log(`No profile found for ${user.email}, creating one`);
          const newUserInfo = new UserInfo({
            email: user.email,
            name: user.name
          });
          
          await newUserInfo.save();
          session.user.semester = "Spring 2024";
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }
      
      return session;
    }
  },
  debug: true
})