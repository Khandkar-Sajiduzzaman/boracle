import { auth } from '@/auth'
import FacultyImport from '@/components/dashboard/facultyImport'
import RecentActivity from '@/components/dashboard/recentActivity'
import UserStats from '@/components/dashboard/userStats'
import Welcome from '@/components/dashboard/welcome'

export default async function DashboardPage() {
    const session = await auth()
    const isAdmin = session?.user?.userrole === 'admin';
 
    if (!session?.user) return (<div>Not Authenticated...</div>)
    else {
        return (
            <div className="w-full min-h-screen dark:bg-slate-900">
                <div className="flex flex-col items-center gap-8 px-4 py-6">
                    <Welcome />
                    <UserStats />
                    <RecentActivity />
                    {isAdmin && <FacultyImport />}
                </div>
            </div>
        )
    }
};
