export function loginUser(email, password, users) {
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  return user;
}

export function registerUser(name, email, password, users) {
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error("Email already registered");
  }
  return { id: Date.now(), name, email, avatar: null };
}

export function createQuestion({ title, description, moduleId, authorId }) {
  return {
    id: Date.now(),
    title,
    description,
    moduleId,
    authorId,
    createdAt: new Date().toISOString(),
  };
}

export function createAnswer({ questionId, content, authorId }) {
  return {
    id: Date.now(),
    questionId,
    content,
    authorId,
    createdAt: new Date().toISOString(),
  };
}

export function createSession({ moduleId, chapter, date, timeSlot, creatorId, maxParticipants }) {
  return {
    id: Date.now(),
    moduleId,
    chapter: chapter || "",
    date,
    timeSlot,
    creatorId,
    participantIds: [creatorId],
    maxParticipants: maxParticipants || 5,
  };
}

export function getStudyRecommendations(moduleId, selectedSlots, sessions, resources) {
  const suggestedSessions = sessions.filter(
    s => s.moduleId === moduleId && selectedSlots.includes(s.timeSlot)
  );
  const resource = resources.find(r => r.moduleId === moduleId) || null;
  return { suggestedSessions, resource };
}
