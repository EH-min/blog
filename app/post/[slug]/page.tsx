import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Tag, FolderOpen } from 'lucide-react';
import { getPostBySlug } from '@/services/postService';
import { ProfileCard } from '@/components/ProfileCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft size={16} />
          <span className="font-medium">Back to list</span>
        </Link>
      </div>

      {/* Header Info */}
      <header className="mb-10">
        {post.seriesName && (
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
              <FolderOpen size={14} />
              <span>{post.seriesName}</span>
            </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>@Ohzzi</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {post.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Divider */}
      <hr className="border-gray-200 dark:border-gray-800 mb-10" />

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:border dark:prose-pre:border-gray-800">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Footer / Navigation */}
      <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800">
        <ProfileCard />
      </div>
    </article>
  );
}
