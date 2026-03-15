import apiClient from './apiClient';

// ---- Auth ----
export async function loginUser(email, password) {
  const { data } = await apiClient.post('/login/', { email, password });
  return data;
}

export async function registerUser(name, email, password) {
  const { data } = await apiClient.post('/register/', { name, email, password });
  return data;
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/profile/');
  return data;
}

// ---- Modules ----
export async function fetchModules() {
  const { data } = await apiClient.get('/modules/');
  return data;
}

// ---- Questions ----
export async function fetchQuestions() {
  const { data } = await apiClient.get('/questions/');
  return data;
}

export async function fetchQuestionDetail(id) {
  const { data } = await apiClient.get(`/questions/${id}/`);
  return data;
}

export async function createQuestion({ title, description, moduleId }) {
  const { data } = await apiClient.post('/questions/', { title, description, moduleId });
  return data;
}

export async function createAnswer(questionId, { content }) {
  const { data } = await apiClient.post(`/questions/${questionId}/answer/`, { content });
  return data;
}

// ---- Votes ----
export async function voteQuestion(questionId, value) {
  const { data } = await apiClient.post(`/questions/${questionId}/vote/`, { value });
  return data;
}

export async function voteAnswer(answerId, value) {
  const { data } = await apiClient.post(`/answers/${answerId}/vote/`, { value });
  return data;
}

// ---- Sessions ----
export async function fetchSessions() {
  const { data } = await apiClient.get('/sessions/');
  return data;
}

export async function fetchSessionDetail(id) {
  const { data } = await apiClient.get(`/sessions/${id}/`);
  return data;
}

export async function createSession({ moduleId, chapter, date, timeSlot, maxParticipants }) {
  const { data } = await apiClient.post('/sessions/', { moduleId, chapter, date, timeSlot, maxParticipants });
  return data;
}

export async function joinSession(id) {
  const { data } = await apiClient.post(`/sessions/${id}/join/`);
  return data;
}

export async function leaveSession(id) {
  const { data } = await apiClient.post(`/sessions/${id}/leave/`);
  return data;
}

// ---- Notifications ----
export async function fetchNotifications() {
  const { data } = await apiClient.get('/notifications/');
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.patch(`/notifications/${id}/`, { isRead: true });
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.post('/notifications/read-all/');
  return data;
}

// ---- Planner ----
export async function fetchSuggestions(moduleId, timeSlots) {
  const { data } = await apiClient.post('/planner/suggest/', { moduleId, timeSlots });
  return data;
}

// ---- Resources ----
export async function fetchResources() {
  const { data } = await apiClient.get('/resources/');
  return data;
}
