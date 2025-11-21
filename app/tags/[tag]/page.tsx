import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Tag } from 'lucide-react';
import { getPostsByTag } from '@/services/postService';
import { PostCard } from '@/components/PostCard';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPostsPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const posts = await getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Link 
          href="/tags" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">모든 태그</span>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Tag size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {decodedTag}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-bold text-blue-600 dark:text-blue-400">{posts.length}</span>개의 게시글
        </p>
      </header>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
