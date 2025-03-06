import { signOut } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut("google", { redirectTo: "/" })
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  )
} 