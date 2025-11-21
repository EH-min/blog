"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, Upload, Loader2, Eye, Edit, Bold, Italic, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { PostCreateRequest, PostUpdateRequest } from '@/types';
import { createPost, updatePost, getPostBySlug, uploadImage } from '@/services/postService';
import { supabase } from '@/lib/supabase';

// 한글을 로마자로 변환하는 함수
const transliterateKorean = (text: string): string => {
  const koreanToRoman: Record<string, string> = {
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
    'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
    'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
    'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
    'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
    'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
    'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
    'ㅣ': 'i'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // 한글 유니코드 범위 (가-힣)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syllableIndex = code - 0xAC00;
      const initialIndex = Math.floor(syllableIndex / 588);
      const medialIndex = Math.floor((syllableIndex % 588) / 28);
      const finalIndex = syllableIndex % 28;
      
      const initials = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
      const medials = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
      const finals = ['', 'g', 'kk', 'gs', 'n', 'nj', 'nh', 'd', 'r', 'rg', 'rm', 'rb', 'rs', 'rt', 'rp', 'rh', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];
      
      result += initials[initialIndex] + medials[medialIndex] + finals[finalIndex];
    } else {
      result += char;
    }
  }
  
  return result;
};

// Slug 생성 함수
const generateSlug = (title: string): string => {
  // 1. 한글을 로마자로 변환
  const transliterated = transliterateKorean(title);
  
  // 2. 소문자 변환 및 특수문자 제거, 공백을 하이픈으로
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 영문, 숫자, 한글, 공백, 하이픈만 허용
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
};

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    seriesName: string;
    tagsString: string;
  }>({
    title: '',
    slug: '',
    content: '',
    seriesName: '',
    tagsString: '',
  });

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. 인증 확인
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // 2. 수정 모드인 경우 게시글 로드
        if (editSlug) {
          const post = await getPostBySlug(editSlug);
          if (post) {
            setFormData({
              title: post.title,
              slug: post.slug,
              content: post.content,
              seriesName: post.seriesName || '',
              tagsString: post.tags.join(', '),
            });
          } else {
            alert('게시글을 찾을 수 없습니다.');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('초기화 에러:', error);
        alert('페이지를 불러올 수 없습니다.');
      } finally {
        setInitialLoading(false);
      }
    };

    initPage();
  }, [router, editSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 마크다운 문법 삽입 헬퍼
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);
    
    const insertText = selectedText || placeholder;
    const newText = text.substring(0, start) + before + insertText + after + text.substring(end);
    
    setFormData(prev => ({ ...prev, content: newText }));

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos + placeholder.length);
    }, 0);
  };

  // 단축키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', '굵은 텍스트');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', '기울임 텍스트');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', '링크 텍스트');
          break;
        default:
          break;
      }
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      
      // 현재 커서 위치에 이미지 마크다운 삽입
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        
        setFormData(prev => ({
          ...prev,
          content: before + imageMarkdown + after
        }));

        // 커서를 삽입된 텍스트 뒤로 이동
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + imageMarkdown.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    } catch {
      alert('이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  // 붙여넣기 이벤트
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  };

  // 드래그 앤 드롭
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await handleImageUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    const tags = formData.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      if (editSlug) {
        // 수정 모드
        const updateData: PostUpdateRequest = {
          title: formData.title,
          content: formData.content,
          slug: formData.slug,
          seriesName: formData.seriesName || undefined,
          tags: tags,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
        };
        
        await updatePost(editSlug, updateData);
        
        if (isDraft) {
          alert('임시 저장되었습니다.');
          setLoading(false);
        } else {
          router.push(`/post/${formData.slug}`);
        }
      } else {
        // 생성 모드
        const createData: PostCreateRequest = {
          title: formData.title,
          content: formData.content,
          slug: formData.slug || generateSlug(formData.title),
          seriesName: formData.seriesName || undefined,
          tags: tags,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
        };
        
        const newPost = await createPost(createData);
        
        if (isDraft) {
          alert('임시 저장되었습니다.');
          router.push(`/write?slug=${newPost.slug}`);
        } else {
          router.push(`/post/${newPost.slug}`);
        }
      }
    } catch {
      alert(editSlug ? '게시글 수정 실패' : '게시글 작성 실패');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        {editSlug ? '게시글 수정' : '새 글 작성'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="게시글 제목을 입력하세요..."
          />
        </div>

        {/* Slug & Series Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="custom-url-slug"
            />
            <p className="text-xs text-gray-500 mt-1">비워두면 제목에서 자동 생성됩니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시리즈 (선택)</label>
            <input
              type="text"
              name="seriesName"
              value={formData.seriesName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="예: 스프링 부트 시리즈"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">태그</label>
          <input
            type="text"
            name="tagsString"
            value={formData.tagsString}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Java, Spring, Backend (쉼표로 구분)"
          />
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              본문 (Markdown) {uploading && <span className="text-blue-600">- 이미지 업로드 중...</span>}
            </label>
            
            {/* 에디터 모드 전환 & 툴바 */}
            <div className="flex items-center gap-2">
              {/* 마크다운 툴바 */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', '굵은 텍스트')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="굵게 (Ctrl+B)"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', '기울임 텍스트')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="기울임 (Ctrl+I)"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](url)', '링크 텍스트')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="링크 (Ctrl+K)"
                >
                  <LinkIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageGallery(true)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="이미지 갤러리"
                >
                  <ImageIcon size={16} />
                </button>
              </div>

              {/* 뷰 모드 전환 */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`p-1.5 rounded transition-colors ${previewMode === 'edit' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="편집 모드"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('split')}
                  className={`p-1.5 rounded transition-colors ${previewMode === 'split' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="Split 모드"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="8" height="18" rx="2" />
                    <rect x="13" y="3" width="8" height="18" rx="2" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`p-1.5 rounded transition-colors ${previewMode === 'preview' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="프리뷰 모드"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 에디터 영역 */}
          <div className={`grid gap-4 ${previewMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* 편집 영역 */}
            {previewMode !== 'preview' && (
              <textarea
                ref={textareaRef}
                name="content"
                required
                rows={20}
                value={formData.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm resize-none"
                placeholder="# 마크다운으로 작성하세요...&#10;&#10;💡 팁: 이미지를 붙여넣기(Ctrl+V) 또는 드래그 앤 드롭하면 자동으로 업로드됩니다!"
              />
            )}

            {/* 프리뷰 영역 */}
            {previewMode !== 'edit' && (
              <div className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-auto max-h-[500px]">
                <article className="prose dark:prose-invert prose-sm max-w-none">
                  {formData.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 italic">프리뷰가 여기에 표시됩니다...</p>
                  )}
                </article>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <X size={18} /> 취소
          </button>
          
          {/* 임시 저장 버튼 */}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading || uploading}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save size={18} />
                임시 저장
              </>
            )}
          </button>
          
          {/* 발행하기 버튼 */}
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading || uploading}
            className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {editSlug ? '수정 중...' : '발행 중...'}
              </>
            ) : (
              <>
                <Upload size={18} />
                {editSlug ? '수정 완료' : '발행하기'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* 이미지 갤러리 모달 */}
      {showImageGallery && <ImageGalleryModal onClose={() => setShowImageGallery(false)} onSelect={(url) => insertMarkdown(`![image](${url})`, '', '')} />}
    </div>
  );
}

// 이미지 갤러리 모달 컴포넌트
function ImageGalleryModal({ onClose, onSelect }: { onClose: () => void; onSelect: (url: string) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase.storage.from('images').list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) throw error;

        const imageUrls = data.map((file) => {
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(file.name);
          return urlData.publicUrl;
        });

        setImages(imageUrls);
      } catch (error) {
        console.error('이미지 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">이미지 갤러리</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">업로드된 이미지가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(url);
                    onClose();
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                >
                  <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">선택</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  );
}
