// src/lib/mock-db.ts

export type User = {
  id: number;
  username: string;
  password_hash: string;
  role: "admin" | "voter";
};

export type Election = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  candidates: Candidate[];
};

export type Candidate = {
  id: number;
  name: string;
  description: string;
};

// --- INITIAL DATA ---

let users: User[] = [
  { id: 1, username: "john_doe", password_hash: "123", role: "voter" },
  { id: 2, username: "admin", password_hash: "admin", role: "admin" },
];

const elections: Election[] = [
  {
    id: 1,
    title: "Student Council 2024",
    description: "Vote for the next student body president.",
    start_time: "2023-10-01T09:00:00Z",
    end_time: "2023-10-07T17:00:00Z",
    is_active: true,
    candidates: [
      { id: 1, name: "Alice Johnson", description: "Better cafeteria food" },
      { id: 2, name: "Bob Smith", description: "New sports equipment" },
    ],
  },
  {
    id: 2,
    title: "Tech Stack Selection",
    description: "Choose the framework for the new project.",
    start_time: "2023-09-01T09:00:00Z",
    end_time: "2023-09-02T17:00:00Z",
    is_active: false,
    candidates: [
      { id: 3, name: "React", description: "Meta's UI library" },
      { id: 4, name: "Vue", description: "Progressive framework" },
    ],
  },
];

// --- SIMULATED API CALLS ---

export const api = {
  login: async (username: string, password: string): Promise<User | null> => {
    await new Promise((r) => setTimeout(r, 800)); // Fake delay
    return users.find((u) => u.username === username && u.password_hash === password) || null;
  },

  register: async (username: string, password: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser: User = {
      id: users.length + 1,
      username,
      password_hash: password,
      role: "voter",
    };
    users.push(newUser);
    return newUser;
  },

  fetchElections: async (): Promise<Election[]> => {
    await new Promise((r) => setTimeout(r, 1200));
    return elections;
  },

  // --- NEW FUNCTIONS BELOW ---

  fetchElectionById: async (id: number): Promise<Election | undefined> => {
    await new Promise((r) => setTimeout(r, 800));
    return elections.find((e) => e.id === id);
  },

  castVote: async (electionId: number, candidateId: number): Promise<boolean> => {
    console.log(`Vote cast for Candidate ${candidateId} in Election ${electionId}`);
    // Simulate network/blockchain delay
    await new Promise((r) => setTimeout(r, 1500));
    return true;
  },
};