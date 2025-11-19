"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Award,
  Target,
  Zap,
  TrendingUp,
  Star,
  Gift,
  Trophy,
  Crown,
  MapPin,
  Camera,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useIsClient } from "@/hooks/useSSR";

interface UserStats {
  totalCoins: number;
  reviewsCount: number;
  photosCount: number;
  checkinCount: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  rank: string;
  badges: Badge[];
  weeklyStreak: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "review" | "photo" | "checkin" | "explore";
  progress: number;
  target: number;
  completed: boolean;
  deadline?: string;
}

interface GamificationPanelProps {
  userLocation?: [number, number];
  onQuestAccept: (questId: string) => void;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({
  userLocation,
  onQuestAccept,
}) => {
  const isClient = useIsClient();
  const [userStats, setUserStats] = useState<UserStats>({
    totalCoins: 2847,
    reviewsCount: 156,
    photosCount: 289,
    checkinCount: 73,
    level: 12,
    experience: 2340,
    nextLevelExp: 2800,
    rank: "Food Explorer",
    badges: [],
    weeklyStreak: 7,
  });

  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "quests" | "badges" | "rewards"
  >("overview");

  // Mock badges
  const mockBadges: Badge[] = [
    {
      id: "1",
      name: "First Review",
      description: "Viết review đầu tiên",
      icon: <Star className="w-6 h-6" />,
      rarity: "common",
      unlockedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Photo Hunter",
      description: "Chụp 100 ảnh món ăn",
      icon: <Camera className="w-6 h-6" />,
      rarity: "rare",
      unlockedAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Streak Master",
      description: "Check-in 7 ngày liên tục",
      icon: <Zap className="w-6 h-6" />,
      rarity: "epic",
      unlockedAt: "2024-03-01",
    },
    {
      id: "4",
      name: "Local Legend",
      description: "Top 10 reviewer tại TP.HCM",
      icon: <Crown className="w-6 h-6" />,
      rarity: "legendary",
    },
  ];

  // Mock quests
  const mockQuests: Quest[] = [
    {
      id: "1",
      title: "Explorer's Journey",
      description: "Khám phá 3 quán ăn mới trong tuần này",
      reward: 150,
      type: "explore",
      progress: 1,
      target: 3,
      completed: false,
      deadline: "7 ngày",
    },
    {
      id: "2",
      title: "Photo Challenge",
      description: "Chụp và đăng 5 ảnh món ăn hôm nay",
      reward: 75,
      type: "photo",
      progress: 3,
      target: 5,
      completed: false,
      deadline: "24 giờ",
    },
    {
      id: "3",
      title: "Review Master",
      description: "Viết 2 review chi tiết với ít nhất 100 từ",
      reward: 200,
      type: "review",
      progress: 0,
      target: 2,
      completed: false,
      deadline: "3 ngày",
    },
    {
      id: "4",
      title: "Social Butterfly",
      description: "Chia sẻ 3 địa điểm lên mạng xã hội",
      reward: 100,
      type: "checkin",
      progress: 2,
      target: 3,
      completed: false,
      deadline: "2 ngày",
    },
  ];

  useEffect(() => {
    setUserStats((prev) => ({
      ...prev,
      badges: mockBadges.filter((b) => b.unlockedAt),
    }));
    setActiveQuests(mockQuests);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-orange-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case "review":
        return <Star className="w-5 h-5" />;
      case "photo":
        return <Camera className="w-5 h-5" />;
      case "checkin":
        return <MapPin className="w-5 h-5" />;
      case "explore":
        return <Target className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const progressPercentage =
    (userStats.experience / userStats.nextLevelExp) * 100;

  if (!isClient) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Gamification Hub
            </h2>
            <p className="text-sm text-gray-600">
              Tích xu, nhận thưởng & thử thách
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
            <Coins className="w-6 h-6" />
            {userStats.totalCoins.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">{userStats.rank}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          {
            id: "overview",
            label: "Tổng quan",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: "quests",
            label: "Nhiệm vụ",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: "badges",
            label: "Huy hiệu",
            icon: <Award className="w-4 h-4" />,
          },
          {
            id: "rewards",
            label: "Phần thưởng",
            icon: <Gift className="w-4 h-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* Level Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-bold text-lg">
                  {userStats.level}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Level {userStats.level}
                  </h3>
                  <p className="text-sm text-gray-600">{userStats.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">EXP</p>
                <p className="font-semibold text-gray-800">
                  {userStats.experience.toLocaleString()} /{" "}
                  {userStats.nextLevelExp.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Còn {userStats.nextLevelExp - userStats.experience} EXP để lên
              level {userStats.level + 1}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Reviews</p>
                  <p className="text-2xl font-bold">{userStats.reviewsCount}</p>
                </div>
                <Star className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Photos</p>
                  <p className="text-2xl font-bold">{userStats.photosCount}</p>
                </div>
                <Camera className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Check-ins</p>
                  <p className="text-2xl font-bold">{userStats.checkinCount}</p>
                </div>
                <MapPin className="w-8 h-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Streak</p>
                  <p className="text-2xl font-bold">{userStats.weeklyStreak}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "quests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Nhiệm vụ hiện tại
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
              {activeQuests.filter((q) => !q.completed).length} nhiệm vụ
            </span>
          </div>

          {activeQuests.map((quest) => (
            <div
              key={quest.id}
              className={`bg-white rounded-xl p-4 border transition-all duration-200 ${
                quest.completed
                  ? "border-green-200 bg-green-50"
                  : "border-gray-100 hover:border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        quest.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {quest.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        getQuestTypeIcon(quest.type)
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      {quest.title}
                    </h4>
                    <div className="flex items-center gap-1 text-yellow-600 font-medium">
                      <Coins className="w-4 h-4" />
                      {quest.reward}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {quest.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>Tiến độ</span>
                        <span>
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            quest.completed
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600"
                          }`}
                          style={{
                            width: `${(quest.progress / quest.target) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    {quest.deadline && (
                      <div className="ml-4 text-right">
                        <p className="text-xs text-gray-500">Còn lại</p>
                        <p className="text-sm font-medium text-gray-700">
                          {quest.deadline}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!quest.completed && (
                  <button
                    onClick={() => onQuestAccept(quest.id)}
                    className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Bắt đầu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === "badges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Huy hiệu đã mở khóa
            </h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
              {userStats.badges.length}/{mockBadges.length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  badge.unlockedAt
                    ? "bg-white border-gray-200 hover:shadow-md"
                    : "bg-gray-50 border-gray-100 opacity-60"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${getRarityColor(
                      badge.rarity
                    )}`}
                  >
                    <div className="text-white">{badge.icon}</div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {badge.description}
                  </p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      badge.rarity === "legendary"
                        ? "bg-yellow-100 text-yellow-700"
                        : badge.rarity === "epic"
                        ? "bg-purple-100 text-purple-700"
                        : badge.rarity === "rare"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {badge.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "rewards" && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cửa hàng phần thưởng
            </h3>
            <p className="text-gray-500">Đổi coin lấy voucher và quà tặng</p>
            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              Sắp ra mắt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationPanel;
