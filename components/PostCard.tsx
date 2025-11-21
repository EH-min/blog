import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { FolderOpen } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="py-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg px-4 -mx-4">
        
        {/* Series Indicator */}
        {post.seriesName && (
          <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
            <FolderOpen size={12} />
            <span>{post.seriesName}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>

        {/* Date */}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-light">
           {date}
        </div>

        {/* Preview (Truncated Content) */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {post.content.replace(/[#*`]/g, '')}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
};
