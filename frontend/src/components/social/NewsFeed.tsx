"use client";

import React, { useState } from "react";
import Post from "./Post";
import CreatePost from "./CreatePost";

interface NewsFeedPost {
  id: string;
  author: {
    name: string;
    time: string;
  };
  content: {
    text?: string;
    image?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

interface NewsFeedProps {
  className?: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ className = "" }) => {
  const [posts, setPosts] = useState<NewsFeedPost[]>([
    {
      id: "1",
      author: {
        name: "John Doe",
        time: "6h",
      },
      content: {
        text: "Lorem ipsum quitanct",
        image: "/api/placeholder/500/300", // This will be a placeholder image
      },
      likes: 15,
      comments: 3,
      shares: 2,
      isLiked: false,
    },
    {
      id: "2",
      author: {
        name: "John Doe",
        time: "6h",
      },
      content: {
        text: "Lorem ipsum quitanct",
        image: "/api/placeholder/500/300",
      },
      likes: 8,
      comments: 1,
      shares: 0,
      isLiked: true,
    },
    {
      id: "3",
      author: {
        name: "John Doe",
        time: "Yesterday",
      },
      content: {
        text: "Lorem ipsum quitanct",
        image: "/api/placeholder/500/300",
      },
      likes: 23,
      comments: 5,
      shares: 1,
      isLiked: false,
    },
  ]);

  const handleNewPost = (content: string) => {
    const newPost = {
      id: (posts.length + 1).toString(),
      author: {
        name: "You",
        time: "now",
      },
      content: {
        text: content,
      },
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Create Post */}
      <CreatePost onPost={handleNewPost} />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            author={post.author}
            content={post.content}
            likes={post.likes}
            comments={post.comments}
            shares={post.shares}
            isLiked={post.isLiked}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <button className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
          Load more posts
        </button>
      </div>
    </div>
  );
};

export default NewsFeed;
