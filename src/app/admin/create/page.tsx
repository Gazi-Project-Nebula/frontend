"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plus, Trash2, Loader2 } from "lucide-react";

export default function CreateElectionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Dynamic Candidates State
  const [candidates, setCandidates] = useState<string[]>(["", ""]); // Start with 2 empty slots
  const [submitting, setSubmitting] = useState(false);

  // Auth Check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") router.push("/");
    }
  }, [user, authLoading, router]);

  // Handlers for dynamic candidates
  const handleCandidateChange = (index: number, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    setCandidates(newCandidates);
  };

  const addCandidateSlot = () => {
    setCandidates([...candidates, ""]);
  };

  const removeCandidateSlot = (index: number) => {
    const newCandidates = candidates.filter((_, i) => i !== index);
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic Validation
    const validCandidates = candidates.filter(c => c.trim() !== "");
    if (validCandidates.length < 2) {
      alert("Please provide at least 2 candidates.");
      return;
    }

    setSubmitting(true);
    
    await api.createElection(
      title,
      description,
      new Date(endDate).toISOString(),
      validCandidates,
      user.id
    );

    setSubmitting(false);
    router.push("/admin"); // Redirect back to admin dashboard
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <main className="container mx-auto p-4 max-w-2xl mt-4">
        <Button variant="ghost" className="mb-4 pl-0 text-slate-500" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Election</CardTitle>
            <CardDescription>Set up a new vote and define the candidates.</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="title">Election Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Class President 2025" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="Short description of this election" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">End Date & Time</Label>
                <Input 
                  id="date" 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required 
                />
              </div>

              {/* Dynamic Candidates */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Candidates</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCandidateSlot}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
                
                {candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder={`Candidate Name #${index + 1}`}
                      value={candidate}
                      onChange={(e) => handleCandidateChange(index, e.target.value)}
                      required={index < 2} // Require at least the first 2
                    />
                    {candidates.length > 2 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeCandidateSlot(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Election"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}