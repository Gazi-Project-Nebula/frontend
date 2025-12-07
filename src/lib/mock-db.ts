// src/lib/mock-db.ts

// --- TYPES ---

export type User = {
  id: number;
  username: string;
  password_hash: string;
  role: "admin" | "voter";
  created_at: string;
};

export type Candidate = {
  id: number;
  election_id: number;
  name: string;
  description: string;
};

export type Election = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_by: number;
  candidates: Candidate[];
};

export type VotingToken = {
  id: number;
  election_id: number;
  user_id: number;
  token_hash: string;
  is_used: boolean;
  expires_at: string;
};

export type Vote = {
  id: number;
  election_id: number;
  candidate_id: number;
  vote_hash: string;
  prev_vote_hash: string;
  created_at: string;
};

// --- INITIAL DATA ---

// Users
const users: User[] = [
  { id: 1, username: "john_doe", password_hash: "123", role: "voter", created_at: new Date().toISOString() },
  { id: 2, username: "admin", password_hash: "admin", role: "admin", created_at: new Date().toISOString() },
];

// Elections
const elections: Election[] = [
  {
    id: 1,
    title: "Student Council 2024",
    description: "Vote for the next student body president.",
    start_time: "2023-10-01T09:00:00Z",
    end_time: "2025-12-30T17:00:00Z",
    is_active: true,
    created_by: 2,
    candidates: [
      { id: 1, election_id: 1, name: "Alice Johnson", description: "Better cafeteria food" },
      { id: 2, election_id: 1, name: "Bob Smith", description: "New sports equipment" },
    ],
  },
];

// Tokens (give john_doe a token for the existing election)
const votingTokens: VotingToken[] = [
  {
    id: 1,
    election_id: 1,
    user_id: 1,
    token_hash: "abc-token",
    is_used: false,
    expires_at: "2025-12-30T17:00:00Z",
  }
];

const votes: Vote[] = [];

// --- API ---

export const api = {
  login: async (username: string, password: string): Promise<User | null> => {
    await new Promise((r) => setTimeout(r, 500));
    return users.find((u) => u.username === username && u.password_hash === password) || null;
  },

  register: async (username: string, password: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, 500));
    const newUser: User = {
      id: users.length + 1,
      username,
      password_hash: password,
      role: "voter",
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  fetchElections: async (): Promise<Election[]> => {
    await new Promise((r) => setTimeout(r, 800));
    return elections;
  },

  fetchElectionById: async (id: number): Promise<Election | undefined> => {
    await new Promise((r) => setTimeout(r, 500));
    return elections.find((e) => e.id === id);
  },

  // --- NEW: Create Election Function ---
  createElection: async (
    title: string, 
    description: string, 
    endTime: string, 
    candidateNames: string[], 
    creatorId: number
  ): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));

    const newElectionId = elections.length + 1;
    
    // Create Candidates objects
    const newCandidates: Candidate[] = candidateNames.map((name, index) => ({
      id: Math.floor(Math.random() * 10000) + index,
      election_id: newElectionId,
      name: name,
      description: "Candidate for " + title
    }));

    const newElection: Election = {
      id: newElectionId,
      title,
      description,
      start_time: new Date().toISOString(),
      end_time: endTime,
      is_active: true,
      created_by: creatorId,
      candidates: newCandidates
    };

    elections.push(newElection);
    
    // Automatically generate tokens for all current users for testing
    users.forEach(u => {
      votingTokens.push({
        id: Math.floor(Math.random() * 10000),
        election_id: newElectionId,
        user_id: u.id,
        token_hash: `token-${u.id}-${newElectionId}`,
        is_used: false,
        expires_at: endTime
      });
    });

    return true;
  },

  castVote: async (electionId: number, candidateId: number, userId: number): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 1000));

    const token = votingTokens.find(t => t.election_id === electionId && t.user_id === userId);

    if (!token) return { success: false, message: "No voting token found." };
    if (token.is_used) return { success: false, message: "Token already used." };

    // Fake Hash Logic
    const prevHash = votes.length > 0 ? votes[votes.length - 1].vote_hash : "GENESIS";
    const newHash = "0x" + Math.random().toString(16).slice(2) + Date.now().toString();

    votes.push({
      id: votes.length + 1,
      election_id: electionId,
      candidate_id: candidateId,
      vote_hash: newHash,
      prev_vote_hash: prevHash,
      created_at: new Date().toISOString()
    });

    token.is_used = true;
    return { success: true, message: "Vote successfully cast." };
  },
};