import Link from 'next/link';
import { FolderOpen, FileText } from 'lucide-react';
import { getAllSeries } from '@/services/postService';

// 동적 렌더링 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        <div className="grid gap-4 md:grid-cols-2">
          {series.map(({ name, count }) => (
            <Link
              key={name}
              href={`/series/${encodeURIComponent(name)}`}
              className="group block p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400">
                  <FolderOpen size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                  {count} posts
                </span>
              </div>
              
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
              </h2>
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
