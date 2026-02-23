import { createContext, useContext, useState, useCallback } from 'react';
import {
  INITIAL_QUESTIONS,
  INITIAL_ANSWERS,
  INITIAL_SESSIONS,
  MODULES,
  RESOURCES,
  USERS,
  TIME_SLOTS,
} from '../data/mockData';
import {
  createQuestion,
  createAnswer,
  createSession,
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
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  const addQuestion = useCallback(({ title, description, moduleId }) => {
    const newQuestion = createQuestion({
      title,
      description,
      moduleId,
      authorId: user.id,
    });
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  }, [user]);

  const addAnswer = useCallback((questionId, { content }) => {
    const newAnswer = createAnswer({
      questionId,
      content,
      authorId: user.id,
    });
    setAnswers(prev => [newAnswer, ...prev]);

    const question = questions.find(q => q.id === questionId);
    if (question && question.authorId !== user.id) {
      addNotification(`${user.name} answered your question`, questionId);
    }

    return newAnswer;
  }, [user, questions, addNotification]);

  const addSession = useCallback(({ moduleId, chapter, date, timeSlot, maxParticipants }) => {
    const newSession = createSession({
      moduleId,
      chapter,
      date,
      timeSlot,
      maxParticipants,
      creatorId: user.id,
    });
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, [user]);

  const joinSession = useCallback((sessionId) => {
    setSessions(prev =>
      prev.map(session => {
        if (session.id !== sessionId) return session;
        if (session.participantIds.includes(user.id)) return session;
        if (session.participantIds.length >= session.maxParticipants) return session;
        return {
          ...session,
          participantIds: [...session.participantIds, user.id],
        };
      })
    );
  }, [user]);

  const leaveSession = useCallback((sessionId) => {
    setSessions(prev =>
      prev.map(session => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          participantIds: session.participantIds.filter(id => id !== user.id),
        };
      })
    );
  }, [user]);

  const getQuestionWithDetails = useCallback((questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;

    const author = USERS.find(u => u.id === question.authorId);
    const module = MODULES.find(m => m.id === question.moduleId);
    const questionAnswers = answers
      .filter(a => a.questionId === questionId)
      .map(answer => ({
        ...answer,
        author: USERS.find(u => u.id === answer.authorId),
      }));

    return {
      ...question,
      author,
      module,
      answers: questionAnswers,
    };
  }, [questions, answers]);

  const getSessionWithDetails = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const module = MODULES.find(m => m.id === session.moduleId);
    const creator = USERS.find(u => u.id === session.creatorId);
    const participants = session.participantIds
      .map(id => USERS.find(u => u.id === id))
      .filter(Boolean);

    return {
      ...session,
      module,
      creator,
      participants,
    };
  }, [sessions]);

  const value = {
    questions,
    answers,
    sessions,
    modules: MODULES,
    resources: RESOURCES,
    users: USERS,
    timeSlots: TIME_SLOTS,
    addQuestion,
    addAnswer,
    addSession,
    joinSession,
    leaveSession,
    getQuestionWithDetails,
    getSessionWithDetails,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
