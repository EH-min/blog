"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { PostCreateRequest } from '@/types';
import { createPost } from '@/services/postService';

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Transform tags string to array
    const tags = formData.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const requestPayload: PostCreateRequest = {
      title: formData.title,
      content: formData.content,
      slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-'), // Auto-generate slug if empty
      seriesName: formData.seriesName || undefined,
      tags: tags,
      status: 'PUBLISHED'
    };

    try {
      const newPost = await createPost(requestPayload);
      router.push(`/post/${newPost.slug}`);
    } catch (error) {
      alert('Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Write New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter post title..."
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
            <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate from title.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series Name (Optional)</label>
            <input
              type="text"
              name="seriesName"
              value={formData.seriesName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Spring Boot Series"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
          <input
            type="text"
            name="tagsString"
            value={formData.tagsString}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Java, Spring, Backend (comma separated)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Markdown)</label>
          <textarea
            name="content"
            required
            rows={15}
            value={formData.content}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            placeholder="# Write your masterpiece here..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <X size={18} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {loading ? 'Publishing...' : <><Save size={18} /> Publish Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}
