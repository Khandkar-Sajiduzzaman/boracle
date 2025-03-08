"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function ProfileDropdown() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
          <img
            src={session.user.image}
            alt="Profile Picture"
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-blue-800 hover:ring-2 hover:ring-blue-500/50 hover:ring-offset-2 hover:ring-offset-background transition-all duration-300 shadow-lg shadow-blue-500/20"
          />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
      <Link href="/dashboard">
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/account-settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}