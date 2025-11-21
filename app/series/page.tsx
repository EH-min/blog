import Link from 'next/link';
import { FolderOpen, FileText } from 'lucide-react';
import { getAllSeries } from '@/services/postService';

export default async function SeriesPage() {
  const series = await getAllSeries();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen size={32} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            시리즈
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          총 <span className="font-bold text-blue-600 dark:text-blue-400">{series.length}</span>개의 시리즈가 있습니다.
        </p>
      </header>

      {/* Series Grid */}
      {series.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {series.map(({ name, count }) => (
            <Link
              key={name}
              href={`/series/${encodeURIComponent(name)}`}
              className="group block p-6 rounded-lg border-2 border-gray-200 dark:border-gray-800 
                hover:border-blue-500 dark:hover:border-blue-500 
                hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 transition-colors">
                  <FolderOpen size={24} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText size={14} />
                    <span>{count}개의 글</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">아직 시리즈가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
