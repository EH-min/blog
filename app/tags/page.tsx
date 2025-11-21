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

      {/* Tag Cloud */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ name, count }) => {
            // 개수에 따라 크기 조정 (최소 1, 최대 5)
            const maxCount = Math.max(...tags.map((t) => t.count));
            const minCount = Math.min(...tags.map((t) => t.count));
            const scale = maxCount > minCount 
              ? 1 + ((count - minCount) / (maxCount - minCount)) * 1.5
              : 1;

            return (
              <Link
                key={name}
                href={`/tags/${encodeURIComponent(name)}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full 
                  bg-gray-100 dark:bg-gray-800 
                  hover:bg-blue-500 hover:text-white 
                  dark:hover:bg-blue-500 dark:hover:text-white
                  transition-all duration-200 hover:shadow-md hover:scale-105"
                style={{ 
                  fontSize: `${scale}rem`,
                }}
              >
                <Tag size={14} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-white">
                  {name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-600 group-hover:text-white">
                  {count}
                </span>
              </Link>
            );
          })}
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
