
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePosts } from '../hooks/usePosts';
import { FeedView } from './Feed/FeedView';
import { DiscoverView } from './Discover/DiscoverView';
import { CategoryFeedView } from './Feed/CategoryFeedView';
import { MapView } from './Map/MapView';
import { WalletView } from './Wallet/WalletView';
import { GovernanceView } from './Governance/GovernanceView';
import { LeaderboardView } from './Leaderboard/LeaderboardView';
import { CreatePostView } from './CreatePost/CreatePostView';
import { SettingsView } from './Profile/SettingsView';
import { ProfileView } from './Profile/ProfileView';
import { VisitorProfileView } from './Profile/VisitorProfileView';

const Dashboard = () => {
  // Hoisting Post State to Dashboard Router so it can be shared between Feed, CategoryFeed and CreatePost
  const { posts, publishPost } = usePosts();

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<FeedView posts={posts} />} />
        <Route path="/feed" element={<FeedView posts={posts} />} />
        <Route path="/discover" element={<DiscoverView />} />
        <Route path="/discover/:field" element={<CategoryFeedView posts={posts} />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/wallet" element={<WalletView />} />
        <Route path="/governance" element={<GovernanceView />} />
        <Route path="/leaderboard" element={<LeaderboardView />} />
        <Route path="/create" element={<CreatePostView onPublish={publishPost} />} />
        <Route path="/settings" element={<SettingsView />} />
        
        {/* Own Profile */}
        <Route path="/profile" element={<ProfileView />} />
        
        {/* Public Visitor Profile (Dynamic ID) */}
        <Route path="/u/:userId" element={<VisitorProfileView />} />
        
        <Route path="*" element={<div className="text-center py-20 text-gray-500">Page not found</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
