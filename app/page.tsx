import { ProfileCard } from '@/components/ProfileCard';
import { PostCard } from '@/components/PostCard';
import { getPosts } from '@/services/postService';

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <ProfileCard />
      
      <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-8">
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
