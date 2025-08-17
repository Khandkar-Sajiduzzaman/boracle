import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
// import { dbConnect } from "@/lib/db"
import Service from "@/models/services"
import { CircleCheckBig, XCircle } from "lucide-react"

export default async function ServiceStatus() {
    let services = []
    try {
        // await dbConnect()
        // services = await Service.find({})
        services = []
        console.log("Services fetched:", services)
    } catch (error) {
        console.error("Failed to fetch services:", error)
    }

    if (services.length === 0) {
        return (
            <Card className="w-full max-w-md mx-auto">
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

    else {
        return (
            <Card className="w-full max-w-md mx-auto dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="text-center">Service Status</CardTitle>
                </CardHeader>
                <CardContent className={""}>
                    {services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-2 gap-2">
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

}