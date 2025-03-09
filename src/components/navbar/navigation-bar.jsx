"use client"

import * as React from "react"
import navbarItems from "@/constants/navbarItems"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import ProfileDropdown from "./profileDropdown"
import { Menu, X } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"

export default function NavigationBar() {
  // Using Auth.js to check if user is logged in
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" }); 
  };
  
  return (
    <div className="border-b dark:border-gray-700 h-[60px] flex items-center">
      <div className="container mx-auto relative px-4">
        {/* Logo/Brand - visible on all screen sizes */}
        <div className="absolute left-16 md:left-4 top-1/2 transform -translate-y-1/2">
          <Link href="/">
            <span className="font-bold text-lg hidden md:flex">O.R.A.C.L.E</span>
          </Link>
        </div>
        
        {/* Desktop Navigation - Center aligned and hidden on mobile */}
        <div className="hidden md:flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className={"md:space-x-4 lg:flex"}>
              {navbarItems.filter(item => item.enabled !== false).map((item, index) => (
                <NavigationMenuItem key={index}>
                  <Link href={item.href || "#"} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),"font-medium"
                      )}>
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] dark:bg-blue-950 font-semibold">
              <SheetHeader>
                <SheetTitle className={"hidden"}>Navigation Menu</SheetTitle>
                <div className="flex items-center justify-center gap-2">
                  <Link href="/">
                    <span className="font-bold text-lg">O.R.A.C.L.E</span>
                  </Link>
                </div>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navbarItems.filter(item => item.enabled !== false).map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href || "#"}
                    className="px-2 py-1 text-lg hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                {isLoggedIn && (
                  <Link 
                    href="/dashboard"
                    className="px-2 py-1 text-lg hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right aligned Authentication */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoggedIn ? (
            <ProfileDropdown />
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleSignIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="sm:block">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="sm:block">Sign in</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}