import { Database, FileCheck2, Users } from "lucide-react";

const sidebarAdminGroups = [
        {
        label: "Moderation",
        items: [
            {
                title: 'Posts',
                href: '/dashboard/manage-posts',
                description: 'Manage and moderate pending and approved posts from users',
                icon: FileCheck2,
                enabled: true,
                forAdminOnly: false
            }
        ]
    },
    {
        label: "Admin",
        items: [
            {
                title: 'Manage Users',
                href: '/dashboard/manage-users',
                description: 'Delete, Edit, Update or Promote Users',
                icon: Users,
                enabled: true,
                forAdminOnly: true
            },
            {
                title: 'Data Import',
                href: '/dashboard/data-import',
                description: 'Import faculty and other data using CSV files',
                icon: Database,
                enabled: true,
                forAdminOnly: true
            }
        ]
    },


]

export default sidebarAdminGroups;