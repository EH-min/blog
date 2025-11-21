import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 Anon Key를 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의 (선택 사항이지만 타입 안정성 향상)
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          title: string;
          slug: string;
          content: string;
          series_name: string | null;
          tags: string[];
          created_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: number;
          title: string;
          slug: string;
          content: string;
          series_name?: string | null;
          tags?: string[];
          created_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: number;
          title?: string;
          slug?: string;
          content?: string;
          series_name?: string | null;
          tags?: string[];
          created_at?: string;
          is_published?: boolean;
        };
      };
    };
  };
};
