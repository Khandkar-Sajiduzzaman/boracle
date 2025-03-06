// add description
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import featureList from "@/constants/featureList"

export default function FeatureCards() {
 
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featureList.map((feature) => (
                <Card className={"dark:!bg-blue-950"} key={feature.index}>
                    <CardHeader className={"text-center "}>
                        <CardTitle >{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className={"text-center"}>
                        <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
    
}