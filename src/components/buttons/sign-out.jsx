import { signOut } from "@/auth"
import { Button } from "@/components/ui/button" // Import the Button component
// import door icon from lucide
import { LogOut } from 'lucide-react'
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut("google", { redirectTo: "/" })
      }}
    >
      <Button type="submit" className="flex gap-2 items-center">
        <LogOut size={18} />
        Sign out
      </Button>
    </form>
  )
} 