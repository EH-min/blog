import { Post, PostCreateRequest, PostUpdateRequest } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Supabase 데이터베이스에서 받은 posts 테이블의 Row 타입
 */
interface SupabasePost {
  id: number;
  title: string;
  content: string;
  slug: string;
  series_name: string | null;
  tags: string[];
  created_at: string;
  is_published: boolean;
  views: number;
  likes: number;
}

/**
 * Supabase에서 받은 데이터를 Post 타입으로 변환
 */
const mapSupabasePostToPost = (supabasePost: SupabasePost): Post => {
  return {
    id: supabasePost.id,
    title: supabasePost.title,
    content: supabasePost.content,
    slug: supabasePost.slug,
    seriesName: supabasePost.series_name,
    tags: supabasePost.tags || [],
    createdAt: supabasePost.created_at,
    isPublished: supabasePost.is_published,
    views: supabasePost.views || 0,
    likes: supabasePost.likes || 0,
  };
};

/**
 * 현재 사용자가 관리자인지 확인
 */
const isAdmin = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * 모든 게시글을 작성일 기준 내림차순으로 조회
 * 관리자가 아닌 경우 발행된 글만 반환
 */
export const getPosts = async (): Promise<Post[]> => {
  try {
    const admin = await isAdmin();
    
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 관리자가 아닌 경우 발행된 글만 조회
    if (!admin) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 게시글 조회 에러:', error);
      throw new Error(`게시글을 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabasePostToPost);
  } catch (error) {
    console.error('게시글 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 슬러그로 특정 게시글 조회
 * preview 모드거나 관리자인 경우 Draft도 조회 가능
 */
export const getPostBySlug = async (slug: string, preview: boolean = false): Promise<Post | null> => {
  try {
    const admin = await isAdmin();
    
    let query = supabase
      .from('posts')
      .select('*')
      .eq('slug', slug);
    
    // 관리자도 아니고 preview 모드도 아니면 발행된 글만 조회
    if (!admin && !preview) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 게시글을 찾을 수 없는 경우
        return null;
      }
      console.error('Supabase 게시글 조회 에러:', error);
      throw new Error(`게시글을 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapSupabasePostToPost(data);
  } catch (error) {
    console.error('게시글 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 새로운 게시글 생성
 */
export const createPost = async (data: PostCreateRequest): Promise<Post> => {
  try {
    const { data: insertedData, error } = await supabase
      .from('posts')
      .insert({
        title: data.title,
        content: data.content,
        slug: data.slug,
        series_name: data.seriesName || null,
        tags: data.tags,
        is_published: data.status === 'PUBLISHED',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 게시글 생성 에러:', error);
      throw new Error(`게시글을 생성할 수 없습니다: ${error.message}`);
    }

    if (!insertedData) {
      throw new Error('게시글 생성 후 데이터를 받지 못했습니다.');
    }

    return mapSupabasePostToPost(insertedData);
  } catch (error) {
    console.error('게시글 생성 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 이전/다음 글 정보
 */
export interface AdjacentPost {
  slug: string;
  title: string;
}

export interface AdjacentPosts {
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}

/**
 * 현재 게시글의 이전/다음 글 조회
 * @param currentId 현재 게시글 ID
 * @returns 이전 글과 다음 글 정보
 */
export const getAdjacentPosts = async (currentId: number): Promise<AdjacentPosts> => {
  try {
    // 현재 게시글 정보 조회
    const { data: currentPost, error: currentError } = await supabase
      .from('posts')
      .select('created_at')
      .eq('id', currentId)
      .single();

    if (currentError || !currentPost) {
      console.error('현재 게시글 조회 에러:', currentError);
      return { prev: null, next: null };
    }

    const currentCreatedAt = currentPost.created_at;

    // 이전 글 조회 (현재 글보다 오래된 글 중 가장 최신)
    const { data: prevData, error: prevError } = await supabase
      .from('posts')
      .select('slug, title')
      .eq('is_published', true)
      .lt('created_at', currentCreatedAt)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 다음 글 조회 (현재 글보다 최신 글 중 가장 오래된)
    const { data: nextData, error: nextError } = await supabase
      .from('posts')
      .select('slug, title')
      .eq('is_published', true)
      .gt('created_at', currentCreatedAt)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    return {
      prev: prevError?.code === 'PGRST116' ? null : prevData,
      next: nextError?.code === 'PGRST116' ? null : nextData,
    };
  } catch (error) {
    console.error('이전/다음 글 조회 중 에러 발생:', error);
    return { prev: null, next: null };
  }
};

/**
 * 태그 정보 (이름과 개수)
 */
export interface TagInfo {
  name: string;
  count: number;
}

/**
 * 시리즈 정보 (이름과 개수)
 */
export interface SeriesInfo {
  name: string;
  count: number;
}

/**
 * 모든 태그와 각 태그의 게시글 개수 조회
 */
export const getAllTags = async (): Promise<TagInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('태그 조회 에러:', error);
      throw new Error(`태그를 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // 모든 태그를 집계
    const tagMap = new Map<string, number>();
    data.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });

    // Map을 배열로 변환하고 개수 기준 내림차순 정렬
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('태그 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 모든 시리즈와 각 시리즈의 게시글 개수 조회
 */
export const getAllSeries = async (): Promise<SeriesInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('series_name')
      .eq('is_published', true)
      .not('series_name', 'is', null);

    if (error) {
      console.error('시리즈 조회 에러:', error);
      throw new Error(`시리즈를 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // 시리즈 집계
    const seriesMap = new Map<string, number>();
    data.forEach((post) => {
      if (post.series_name) {
        seriesMap.set(post.series_name, (seriesMap.get(post.series_name) || 0) + 1);
      }
    });

    // Map을 배열로 변환하고 이름 기준 오름차순 정렬
    return Array.from(seriesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('시리즈 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 특정 태그가 포함된 게시글 조회
 */
export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('태그별 게시글 조회 에러:', error);
      throw new Error(`게시글을 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabasePostToPost);
  } catch (error) {
    console.error('태그별 게시글 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 특정 시리즈의 게시글 조회
 */
export const getPostsBySeries = async (seriesName: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('series_name', seriesName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('시리즈별 게시글 조회 에러:', error);
      throw new Error(`게시글을 불러올 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabasePostToPost);
  } catch (error) {
    console.error('시리즈별 게시글 조회 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 키워드로 게시글 검색 (제목, 본문, 태그)
 */
export const searchPosts = async (keyword: string): Promise<Post[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const searchTerm = `%${keyword}%`;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 검색 에러:', error);
      throw new Error(`게시글을 검색할 수 없습니다: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    const posts = data.map(mapSupabasePostToPost);

    // 태그 검색 결과도 포함 (클라이언트 측 필터링)
    const tagFilteredPosts = posts.filter((post) =>
      post.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))
    );

    // 중복 제거하여 병합
    const allPosts = [...posts];
    tagFilteredPosts.forEach((post) => {
      if (!allPosts.find((p) => p.id === post.id)) {
        allPosts.push(post);
      }
    });

    return allPosts;
  } catch (error) {
    console.error('게시글 검색 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 게시글 수정
 */
export const updatePost = async (
  slug: string,
  data: PostUpdateRequest
): Promise<Post> => {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.seriesName !== undefined) updateData.series_name = data.seriesName || null;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.status !== undefined) updateData.is_published = data.status === 'PUBLISHED';

    const { data: updatedData, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('게시글 수정 에러:', error);
      throw new Error(`게시글을 수정할 수 없습니다: ${error.message}`);
    }

    if (!updatedData) {
      throw new Error('게시글 수정 후 데이터를 받지 못했습니다.');
    }

    return mapSupabasePostToPost(updatedData);
  } catch (error) {
    console.error('게시글 수정 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (slug: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('게시글 삭제 에러:', error);
      throw new Error(`게시글을 삭제할 수 없습니다: ${error.message}`);
    }
  } catch (error) {
    console.error('게시글 삭제 중 에러 발생:', error);
    throw error;
  }
};

/**
 * Supabase Storage에 이미지 업로드
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('이미지 업로드 에러:', uploadError);
      throw new Error(`이미지를 업로드할 수 없습니다: ${uploadError.message}`);
    }

    // 공개 URL 가져오기
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 조회수 증가 (RPC 호출)
 */
export const incrementViews = async (slug: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_post_views', { post_slug: slug });
    if (error) {
      console.error('조회수 증가 에러:', error);
    }
  } catch (error) {
    console.error('조회수 증가 중 에러 발생:', error);
  }
};

/**
 * 좋아요 증가
 */
export const incrementLikes = async (slug: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('increment_post_likes', { post_slug: slug });
    if (error) {
      console.error('좋아요 증가 에러:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('좋아요 증가 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 좋아요 감소
 */
export const decrementLikes = async (slug: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('decrement_post_likes', { post_slug: slug });
    if (error) {
      console.error('좋아요 감소 에러:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('좋아요 감소 중 에러 발생:', error);
    throw error;
  }
};
