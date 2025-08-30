"use client"

import { Home,Sigma,Star,ChevronsLeftRightEllipsis,Calendar, Settings, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar"
import navbarItems from "@/constants/sideBarItems"

export function AppSidebar() {
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-800 group-data-[collapsible=icon]:px-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">O.R.A.C.L.E</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">BRACU Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-gray-950 px-2 py-4 group-data-[collapsible=icon]:px-5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navbarItems.filter(item => item.enabled !== false).map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton 
                    asChild 
                    className="w-full hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 rounded-lg px-3 py-2.5 transition-all duration-200 group data-[active=true]:bg-blue-600 data-[active=true]:text-white dark:data-[active=true]:bg-blue-600 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                    tooltip={item.title}
                  >
                    <a href={item.href || "#"} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0 group-data-[active=true]:text-white" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Settings in main menu
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="w-full hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 rounded-lg px-3 py-2.5 transition-all duration-200 group data-[active=true]:bg-blue-600 data-[active=true]:text-white dark:data-[active=true]:bg-blue-600 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                  tooltip="Settings"
                >
                  <a href="/settings" className="flex items-center gap-3">
                    <Settings className="h-5 w-5 shrink-0 group-data-[active=true]:text-white" />
                    <span className="font-medium text-sm">Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 group-data-[collapsible=icon]:px-2">
        {session?.user && (
          <div className="space-y-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-xs">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <SidebarMenuButton 
              onClick={() => signOut()}
              className="w-full hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-300 rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              tooltip="Sign Out"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">Sign Out</span>
              </div>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}