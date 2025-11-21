import Link from 'next/link';
import { Tag } from 'lucide-react';
import { getAllTags } from '@/services/postService';

// 동적 렌더링 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Tag size={32} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            태그
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          총 <span className="font-bold text-blue-600 dark:text-blue-400">{tags.length}</span>개의 태그가 있습니다.
        </p>
      </header>

      {/* Tag Grid */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ name, count }) => (
            <Link
              key={name}
              href={`/tags/${encodeURIComponent(name)}`}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full 
                bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                hover:border-blue-500 dark:hover:border-blue-500
                hover:text-blue-600 dark:hover:text-blue-400
                transition-all duration-200"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                #{name}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Tag size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">아직 태그가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
