import { BookOpen } from 'lucide-react';
import Badge from '../common/Badge';

export default function RecommendationCard({ resource, moduleName }) {
  return (
    <div className="glass rounded-2xl p-5 border-l-4 border-l-emerald-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{resource.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{resource.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="green">{resource.type}</Badge>
            {moduleName && (
              <span className="text-xs text-slate-400">
                Recommended for {moduleName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
