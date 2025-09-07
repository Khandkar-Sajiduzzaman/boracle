import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  import Counts from "@/models/counts"
//   import { dbConnect } from "@/lib/db"
  
  export default async function Stats() {
    //   await dbConnect()
      const count =  {swapsPosted: 0, facultyReviews: 0, resourcesSubmitted:0}
      
      return (
          <>
              <div className="flex flex-wrap justify-center gap-6">
                  <Card className="w-64 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 dark:text-blue-300">
                      <CardHeader>
                          <CardTitle className="text-center">Swaps Posted</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold dark:text-blue-200">
                                {count.swapsPosted}

                          </span>
                      </CardContent>
                  </Card>
                  
                  <Card className="w-64 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 dark:text-blue-300">
                      <CardHeader>
                          <CardTitle className="text-center">Faculty Reviews</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold dark:text-blue-200">
                                {count.facultyReviews}

                          </span>
                      </CardContent>
                  </Card>
                  
                  <Card className="w-64 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 dark:text-blue-300">
                      <CardHeader>
                          <CardTitle className="text-center">Resources Submitted</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                          <span className="text-4xl font-bold dark:text-blue-200">
                                {count.resourcesSubmitted}
                          </span>
                      </CardContent>
                  </Card>
              </div>
              
          </>
      )
  }