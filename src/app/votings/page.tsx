"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns"; // Or use standard JS date if you prefer
import { Calendar, Users, Vote, LogOut, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- 1. TYPES ---

type UserTable = {
  id: number;
  username: string;
  password_hash: string; // In real app, never store plain text. This is for the mock.
  role: "admin" | "voter";
  created_at: string;
};

type ElectionTable = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_by: number;
};

type CandidateTable = {
  id: number;
  election_id: number;
  name: string;
  description: string;
};

type ElectionWithCandidates = ElectionTable & {
  candidates: CandidateTable[];
};

// --- 2. MOCK DATABASE ---

// MOCK USERS (The "Dictionary" for Login)
const mockUsersDB: UserTable[] = [
  {
    id: 1,
    username: "john_doe",
    password_hash: "password123", // The "correct" password for the mock
    role: "voter",
    created_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 2,
    username: "admin_jane",
    password_hash: "adminpass",
    role: "admin",
    created_at: "2023-01-01T12:00:00Z",
  },
];

const mockElectionsDB: ElectionTable[] = [
  {
    id: 1,
    title: "Student Council President 2024",
    description: "Cast your vote for the next student body president.",
    start_time: "2023-10-01T09:00:00Z",
    end_time: "2023-10-07T17:00:00Z",
    is_active: true,
    created_by: 2,
  },
  {
    id: 2,
    title: "Best Frontend Framework",
    description: "Community poll to decide the tech stack.",
    start_time: "2023-09-01T09:00:00Z",
    end_time: "2023-09-02T17:00:00Z",
    is_active: false,
    created_by: 2,
  },
];

const mockCandidatesDB: CandidateTable[] = [
  { id: 1, election_id: 1, name: "Alice Johnson", description: "Better cafeteria food." },
  { id: 2, election_id: 1, name: "Bob Smith", description: "Sports equipment upgrades." },
  { id: 3, election_id: 2, name: "React", description: "UI Library." },
  { id: 4, election_id: 2, name: "Vue", description: "Progressive Framework." },
];

// --- 3. SIMULATED BACKEND REQUESTS ---

// Simulate Login Request
async function mockLogin(username: string, password: string): Promise<UserTable | null> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake 1s delay
  
  const user = mockUsersDB.find(
    (u) => u.username === username && u.password_hash === password
  );
  
  return user || null;
}

// Simulate Fetching Data
async function fetchActiveVotings(): Promise<ElectionWithCandidates[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return mockElectionsDB.map((election) => ({
    ...election,
    candidates: mockCandidatesDB.filter((c) => c.election_id === election.id),
  }));
}

// --- 4. SUB-COMPONENTS ---

function LoginForm({ onLogin }: { onLogin: (user: UserTable) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await mockLogin(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the voting booth
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  placeholder="john_doe"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            {/* Helper text for demo purposes */}
            <div className="text-xs text-slate-400 text-center pt-2">
              <p>Demo User: <b>john_doe</b> / <b>password123</b></p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function Dashboard({ user, onLogout }: { user: UserTable; onLogout: () => void }) {
  const [data, setData] = useState<ElectionWithCandidates[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchActiveVotings();
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              SecureVote
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Election Cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((election) => (
              <Card key={election.id} className={`flex flex-col hover:shadow-md transition-all ${!election.is_active ? 'opacity-75 bg-slate-100' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between">
                    <Badge variant={election.is_active ? "default" : "secondary"}>
                      {election.is_active ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{election.title}</CardTitle>
                  <CardDescription>{election.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ends: {format(new Date(election.end_time), "MMM d, yyyy")}
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-semibold">Candidates:</p>
                    {election.candidates.map((candidate) => (
                      <div key={candidate.id} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                        <span className="text-sm">{candidate.name}</span>
                        {election.is_active && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full">
                            <Vote className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={!election.is_active}>
                    {election.is_active ? "Vote Now" : "View Results"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 5. MAIN PAGE CONTROLLER ---

export default function VotingApp() {
  const [currentUser, setCurrentUser] = useState<UserTable | null>(null);

  // If no user, show Login. If user exists, show Dashboard.
  if (!currentUser) {
    return <LoginForm onLogin={(user) => setCurrentUser(user)} />;
  }

  return <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />;
}