'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdjacentPost } from '@/services/postService';

interface PostNavigationProps {
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* 이전 글 */}
      {prev ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Link
            href={`/post/${prev.slug}`}
            className="group flex flex-col justify-center h-full p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <ChevronLeft size={16} />
              <span>Previous Post</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {prev.title}
            </h3>
          </Link>
        </motion.div>
      ) : (
        <div className="hidden md:block"></div>
      )}

      {/* 다음 글 */}
      {next && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Link
            href={`/post/${next.slug}`}
            className="group flex flex-col justify-center items-end text-right h-full p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span>Next Post</span>
              <ChevronRight size={16} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {next.title}
            </h3>
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
