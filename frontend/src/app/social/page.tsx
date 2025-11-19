"use client";

import React from "react";
import { AuthenticatedRoute } from "@/components/auth/ProtectedRoute";
import SocialLayout from "@/components/social/SocialLayout";
import SocialSidebar from "@/components/social/SocialSidebar";
import NewsFeed from "@/components/social/NewsFeed";
import TrendingSidebar from "@/components/social/TrendingSidebar";

const SocialPage = () => {
  return (
    <AuthenticatedRoute>
      <SocialLayout
        leftSidebar={<SocialSidebar />}
        rightSidebar={<TrendingSidebar />}
      >
        <NewsFeed />
      </SocialLayout>
    </AuthenticatedRoute>
  );
};

export default SocialPage;
