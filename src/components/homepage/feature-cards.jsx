// add description
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
  } from "@/components/ui/card"

import featureList from "@/constants/featureList"

export default function FeatureCards() {
 
    return (
        <div className="flex flex-wrap justify-center gap-6">
            {featureList.map((feature) => (
                <Card 
                    className="dark:!bg-blue-950 h-[280px] w-[220px] flex flex-col" 
                    key={feature.index}
                >
                    <CardHeader className="text-center pb-2">
                        <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center flex-grow flex flex-col justify-center pt-0">
                        <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-2 w-full justify-center">
                        <span className="text-sm text-gray-400">{feature.footer}</span>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
    
}