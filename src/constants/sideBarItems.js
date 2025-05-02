import { Home,Sigma,Star,ChevronsLeftRightEllipsis,Hammer } from "lucide-react"

const navbarItems = [
    {
        title: 'Home',
        href: '/',
        description: 'The PrePreReg we love is now in Oracle! Build your routine with ease and get the best possible schedule based on live data',
        icon: Home,
        enabled: true
    },
    {
        title: 'PrePreReg',
        href: '/preprereg',
        description: 'The PrePreReg we love is now in Oracle! Build your routine with ease and get the best possible schedule based on live data',
        icon: Hammer,
        enabled: true
    },
    {
        title: 'Swap',
        href: '/swap',
        description: 'A centralized platform to swap courses with other students. No more endless emails and waiting for replies!',
        icon: ChevronsLeftRightEllipsis,
        enabled: true
    },
    {
        title: 'Review',
        href: '/faculty-review',
        description: 'Rate your faculty and provide feedback. Scrolling through useless reviews is a thing of the past!',
        icon: Star,
        enabled: false
    },
    {
        title: "Seat Status",
        href: '/seat-status',
        description: 'Get live updates on seat status for all courses. No more countless refreshes to know if you got in or not!',
        icon: Sigma,
        enabled: true
    }
]

export default navbarItems;