"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignIn from "@/components/buttons/sign-in";

export default function SignInOrDashboard() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";
    
    // Show a loading state while session is being determined
    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Button disabled variant="outline">
                    Loading...
                </Button>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-2">
        {isAuthenticated 
        ? <Button className={"dark:bg-white"} variant="default" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
          </Button> 
        : <SignIn />}
        </div>
    );
}