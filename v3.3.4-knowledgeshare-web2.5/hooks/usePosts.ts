
import { useState } from 'react';
import { Post, PostVisibility, PostContentType, FieldType, Location } from '../types';
import { INITIAL_POSTS, CURRENT_USER } from '../data/mockData';
import { autoClassifyPost } from '../utils/postUtils';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const publishPost = (
      title: string, 
      content: string, 
      visibility: PostVisibility = 'public',
      contentType: PostContentType = 'standard',
      premiumHint?: string,
      unlockPrice?: number,
      forcedField?: FieldType,
      link?: string,
      location?: Location
  ) => {
    if (!content || !title) return false;
    
    // Auto Tagging or Manual Selection
    const field = forcedField || autoClassifyPost(content);
    
    // Calc random KV for demo (0-100)
    const kv = Math.floor(Math.random() * 30) + 70; 

    const newPost: Post = {
        id: Date.now().toString(),
        author: CURRENT_USER,
        title: title,
        content: content,
        timestamp: 'Just now',
        likes: 0,
        knowledgeValue: kv,
        comments: 0,
        shares: 0,
        tags: [],
        field: field,
        visibility,
        contentType,
        premiumHint,
        unlockPrice,
        link,
        location
    };

    setPosts(prev => [newPost, ...prev]);
    return { success: true, field };
  };

  return {
    posts,
    publishPost
  };
};
