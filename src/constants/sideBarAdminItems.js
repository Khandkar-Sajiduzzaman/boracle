import { Home,Sigma,Star,ChevronsLeftRightEllipsis,Hammer, Settings, BookOpen, Users } from "lucide-react"

const sidebarAdminGroups = [
    {
        label: "Admin",
        items: [
            {
                title: 'Manage Users',
                href: '/dashboard/manage-users',
                description: 'Delete, Edit, Update or Promote Users',
                icon: Home,
                enabled: true,
                forAdminOnly: true
            },
            {
                title: 'Data Import',
                href: '/dashboard/data-import',
                description: 'Import data from various sources',
                icon: Users,
                enabled: true,
                forAdminOnly: true
            }
        ]
    },
    {
        label: "Moderation",
        items: [
            {
                title: 'Posts',
                href: '/dashboard/manage-posts',
                description: 'Manage and moderate pending and approved posts from users',
                icon: Sigma,
                enabled: true,
                forAdminOnly: false
            }
        ]
    },

]

export default sidebarAdminGroups;