import { auth } from '@/auth'
import Welcome from '@/components/dashboard/welcome'
import UserStats from '@/components/dashboard/userStats'
import RecentActivity from '@/components/dashboard/recentActivity'

export default async function DashboardPage() {
    const session = await auth()
 
    if (!session?.user) return (<div>Not Authenticated...</div>)
    else {
        return (
            <div className="w-full min-h-screen dark:bg-slate-900">
                <div className="flex flex-col items-center gap-8 px-4 py-6">
                    <Welcome />
                    <UserStats />
                    <RecentActivity />
                </div>
            </div>
        )
    }
};
