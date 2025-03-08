"use client"

import * as React from "react"
import navbarItems from "./navbarItems"
import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils"

export default function NavigationBar() {
  
  return (
    <div className="relative border-b">
      <div className="flex justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            {navbarItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <Link href={item.href || "#"} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  )
}