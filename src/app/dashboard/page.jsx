import { auth } from '@/auth'

export default async function DashboardPage() {

    const session = await auth()
 
    if (!session?.user) return (<div>Not Authenticated...</div>)
    else {
        console.log(session)
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard!</p>
        </div>
    );
};
