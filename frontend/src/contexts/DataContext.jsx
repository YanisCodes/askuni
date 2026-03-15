import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TIME_SLOTS } from '../data/constants';
import {
  fetchModules,
  fetchResources,
  fetchQuestions,
  fetchQuestionDetail,
  fetchSessions,
  fetchSessionDetail,
  createQuestion,
  createAnswer,
  createSession,
  joinSession as apiJoinSession,
  leaveSession as apiLeaveSession,
  voteQuestion,
  voteAnswer,
} from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const DataContext = createContext(null);

export function useData() {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchModules().then(setModules).catch(() => {});
      fetchResources().then(setResources).catch(() => {});
      fetchQuestions().then(setQuestions).catch(() => {});
      fetchSessions().then(setSessions).catch(() => {});
    }
  }, [isAuthenticated]);

  const refreshQuestions = useCallback(async () => {
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch { /* */ }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch { /* */ }
  }, []);

  const addQuestion = useCallback(async ({ title, description, moduleId }) => {
    const newQuestion = await createQuestion({ title, description, moduleId });
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  }, []);

  const addAnswer = useCallback(async (questionId, { content }) => {
    const newAnswer = await createAnswer(questionId, { content });
    // Refresh notifications since backend auto-creates them
    refreshNotifications();
    return newAnswer;
  }, [refreshNotifications]);

  const addSession = useCallback(async ({ moduleId, chapter, date, timeSlot, maxParticipants }) => {
    const newSession = await createSession({ moduleId, chapter, date, timeSlot, maxParticipants });
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, []);

  const joinSessionAction = useCallback(async (sessionId) => {
    const updated = await apiJoinSession(sessionId);
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, participantIds: updated.participantIds } : s));
    refreshNotifications();
    return updated;
  }, [refreshNotifications]);

  const leaveSessionAction = useCallback(async (sessionId) => {
    const updated = await apiLeaveSession(sessionId);
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, participantIds: updated.participantIds } : s));
    return updated;
  }, []);

  const getQuestionWithDetails = useCallback(async (questionId) => {
    try {
      return await fetchQuestionDetail(questionId);
    } catch {
      return null;
    }
  }, []);

  const voteOnQuestion = useCallback(async (questionId, value) => {
    const result = await voteQuestion(questionId, value);
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, voteCount: result.voteCount, userVote: result.userVote }
          : q
      )
    );
    return result;
  }, []);

  const voteOnAnswer = useCallback(async (answerId, value) => {
    return await voteAnswer(answerId, value);
  }, []);

  const getSessionWithDetails = useCallback(async (sessionId) => {
    try {
      return await fetchSessionDetail(sessionId);
    } catch {
      return null;
    }
  }, []);

  const value = {
    questions,
    sessions,
    modules,
    resources,
    timeSlots: TIME_SLOTS,
    addQuestion,
    addAnswer,
    addSession,
    joinSession: joinSessionAction,
    leaveSession: leaveSessionAction,
    getQuestionWithDetails,
    getSessionWithDetails,
    refreshQuestions,
    refreshSessions,
    voteOnQuestion,
    voteOnAnswer,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
