"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Vote } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // 2. Fetch Data
  useEffect(() => {
    if (user) {
      api.fetchElections().then((data) => {
        setElections(data);
        setDataLoading(false);
      });
    }
  }, [user]);

  // Prevent flash while checking auth
  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Active Elections</h1>
          <p className="text-slate-500">
            View available elections and cast your vote on the blockchain.
          </p>
        </div>

        {dataLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <Card key={election.id} className={`flex flex-col transition-shadow hover:shadow-lg ${!election.is_active && 'opacity-70'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant={election.is_active ? "default" : "secondary"}>
                      {election.is_active ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-xl">{election.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{election.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ends: {new Date(election.end_time).toLocaleDateString()}
                  </div>

                  <div className="space-y-2">
                     <p className="text-xs font-semibold uppercase text-slate-400">Candidates</p>
                     {election.candidates.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2 rounded bg-slate-100/50 border">
                           <span className="text-sm font-medium">{c.name}</span>
                           {election.is_active && <Vote className="h-4 w-4 text-slate-400" />}
                        </div>
                     ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" disabled={!election.is_active} asChild>
                    <Link href={`/elections/${election.id}`}>
                      {election.is_active ? "Cast Vote" : "View Results"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}