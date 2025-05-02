"use client"

import { Home,Sigma,Star,ChevronsLeftRightEllipsis,Calendar } from "lucide-react"

 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import navbarItems from "@/constants/sideBarItems"

export function AppSidebar() {

  return (
    <Sidebar >
      <SidebarContent className="dark:bg-slate-950">
        <SidebarGroup>
        <SidebarGroupLabel className="text-gray-200 text-md font-semibold">Applications</SidebarGroupLabel>
          <SidebarGroupContent >
            <SidebarMenu className="pt-3">
              {navbarItems.filter(item => item.enabled !== false).map((item,index) => (
                <SidebarMenuItem key={index} className="pt-1">
                  <SidebarMenuButton asChild isActive className="dark:bg-blue-950 rounded-sm ">
                    <a href={item.href || "#"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}