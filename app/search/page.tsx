'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { searchPosts } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import type { Post } from '@/types';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // URL 파라미터 변경 시 검색 실행
  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [queryParam]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await searchPosts(searchQuery);
      setPosts(results);
    } catch (error) {
      console.error('검색 중 에러:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Search size={32} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            검색
          </h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="w-full px-6 py-4 pr-12 text-lg rounded-lg border-2 border-gray-200 dark:border-gray-800 
              bg-white dark:bg-gray-900 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-500
              focus:border-blue-500 dark:focus:border-blue-500 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
              transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
              text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Search size={24} />
            )}
          </button>
        </form>
      </header>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 size={48} className="mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">검색 중...</p>
        </div>
      ) : hasSearched ? (
        posts.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-blue-600 dark:text-blue-400">&quot;{queryParam}&quot;</span>에 대한 
                <span className="font-bold text-blue-600 dark:text-blue-400"> {posts.length}</span>개의 검색 결과
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              검색 결과가 없습니다
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              &quot;{queryParam}&quot;에 대한 결과를 찾을 수 없습니다.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            검색어를 입력하여 게시글을 찾아보세요.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
