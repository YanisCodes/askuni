import { useMemo } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getStudyRecommendations } from '../../services/api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import SessionCard from '../../components/sessions/SessionCard';
import RecommendationCard from '../../components/planner/RecommendationCard';

export default function PlannerResultPage() {
  const location = useLocation();
  const { sessions, modules, resources, users } = useData();

  if (!location.state) {
    return <Navigate to="/planner" replace />;
  }

  const { moduleId, timeSlots } = location.state;

  const moduleName = useMemo(() => {
    const mod = modules.find(m => m.id === moduleId);
    return mod?.name || 'Unknown';
  }, [modules, moduleId]);

  const { suggestedSessions, resource } = useMemo(() => {
    return getStudyRecommendations(moduleId, timeSlots, sessions, resources);
  }, [moduleId, timeSlots, sessions, resources]);

  const enrichedSessions = useMemo(() => {
    return suggestedSessions.map(session => {
      const module = modules.find(m => m.id === session.moduleId);
      const creator = users.find(u => u.id === session.creatorId);
      return {
        ...session,
        moduleName: module?.name || 'Unknown',
        creatorName: creator?.name || 'Unknown',
        participantCount: session.participantIds.length,
      };
    });
  }, [suggestedSessions, modules, users]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Recommendations for {moduleName}
      </h1>
      <p className="text-gray-600 mb-6">
        Based on your selected time slots: {timeSlots.join(', ')}
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Matching Study Sessions
        </h2>
        {enrichedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={48} />}
            title="No matching sessions found"
            description="No study sessions match your module and time slots."
            action={
              <Link to="/sessions/create">
                <Button>Create a Session</Button>
              </Link>
            }
          />
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Resources
        </h2>
        {resource ? (
          <RecommendationCard resource={resource} moduleName={moduleName} />
        ) : (
          <p className="text-sm text-gray-500">
            No resources available for this module.
          </p>
        )}
      </section>

      <Link to="/planner">
        <Button variant="secondary">Back to Planner</Button>
      </Link>
    </div>
  );
}
