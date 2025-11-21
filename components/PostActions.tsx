'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { deletePost } from '@/services/postService';

interface PostActionsProps {
  slug: string;
}

export function PostActions({ slug }: PostActionsProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleEdit = () => {
    router.push(`/write?slug=${slug}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(slug);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('게시글 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={handleEdit}
        className="flex items-center gap-2 px-4 py-2 rounded-lg
          bg-blue-100 dark:bg-blue-900/30 
          text-blue-600 dark:text-blue-400
          hover:bg-blue-200 dark:hover:bg-blue-900/50
          transition-colors font-medium text-sm"
      >
        <Edit size={16} />
        <span>수정</span>
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg
          bg-red-100 dark:bg-red-900/30 
          text-red-600 dark:text-red-400
          hover:bg-red-200 dark:hover:bg-red-900/50
          transition-colors font-medium text-sm
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>삭제 중...</span>
          </>
        ) : (
          <>
            <Trash2 size={16} />
            <span>삭제</span>
          </>
        )}
      </button>
    </div>
  );
}
