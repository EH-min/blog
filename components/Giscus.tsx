'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';
import GiscusComponent from '@giscus/react';
import type { BooleanString } from '@giscus/react';

// Giscus 설정 (환경 변수로 관리 가능)
const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || 'EH-min/blog',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOQaeesw',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  mapping: 'pathname' as const,
  strict: '0' as BooleanString,
  reactionsEnabled: '1' as BooleanString,
  emitMetadata: '0' as BooleanString,
  inputPosition: 'bottom' as const,
  lang: 'ko',
  loading: 'lazy' as const,
};

export function Giscus() {
  const { resolvedTheme } = useTheme();
  const [mounted] = useState(true);

  // 실제 적용될 테마 결정
  const giscusTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // 마운트되지 않았으면 렌더링하지 않음 (하이드레이션 에러 방지)
  if (!mounted) {
    return (
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        댓글
      </h2>
      <GiscusComponent
        repo={GISCUS_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping={GISCUS_CONFIG.mapping}
        strict={GISCUS_CONFIG.strict}
        reactionsEnabled={GISCUS_CONFIG.reactionsEnabled}
        emitMetadata={GISCUS_CONFIG.emitMetadata}
        inputPosition={GISCUS_CONFIG.inputPosition}
        theme={giscusTheme}
        lang={GISCUS_CONFIG.lang}
        loading={GISCUS_CONFIG.loading}
      />
    </div>
  );
}
