import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  import Counts from "@/models/counts"
  import { dbConnect } from "@/lib/db"
  
  export default async function Stats() {
      await dbConnect()
      const count = await Counts.findOne({}) || {swapsPosted: 0, facultyReviews: 0, resourcesSubmitted:0}
      
      return (
          <>
              <div className="flex flex-wrap justify-center gap-6">
                  <Card className="w-64 dark:bg-blue-900 text-white">
                      <CardHeader>
                          <CardTitle className="text-center">Swaps Posted</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold">
                                {count.swapsPosted}

                          </span>
                      </CardContent>
                  </Card>
                  
                  <Card className="w-64 dark:bg-blue-900 text-white">
                      <CardHeader>
                          <CardTitle className="text-center">Faculty Reviews</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold">
                                {count.facultyReviews}

                          </span>
                      </CardContent>
                  </Card>
                  
                  <Card className="w-64 dark:bg-blue-900 text-white">
                      <CardHeader>
                          <CardTitle className="text-center">Resources Submitted</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold">
                                {count.resourcesSubmitted}
                          </span>
                      </CardContent>
                  </Card>
              </div>
              
          </>
      )
  }