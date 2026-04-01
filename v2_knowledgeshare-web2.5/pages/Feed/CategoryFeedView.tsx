
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Post, FieldType } from '../../types';
import { FIELDS } from '../../data/mockData';
import { FeedView } from './FeedView';

export const CategoryFeedView = ({ posts }: { posts: Post[] }) => {
  const { field } = useParams<{ field: FieldType }>();
  
  const filteredPosts = posts.filter(p => p.field === field);
  const fieldInfo = FIELDS.find(f => f.type === field);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/app/discover" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500">
            <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
            <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg ${fieldInfo?.color}`}>
                    <span className="material-symbols-outlined">{fieldInfo?.icon}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{field}</h1>
            </div>
            <p className="text-gray-500">{fieldInfo?.description}</p>
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <FeedView posts={filteredPosts} />
      ) : (
        <div className="text-center py-20 text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
            <p className="text-lg">No posts found in {field} yet.</p>
            <Link to="/app/create" className="text-primary hover:underline mt-2 inline-block">Be the first to post!</Link>
        </div>
      )}
    </div>
  );
};
