import { BookOpen } from 'lucide-react';
import Badge from '../common/Badge';

export default function RecommendationCard({ resource, moduleName }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 border-l-4 border-l-accent-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-accent-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{resource.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="green">{resource.type}</Badge>
            {moduleName && (
              <span className="text-xs text-gray-500">
                Recommended for {moduleName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
