"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // <--- Import useParams
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export default function ElectionDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // FIX: Use the hook to get the ID safely in Next.js 16
  const params = useParams(); 
  const electionIdString = params?.id as string; // safe cast
  const electionId = parseInt(electionIdString);

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // 1. Auth Check
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  // 2. Fetch Data
  useEffect(() => {
    // Only fetch if we have a valid ID and user
    if (user && !isNaN(electionId)) {
      api.fetchElectionById(electionId).then((data) => {
        setElection(data || null);
        setLoading(false);
      });
    } else if (!isNaN(electionId) === false) {
       // Handle case where ID is missing or invalid
       setLoading(false);
    }
  }, [user, electionId]);

  const handleVote = async () => {
    if (!selectedCandidate || !election) return;
    
    setSubmitting(true);
    await api.castVote(election.id, selectedCandidate);
    setSubmitting(false);
    setVoteSuccess(true);
  };

  // --- RENDERING ---

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto p-4 max-w-2xl mt-8 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-8 mt-10 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Election Not Found</h1>
          <p className="text-slate-500 mb-6">We couldn't find an election with ID #{electionIdString}.</p>
          <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md text-center p-6 border-green-200 bg-green-50 shadow-lg animate-in fade-in zoom-in duration-300">
            <CardContent className="pt-6 space-y-4">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-900">Vote Confirmed!</h2>
              <p className="text-green-800/80">
                Your vote for this election has been securely recorded on the simulated blockchain.
              </p>
              <div className="pt-4">
                <Button onClick={() => router.push("/")} className="w-full bg-green-600 hover:bg-green-700">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <main className="container mx-auto p-4 max-w-3xl mt-4">
        <Button variant="ghost" className="mb-4 pl-0 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {election.id}</span>
               {!election.is_active && <span className="text-xs font-bold text-red-500 border border-red-200 px-2 py-1 rounded bg-red-50">CLOSED</span>}
            </div>
            <CardTitle className="text-2xl md:text-3xl">{election.title}</CardTitle>
            <CardDescription className="text-base mt-2">{election.description}</CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-slate-800">Select a Candidate</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {election.candidates.map((candidate) => {
                const isSelected = selectedCandidate === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => election.is_active && setSelectedCandidate(candidate.id)}
                    className={`
                      relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${!election.is_active ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-blue-300 hover:bg-blue-50/50'}
                      ${isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm' : 'border-slate-200 bg-white'}
                    `}
                  >
                    <div className={`
                      h-6 w-6 rounded-full border flex-shrink-0 mr-4 flex items-center justify-center transition-colors
                      ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}
                    `}>
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {candidate.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {candidate.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-slate-50/50 rounded-b-lg">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1"/> Verified Election</span>
              <span>256-bit Encryption</span>
            </div>
            <Button 
              size="lg" 
              className="w-full text-lg h-12 shadow-md" 
              onClick={handleVote}
              disabled={!selectedCandidate || submitting || !election.is_active}
            >
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {submitting ? "Recording Vote..." : "Confirm My Vote"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}