"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter, Plus, Calendar, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

export default function PrePreRegPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-slate-800 p-6">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-6 bg-slate-700" />
                    <div className="flex gap-4 mb-6">
                        <Skeleton className="h-10 flex-1 bg-slate-700" />
                        <Skeleton className="h-10 w-32 bg-slate-700" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full bg-slate-700" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full min-h-screen bg-slate-800 p-6 flex items-center justify-center">
                <Card className="p-6 bg-slate-700 border-slate-600">
                    <CardContent>
                        <p className="text-red-400">Error: {error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { routineData, timeSlots, days } = generateRoutineTable()

    return (
        <div className="w-full min-h-screen bg-slate-800">PrePreReg Dashboard</div>

    )
}
