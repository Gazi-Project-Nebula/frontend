"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, BarChart3, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "admin") {
        router.push("/"); // Redirect if not admin
      } else {
        api.fetchElections().then(setElections);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto p-6 max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">Manage elections and view statistics.</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/admin/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Election
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Election Management</CardTitle>
              <CardDescription>List of all elections created in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {elections.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No elections found.</p>
              ) : (
                <div className="space-y-4">
                  {elections.map((election) => (
                    <div 
                      key={election.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{election.title}</h3>
                          <Badge variant={election.is_active ? "default" : "secondary"}>
                            {election.is_active ? "Active" : "Closed"}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          Ends: {new Date(election.end_time).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/elections/${election.id}`}>
                            View Page
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" className="cursor-not-allowed opacity-70">
                          <BarChart3 className="mr-2 h-3 w-3" />
                          Results
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}