'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  // 마크다운 문법 제거 함수
  const cleanMarkdownText = (text: string): string => {
    return text
      // 볼드 제거: **텍스트** 또는 __텍스트__
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      // 이탤릭 제거: *텍스트* 또는 _텍스트_
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // 인라인 코드 제거: `코드`
      .replace(/`(.+?)`/g, '$1')
      // 링크 제거: [텍스트](url) -> 텍스트
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      // 이미지 제거: ![alt](url)
      .replace(/!\[.*?\]\(.+?\)/g, '')
      // 취소선 제거: ~~텍스트~~
      .replace(/~~(.+?)~~/g, '$1')
      // 이모지와 특수문자 앞의 백슬래시 제거
      .replace(/\\([*_`~\[\]()])/g, '$1')
      .trim();
  };

  // 마크다운에서 헤더 추출 (useMemo 사용)
  const headings = useMemo(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extractedHeadings: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // 마크다운 문법 제거
      const text = cleanMarkdownText(rawText);
      
      // rehype-slug가 생성하는 id 형식과 동일하게 변환
      const id = rawText
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-');
      
      extractedHeadings.push({ id, text, level });
    }

    return extractedHeadings;
  }, [content]);

  useEffect(() => {
    // Intersection Observer를 사용하여 현재 보고 있는 섹션 추적
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 1.0,
      }
    );

    // 모든 헤딩 요소 관찰
    const headingElements = headings.map(({ id }) =>
      document.getElementById(id)
    ).filter(Boolean);

    headingElements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="toc-container">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <List size={16} />
        <span>목차</span>
      </div>
      <ul className="space-y-2 text-sm">
        {headings.map(({ id, text, level }) => (
          <motion.li
            key={id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ paddingLeft: `${(level - 1) * 12}px` }}
          >
            <button
              onClick={() => handleClick(id)}
              className={`
                text-left w-full py-1 px-2 rounded transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${
                  activeId === id
                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/30'
                    : 'text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {text}
            </button>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
