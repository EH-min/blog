'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Eye } from 'lucide-react';
import { incrementViews, incrementLikes, decrementLikes } from '@/services/postService';

interface PostStatsProps {
  slug: string;
  initialViews: number;
  initialLikes: number;
}

export const PostStats: React.FC<PostStatsProps> = ({ slug, initialViews, initialLikes }) => {
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 조회수 증가 (중복 방지)
  useEffect(() => {
    const viewKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewKey);

    if (!hasViewed) {
      incrementViews(slug).then(() => {
        setViews(prev => prev + 1);
        sessionStorage.setItem(viewKey, 'true');
      });
    }
  }, [slug]);

  // 좋아요 상태 로드
  useEffect(() => {
    const likeKey = `liked_${slug}`;
    const liked = localStorage.getItem(likeKey);
    setIsLiked(liked === 'true');
  }, [slug]);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    const likeKey = `liked_${slug}`;
    setIsAnimating(true);

    try {
      if (isLiked) {
        const newLikes = await decrementLikes(slug);
        setLikes(newLikes);
        setIsLiked(false);
        localStorage.removeItem(likeKey);
      } else {
        const newLikes = await incrementLikes(slug);
        setLikes(newLikes);
        setIsLiked(true);
        localStorage.setItem(likeKey, 'true');
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 text-sm">
      {/* 조회수 */}
      <div className="flex items-center gap-2">
        <Eye size={18} />
        <span>{views.toLocaleString()}</span>
      </div>

      {/* 좋아요 */}
      <button
        onClick={handleLikeToggle}
        className={`flex items-center gap-2 transition-all ${
          isLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'hover:text-red-500'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      >
        <Heart 
          size={18} 
          fill={isLiked ? 'currentColor' : 'none'} 
          className={isAnimating ? 'animate-bounce' : ''}
        />
        <span>{likes.toLocaleString()}</span>
      </button>
    </div>
  );
};
