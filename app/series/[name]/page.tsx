import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { getPostsBySeries } from '@/services/postService';
import { PostCard } from '@/components/PostCard';

// 동적 렌더링 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function SeriesPostsPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  const posts = await getPostsBySeries(decodedName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Link 
          href="/series" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">모든 시리즈</span>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FolderOpen size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {decodedName}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-bold text-blue-600 dark:text-blue-400">{posts.length}</span>개의 게시글
        </p>
      </header>

      {/* Posts Grid */}
      <div className="grid gap-6 grid-cols-1">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
