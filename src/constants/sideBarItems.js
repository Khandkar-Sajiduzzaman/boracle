import { Home,Sigma,Star,ChevronsLeftRightEllipsis,Hammer, Settings, BookOpen, Users } from "lucide-react"

const sidebarGroups = [
    {
        label: "Dashboard",
        items: [
            {
                title: 'Home',
                href: '/dashboard',
                description: 'Dashboard overview with your latest activity and statistics',
                icon: Home,
                enabled: true
            }
        ]
    },
    {
        label: "Academic",
        items: [
            {
                title: 'PrePreReg',
                href: '/dashboard/preprereg',
                description: 'The PrePreReg we love is now in Oracle! Build your routine with ease and get the best possible schedule based on live data',
                icon: Hammer,
                enabled: true
            },
            {
                title: 'Swap',
                href: '/dashboard/swap',
                description: 'A centralized platform to swap courses with other students. No more endless emails and waiting for replies!',
                icon: ChevronsLeftRightEllipsis,
                enabled: true
            },
            {
                title: "Seat Status",
                href: '/dashboard/seat-status',
                description: 'Get live updates on seat status for all courses. No more countless refreshes to know if you got in or not!',
                icon: Sigma,
                enabled: true
            }
        ]
    },
    {
        label: "Community",
        items: [
            {
                title: 'Faculty Reviews',
                href: '/dashboard/faculty-review',
                description: 'Rate your faculty and provide feedback. Scrolling through useless reviews is a thing of the past!',
                icon: Star,
                enabled: true
            },
            {
                title: 'Course Materials',
                href: '/dashboard/materials',
                description: 'Access and share course materials with your peers',
                icon: BookOpen,
                enabled: true
            }
        ]
    },
    // {
    //     label: "Settings",
    //     items: [
    //         {
    //             title: 'Settings',
    //             href: '/dashboard/settings',
    //             description: 'Manage your account and application preferences',
    //             icon: Settings,
    //             enabled: true
    //         }
    //     ]
    // }
]

export default sidebarGroups;