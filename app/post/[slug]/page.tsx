import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { ArrowLeft, Calendar, Tag, FolderOpen } from 'lucide-react';
import { getPostBySlug, getAdjacentPosts } from '@/services/postService';
import { ProfileCard } from '@/components/ProfileCard';
import { TableOfContents } from '@/components/TableOfContents';
import { PostNavigation } from '@/components/PostNavigation';
import { Giscus } from '@/components/Giscus';
import { PostActions } from '@/components/PostActions';
import { PostStats } from '@/components/PostStats';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, true); // preview 모드로 조회

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
    };
  }

  // 본문에서 첫 번째 이미지 추출
  const imageMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
  const ogImage = imageMatch ? imageMatch[1] : '/og-default.png';

  // 본문에서 요약 생성 (마크다운 제거하고 첫 150자)
  const excerpt = post.content
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
    .replace(/\[.*?\]\(.*?\)/g, '') // 링크 제거
    .replace(/#{1,6}\s/g, '') // 헤딩 제거
    .replace(/[*_~`]/g, '') // 마크다운 기호 제거
    .trim()
    .substring(0, 150) + '...';

  return {
    title: `${post.title} | Taemni's Blog`,
    description: excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: 'Taemni' }],
    openGraph: {
      title: post.title,
      description: excerpt,
      type: 'article',
      publishedTime: post.createdAt,
      authors: ['Taemni'],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';
  
  const post = await getPostBySlug(slug, isPreview);

  if (!post) {
    notFound();
  }

  // 이전/다음 글 조회
  const adjacentPosts = await getAdjacentPosts(post.id);

  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <div className="mb-8 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft size={16} />
          <span className="font-medium">목록으로</span>
        </Link>
      </div>

      {/* 반응형 그리드 레이아웃 */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 xl:gap-12">
        {/* 메인 콘텐츠 */}
        <article className="min-w-0">
          {/* Mobile TOC (접이식) */}
          <details className="lg:hidden mb-8 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📑 목차
            </summary>
            <div className="mt-4">
              <TableOfContents content={post.content} />
            </div>
          </details>

          {/* Draft 상태 표시 */}
          {!post.isPublished && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm flex items-center gap-2">
                📝 이 글은 임시 저장 상태입니다. 관리자만 볼 수 있습니다.
              </p>
            </div>
          )}

          {/* Admin Actions (수정/삭제) */}
          <PostActions slug={post.slug} />

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
              <PostStats slug={post.slug} initialViews={post.views} initialLikes={post.likes} />
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
          <div className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:scroll-mt-20
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-bold
            prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-lg prose-pre:shadow-lg
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic
            prose-ul:list-disc prose-ol:list-decimal
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-table:border-collapse prose-table:w-full
            prose-thead:bg-gray-100 dark:prose-thead:bg-gray-800
            prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:px-4 prose-th:py-2 prose-th:text-left
            prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:px-4 prose-td:py-2
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-gray-300 dark:prose-hr:border-gray-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSlug]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Post Navigation (이전/다음 글) */}
          <PostNavigation prev={adjacentPosts.prev} next={adjacentPosts.next} />

          {/* Profile Card */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <ProfileCard />
          </div>

          {/* Giscus Comments */}
          <Giscus />
        </article>

        {/* Desktop TOC (Sticky Sidebar) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <TableOfContents content={post.content} />
          </div>
        </aside>
      </div>
    </div>
  );
}
