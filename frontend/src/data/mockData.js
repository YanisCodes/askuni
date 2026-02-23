export const MODULES = [
  { id: 1, name: "Data Structures", code: "CS201" },
  { id: 2, name: "Web Development", code: "CS301" },
  { id: 3, name: "Database Systems", code: "CS202" },
  { id: 4, name: "Operating Systems", code: "CS303" },
  { id: 5, name: "Algorithms", code: "CS204" },
  { id: 6, name: "Software Engineering", code: "CS401" },
];

export const USERS = [
  { id: 1, name: "Ahmed Bensalem", email: "ahmed@uni.dz", avatar: null },
  { id: 2, name: "Sara Medjdoub", email: "sara@uni.dz", avatar: null },
  { id: 3, name: "Youcef Khaldi", email: "youcef@uni.dz", avatar: null },
];

export const INITIAL_QUESTIONS = [
  {
    id: 1,
    title: "How does a binary search tree maintain balance?",
    description:
      "I understand basic BST insertion but I'm confused about how AVL trees perform rotations to stay balanced. Can someone explain single and double rotations with examples?",
    moduleId: 1,
    authorId: 1,
    createdAt: "2026-02-10T10:30:00Z",
  },
  {
    id: 2,
    title: "What is the difference between REST and GraphQL?",
    description:
      "I've been building APIs with REST but heard GraphQL is better for complex queries. When should I choose one over the other? What are the trade-offs in terms of performance and caching?",
    moduleId: 2,
    authorId: 2,
    createdAt: "2026-02-11T14:15:00Z",
  },
  {
    id: 3,
    title: "How does normalization reduce data redundancy?",
    description:
      "I'm studying database normalization and I understand 1NF and 2NF, but I'm struggling with understanding when to apply 3NF vs BCNF. Can someone clarify the differences?",
    moduleId: 3,
    authorId: 3,
    createdAt: "2026-02-12T09:00:00Z",
  },
  {
    id: 4,
    title: "What is the difference between a process and a thread?",
    description:
      "I know both are units of execution, but I'm confused about memory sharing and context switching overhead. When would you use multithreading vs multiprocessing?",
    moduleId: 4,
    authorId: 1,
    createdAt: "2026-02-13T16:45:00Z",
  },
  {
    id: 5,
    title: "When should I use dynamic programming over greedy algorithms?",
    description:
      "Both approaches seem to work for optimization problems. How do I identify if a problem has optimal substructure and overlapping subproblems? Are there common patterns to look for?",
    moduleId: 5,
    authorId: 2,
    createdAt: "2026-02-14T11:20:00Z",
  },
  {
    id: 6,
    title: "What are the key principles of SOLID design?",
    description:
      "I've read about SOLID principles but I'm having trouble applying them in real projects. Could someone give practical examples of each principle, especially the Dependency Inversion Principle?",
    moduleId: 6,
    authorId: 3,
    createdAt: "2026-02-15T08:30:00Z",
  },
];

export const INITIAL_ANSWERS = [
  {
    id: 1,
    questionId: 1,
    content:
      "AVL trees use rotation operations to rebalance after each insertion or deletion. A single rotation (left or right) handles cases where the imbalance is on one side, while double rotations (left-right or right-left) handle zig-zag patterns. The key is that the balance factor of each node must stay between -1 and 1.",
    authorId: 2,
    createdAt: "2026-02-10T12:00:00Z",
  },
  {
    id: 2,
    questionId: 2,
    content:
      "REST is great for simple CRUD operations with well-defined resources. GraphQL shines when your frontend needs flexible queries across multiple related entities. REST is easier to cache but can lead to over-fetching or under-fetching data. Choose GraphQL when you have complex, nested data requirements.",
    authorId: 3,
    createdAt: "2026-02-11T16:30:00Z",
  },
  {
    id: 3,
    questionId: 3,
    content:
      "3NF eliminates transitive dependencies, meaning no non-key attribute should depend on another non-key attribute. BCNF is stricter and requires that every determinant is a candidate key. In practice, 3NF is sufficient for most applications, but BCNF might be needed for tables with multiple composite candidate keys.",
    authorId: 1,
    createdAt: "2026-02-12T11:45:00Z",
  },
  {
    id: 4,
    questionId: 4,
    content:
      "Processes have their own memory space and are isolated from each other, while threads within the same process share memory. Thread context switching is faster but shared memory requires careful synchronization. Use multithreading for I/O-bound tasks and multiprocessing for CPU-bound tasks that need true parallelism.",
    authorId: 3,
    createdAt: "2026-02-14T09:15:00Z",
  },
  {
    id: 5,
    questionId: 5,
    content:
      "Use DP when a problem has overlapping subproblems, meaning you solve the same subproblem multiple times. Greedy works when the locally optimal choice always leads to a globally optimal solution. A good test: if you can solve the problem by making one pass without reconsidering past choices, greedy works. Otherwise, try DP.",
    authorId: 1,
    createdAt: "2026-02-14T15:00:00Z",
  },
];

export const INITIAL_SESSIONS = [
  {
    id: 1,
    moduleId: 2,
    chapter: "React Hooks",
    date: "2026-02-25",
    timeSlot: "14:00 - 16:00",
    creatorId: 1,
    participantIds: [1, 2],
    maxParticipants: 5,
  },
  {
    id: 2,
    moduleId: 1,
    chapter: "Trees and Graphs",
    date: "2026-02-26",
    timeSlot: "10:00 - 12:00",
    creatorId: 2,
    participantIds: [2, 3],
    maxParticipants: 4,
  },
  {
    id: 3,
    moduleId: 3,
    chapter: "SQL Joins",
    date: "2026-02-28",
    timeSlot: "16:00 - 18:00",
    creatorId: 3,
    participantIds: [3],
    maxParticipants: 6,
  },
  {
    id: 4,
    moduleId: 5,
    chapter: "Sorting Algorithms",
    date: "2026-03-02",
    timeSlot: "08:00 - 10:00",
    creatorId: 1,
    participantIds: [1, 2, 3],
    maxParticipants: 5,
  },
];

export const RESOURCES = [
  { id: 1, moduleId: 1, title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", type: "book" },
  { id: 2, moduleId: 2, title: "Eloquent JavaScript", author: "Marijn Haverbeke", type: "book" },
  { id: 3, moduleId: 3, title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", type: "book" },
  { id: 4, moduleId: 4, title: "Operating System Concepts", author: "Silberschatz, Galvin, Gagne", type: "book" },
  { id: 5, moduleId: 5, title: "The Algorithm Design Manual", author: "Steven Skiena", type: "book" },
  { id: 6, moduleId: 6, title: "Clean Code", author: "Robert C. Martin", type: "book" },
];

export const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
];
