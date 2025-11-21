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
        >
          <Link
            href={`/post/${prev.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <ChevronLeft size={16} />
              <span>이전 글</span>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {prev.title}
            </h3>
          </Link>
        </motion.div>
      ) : (
        <div></div>
      )}

      {/* 다음 글 */}
      {next && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/post/${next.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md text-right"
          >
            <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>다음 글</span>
              <ChevronRight size={16} />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {next.title}
            </h3>
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
