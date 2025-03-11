import { auth } from '@/auth'
import Welcome from '@/components/dashboard/welcome'

export default async function DashboardPage() {

    const session = await auth()
 
    if (!session?.user) return (<div>Not Authenticated...</div>)
    else {

        return (
            <Welcome />
        )
        
    }


};
