"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CircleCheckBig, XCircle } from "lucide-react"

export default function ServiceStatus() {
    const [servicesList, setServicesList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch("/api/services")
                const data = await res.json()
                if (data.success) {
                    setServicesList(data.servicesList)
                }
            } catch (error) {
                console.error("Failed to fetch services:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchServices()
    }, [])

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="text-center">Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-2">
                        <CardDescription>Loading...</CardDescription>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (servicesList.length === 0) {
        return (
            <Card className="w-full max-w-md mx-auto dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="text-center">Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <CardDescription>
                            No services found or failed to load
                        </CardDescription>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto dark:bg-blue-950">
            <CardHeader>
                <CardTitle className="text-center">Service Status</CardTitle>
            </CardHeader>
            <CardContent className={""}>
                {servicesList.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 gap-2">
                        <div className="flex items-center gap-2">
                            {service.isActive ? (
                                <CircleCheckBig className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="font-semibold dark:text-white">
                                {service.title}
                            </div>
                        </div>
                        <div className="text-sm dark:text-white ml-auto">
                            {service.message}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}