import { auth } from "@/auth";

export default async function Welcome() {
 try {
    const session = await auth()
    const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";
    
    return (
        <div className="w-full flex flex-col gap-8 dark:bg-slate-900"> {/* Changed to flex-col */}
            <div className="w-full pt-7">
                <div className="w-full text-center px-4">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="dark:text-blue-400 text-blue-900">Welcome to O.R.A.C.L.E,</span>{" "}
                        <span className="text-blue-300">{firstName}</span>
                    </h1>
                    <p className="text-lg">You are now logged in</p>
                </div>
            </div>

            {/* Dashboard stats section */}
            <div className="w-full">
                <div className="w-full text-center px-4">
                    <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
                    <p className="text-lg">TODO</p>
                    {/* Add more dashboard content here */}
                </div>
            </div>
        </div>
    );
    
 } catch (error) {
    console.error("Failed to fetch user session:", error)
    return (
        <div className="w-full flex items-center justify-center min-h-screen dark:bg-slate-900">
            <div className="w-full text-center px-4">
                <h1 className="text-4xl font-bold mb-4">
                    <span className="dark:text-blue-400 text-blue-900">Welcome to O.R.A.C.L.E</span>
                </h1>
                <p className="text-lg">Failed to Get Your Session Data. Please clear your cookies and try logging in again</p>
            </div>
        </div>
    )
    
 }
}