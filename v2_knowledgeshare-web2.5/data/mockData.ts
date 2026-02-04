
import { User, Post, Proposal, LeaderboardEntry, Location, FieldType } from '../types';

export const FIELDS: { type: FieldType; icon: string; color: string; description: string }[] = [
  { type: 'Technology', icon: 'terminal', color: 'text-blue-500 bg-blue-500/10', description: 'Coding, Web3, Solana, and AI' },
  { type: 'Science', icon: 'science', color: 'text-purple-500 bg-purple-500/10', description: 'Physics, Biology, Space, and Research' },
  { type: 'Art', icon: 'palette', color: 'text-pink-500 bg-pink-500/10', description: 'Design, NFT, Painting, and Music' },
  { type: 'Finance', icon: 'attach_money', color: 'text-green-500 bg-green-500/10', description: 'DeFi, Markets, Economy, and Trading' },
  { type: 'Health', icon: 'fitness_center', color: 'text-red-500 bg-red-500/10', description: 'Wellness, Medicine, Biohacking' },
  { type: 'General', icon: 'public', color: 'text-gray-500 bg-gray-500/10', description: 'Daily life, News, and Random thoughts' },
];

export const CURRENT_USER: User = {
  name: 'John Doe',
  handle: 'H7xX...9mPq', // Solana Style Shortened
  avatar: 'https://i.pravatar.cc/150?u=john',
  balance_u: 8765, // KNOW-U (Points)
  balance_g: 145.23, // KNOW-G (Solana Tokens)
  isGold: true,
  followers: 1240,
  following: 450,
  isFollowing: false
};

// Mock Comment Structure for the UI
export interface Comment {
    id: string;
    author: string;
    authorLevel: number; // KS Level
    text: string;
    likes: number;
    timestamp: string;
    replies?: Comment[];
}

export const MOCK_COMMENTS: Record<string, Comment[]> = {
    '1': [
        {
            id: 'c1', 
            author: 'Dr. A. Turing', 
            authorLevel: 98,
            timestamp: '2h ago',
            likes: 45,
            text: 'The parallelization approach here is fascinating. How does Sealevel handle state contention in this specific shard?',
            replies: [
                { 
                    id: 'c1-1', 
                    author: 'S. Nakomoto', 
                    authorLevel: 99,
                    timestamp: '1h ago',
                    likes: 120,
                    text: 'It uses optimistic concurrency control. Conflicts cause a transaction rollback at the runtime level. This ensures integrity without locking the entire state.',
                    replies: [
                        {
                            id: 'c1-1-1',
                            author: 'Dr. A. Turing',
                            authorLevel: 98,
                            timestamp: '45m ago',
                            likes: 12,
                            text: 'Ah, I see. A trade-off favoring throughput over determinism in high-contention scenarios.'
                        }
                    ]
                },
                {
                    id: 'c1-2',
                    author: 'G. Wood',
                    authorLevel: 94,
                    timestamp: '30m ago',
                    likes: 12,
                    text: 'Does this increase the hardware requirements for validators significantly due to memory bandwidth?'
                }
            ]
        },
        { 
            id: 'c2', 
            author: 'V. Buterin', 
            authorLevel: 96,
            timestamp: '3h ago',
            likes: 89,
            text: 'Interesting trade-off between throughput and validator hardware requirements. The centralization risk remains a concern if specs get too high.' 
        }
    ],
    '2': [
         { 
             id: 'c3', 
             author: 'Tim B. Lee', 
             authorLevel: 95,
             timestamp: '5h ago',
             likes: 230,
             text: 'This aligns perfectly with the original vision of the Semantic Web. Triples are the future of interoperable data.' 
         }
    ],
    '4': [
         {
             id: 'c4',
             author: 'P. Picasso',
             authorLevel: 88,
             timestamp: '1d ago',
             likes: 45,
             text: 'The concept of immutable code as art is revolutionary. It challenges the impermanence of digital media.'
         }
    ],
    '5': [
        {
            id: 'c5',
            author: 'M. Curie',
            authorLevel: 99,
            timestamp: '2d ago',
            likes: 112,
            text: 'The ethical framework must evolve faster than the technology. We cannot afford to be reactive with gene editing.'
        }
    ],
    '6': [
        {
            id: 'c6',
            author: 'H. Markowitz',
            authorLevel: 92,
            timestamp: '3d ago',
            likes: 67,
            text: 'Capital efficiency is key, but the risk of impermanent loss in narrow ranges effectively makes LPs active traders. Interesting dynamic.'
        }
    ]
};

// --- DEFINE LOCATIONS FIRST SO THEY CAN BE USED IN POSTS ---
export const EXTRA_LOCATIONS: Location[] = [
    // --- TECH & COWORKING CLUSTER (Shoreditch / Old Street) ---
    { 
      id: 'loc8', 
      name: "Campus London", 
      lat: 51.523, 
      lng: -0.085, 
      type: 'coworking', 
      description: "Google's space for startups. A hub for crypto founders.",
      rating: 4.6,
      reviewsCount: 420,
      recentReviewSnippet: "Met my co-founder here at the Solana meetup last Tuesday.",
      reviews: []
    },
    { 
      id: 'loc_shoreditch_1', 
      name: "Second Home Spitalfields", 
      lat: 51.519, 
      lng: -0.072, 
      type: 'coworking', 
      description: "Biophilic workspace for creatives and web3 builders.",
      rating: 4.8,
      reviewsCount: 150,
      recentReviewSnippet: "The fastest wifi in East London. Great for syncing nodes.",
      reviews: []
    },
    { 
      id: 'loc_shoreditch_2', 
      name: "Ozone Coffee Roasters", 
      lat: 51.525, 
      lng: -0.086, 
      type: 'cafe', 
      description: "Industrial-chic cafe popular with developers.",
      rating: 4.7,
      reviewsCount: 890,
      hasNewActivity: true,
      recentReviewSnippet: "Their espresso powers 50% of the commits on GitHub from London.",
      reviews: []
    },
    {
      id: 'loc_shoreditch_3',
      name: "Huckletree Shoreditch",
      lat: 51.522,
      lng: -0.088,
      type: 'coworking',
      description: "Innovation lab for gov-tech and scaling startups.",
      rating: 4.5,
      reviewsCount: 210,
      recentReviewSnippet: "Hosted a great hackathon here last weekend.",
      reviews: []
    },

    // --- ACADEMIC & KNOWLEDGE CLUSTER (Bloomsbury / British Museum) ---
    { 
      id: 'loc_bloomsbury_1', 
      name: "The British Library", 
      lat: 51.529, 
      lng: -0.127, 
      type: 'library', 
      description: "The world's largest library by number of items.",
      image: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      reviewsCount: 5200,
      hasNewActivity: true,
      recentReviewSnippet: "The reading rooms are a sanctuary for deep work. Silence is golden.",
      reviews: []
    },
    { 
      id: 'loc_bloomsbury_2', 
      name: "London Review Bookshop", 
      lat: 51.518, 
      lng: -0.122, 
      type: 'bookstore', 
      description: "Literary bookshop with an excellent cake shop attached.",
      rating: 4.8,
      reviewsCount: 450,
      recentReviewSnippet: "Found rare essays on epistemology here.",
      reviews: []
    },
    { 
      id: 'loc_bloomsbury_3', 
      name: "UCL Main Quad", 
      lat: 51.524, 
      lng: -0.134, 
      type: 'university', 
      description: "University College London, center for AI research.",
      rating: 4.7,
      reviewsCount: 1100,
      recentReviewSnippet: "The AI Centre here is doing groundbreaking work on LLMs.",
      reviews: []
    },
    { 
      id: 'loc_bloomsbury_4', 
      name: "Senate House Library", 
      lat: 51.520, 
      lng: -0.129, 
      type: 'library', 
      description: "Art Deco library tower, inspiration for '1984'.",
      rating: 4.6,
      reviewsCount: 300,
      recentReviewSnippet: "Architecturally stunning, perfect for focusing on writing.",
      reviews: []
    },

    // --- CREATIVE & RETAIL CLUSTER (Soho / Covent Garden) ---
    { 
      id: 'loc5', 
      name: "Waterstones Piccadilly", 
      lat: 51.509, 
      lng: -0.136, 
      type: 'bookstore', 
      description: "Europe's largest bookshop.",
      rating: 4.9,
      reviewsCount: 3200,
      recentReviewSnippet: "Found a rare first edition in the basement archives!",
      reviews: [
        { id: 'r3', author: 'Alex Rivera', avatar: 'A', rating: 5, text: 'A paradise for book lovers.', date: '3 hours ago' }
      ]
    },
    { 
      id: 'loc6', 
      name: "Apple Covent Garden", 
      lat: 51.512, 
      lng: -0.123, 
      type: 'store', 
      description: "Tech retail store.",
      rating: 4.5,
      reviewsCount: 890,
      hasNewActivity: true,
      recentReviewSnippet: "The Today at Apple sessions on AR art are fantastic.",
      reviews: []
    },
    { 
      id: 'loc_soho_1', 
      name: "Foyles Charing Cross", 
      lat: 51.514, 
      lng: -0.129, 
      type: 'bookstore', 
      description: "Legendary bookshop with 4 miles of shelves.",
      rating: 4.8,
      reviewsCount: 2400,
      recentReviewSnippet: "The philosophy section on the 3rd floor is unmatched.",
      reviews: []
    },
    { 
      id: 'loc_soho_2', 
      name: "The London Library", 
      lat: 51.507, 
      lng: -0.138, 
      type: 'library', 
      description: "Independent lending library established in 1841.",
      rating: 4.9,
      reviewsCount: 150,
      recentReviewSnippet: "Membership is pricey, but the access to obscure texts is worth it.",
      reviews: []
    },

    // --- SCIENCE & SOUTH KEN CLUSTER ---
    { 
      id: 'loc4', 
      name: "Imperial College", 
      lat: 51.4988, 
      lng: -0.1749, 
      type: 'university', 
      description: "World-class science and engineering university.", 
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      reviewsCount: 1542,
      hasNewActivity: true,
      recentReviewSnippet: "The quantum computing lab just published a breakthrough paper...",
      reviews: [
        { id: 'r1', author: 'Dr. Sarah Chen', avatar: 'S', rating: 5, text: 'The research facilities are unparalleled.', date: '2 days ago' },
        { id: 'r2', author: 'Marcus Graph', avatar: 'M', rating: 4, text: 'Great for networking, but the library is crowded.', date: '1 week ago' }
      ]
    },
    {
      id: 'loc_ken_1',
      name: "Science Museum",
      lat: 51.497,
      lng: -0.174,
      type: 'university', 
      description: "Inspiring the next generation of scientists.",
      rating: 4.7,
      reviewsCount: 5600,
      recentReviewSnippet: "The information age exhibit is a must-see for tech historians.",
      reviews: []
    },
    {
      id: 'loc_ken_2',
      name: "V&A National Art Library",
      lat: 51.496,
      lng: -0.172,
      type: 'library',
      description: "Public reference library for the fine and decorative arts.",
      rating: 4.9,
      reviewsCount: 320,
      recentReviewSnippet: "Quiet, beautiful, and full of design inspiration.",
      reviews: []
    },

    // --- LSE & LAW CLUSTER ---
    { 
      id: 'loc7', 
      name: "LSE Library", 
      lat: 51.514, 
      lng: -0.116, 
      type: 'library', 
      description: "Library of the London School of Economics.",
      rating: 4.7,
      reviewsCount: 650,
      recentReviewSnippet: "Best place for focused study on economics.",
      reviews: []
    },
    {
      id: 'loc_law_1',
      name: "Maughan Library",
      lat: 51.511,
      lng: -0.110,
      type: 'library',
      description: "King's College London main research library.",
      rating: 4.6,
      reviewsCount: 500,
      recentReviewSnippet: "The round reading room appeared in the Dumbledore's Office scene!",
      reviews: []
    }
];

export const INITIAL_POSTS: Post[] = [
  // --- LOCATION REVIEW POST (NEW) ---
  {
    id: 'loc-review-1',
    author: { name: 'Sophia Wise', handle: '@sophia_w', avatar: 'https://i.pravatar.cc/150?u=sophia', balance_u: 0, balance_g: 0, isGold: true, followers: 410, following: 400, isFollowing: true },
    title: "Deep Work Sanctuary Found: The British Library",
    content: "Spent the entire afternoon researching epistemology in the Reading Room. The atmosphere is incredible for focused work. Highly recommend checking out their Treasures Gallery on the way out.",
    timestamp: '20m ago',
    likes: 42,
    knowledgeValue: 75,
    comments: 5,
    shares: 2,
    tags: ['StudySpot', 'London', 'History'],
    field: 'General',
    visibility: 'public',
    contentType: 'standard',
    location: EXTRA_LOCATIONS[4] // The British Library
  },
  // --- NEW PREMIUM POST 1 ---
  {
    id: 'premium-1',
    author: { name: 'Dr. Aris K', handle: '@aris_zk', avatar: 'https://i.pravatar.cc/150?u=aris', balance_u: 0, balance_g: 0, isGold: true, followers: 3420, following: 12, isFollowing: true },
    title: "Deep Dive: The Zero-Knowledge Bottleneck in Decentralized Scaling",
    content: "Content Locked. Unlock to read the full analysis on Prover efficiency and Verifier costs in modern ZK-Rollup implementations...",
    timestamp: '1h ago',
    likes: 1240,
    knowledgeValue: 156,
    comments: 45,
    shares: 89,
    tags: ['ZK-Rollup', 'Scaling', 'Cryptography'],
    field: 'Technology',
    visibility: 'public',
    contentType: 'premium',
    premiumHint: 'Trong bài viết này, tôi sẽ phân tích 3 điểm nghẽn kỹ thuật chưa từng được công bố khiến các giải pháp ZK-Rollup hiện tại vẫn chưa đạt được tốc độ lý tưởng. Đây là kết quả từ 6 tháng nghiên cứu mã nguồn của...',
    unlockPrice: 250
  },
  // --- NEW PREMIUM POST 2 ---
  {
    id: 'premium-2',
    author: { name: 'Prof. H. Minh', handle: '@hminh_ai', avatar: 'https://i.pravatar.cc/150?u=minh', balance_u: 0, balance_g: 0, isGold: true, followers: 890, following: 150, isFollowing: false },
    title: "Logic Tri thức: Cách xây dựng Ontology cho AI thế hệ mới",
    content: "Content Locked. Unlock to access the 5-step framework for building Semantic Ontologies suitable for Large Language Models...",
    timestamp: '3h ago',
    likes: 890,
    knowledgeValue: 210,
    comments: 32,
    shares: 56,
    tags: ['AI', 'Ontology', 'Semantic Web'],
    field: 'Science',
    visibility: 'public',
    contentType: 'premium',
    premiumHint: 'Sự khác biệt giữa một mô hình AI thông thường và một hệ thống hiểu tri thức thực thụ nằm ở cấu trúc Ontology. Tôi sẽ chia sẻ khung sườn (Framework) 5 bước mà nhóm chúng tôi đã áp dụng thành công...',
    unlockPrice: 500
  },
  // --- NEW PREMIUM POST 3 ---
  {
    id: 'premium-3',
    author: { name: 'Crypto Econ Lab', handle: '@econ_lab', avatar: 'https://i.pravatar.cc/150?u=econ', balance_u: 0, balance_g: 0, isGold: false, followers: 12000, following: 0, isFollowing: true },
    title: "Sustainable Tokenomics: Tại sao cơ chế Slashing là chìa khóa của sự ổn định?",
    content: "Content Locked. Unlock to view the mathematical models optimizing Staking/Slashing ratios for PoS networks...",
    timestamp: '5h ago',
    likes: 560,
    knowledgeValue: 89,
    comments: 18,
    shares: 24,
    tags: ['Tokenomics', 'Game Theory', 'DeFi'],
    field: 'Finance',
    visibility: 'public',
    contentType: 'premium',
    premiumHint: 'Đa số các dự án thất bại vì cơ chế khuyến khích không đủ mạnh để ngăn chặn hành vi phá hoại. Bài viết này tiết lộ công thức toán học để tối ưu hóa tỷ lệ Stake/Slash...',
    unlockPrice: 120
  },
  // --- EXISTING POSTS ---
  {
    id: '1',
    author: { name: 'Elena Rust', handle: '@elena_dev', avatar: '', balance_u: 0, balance_g: 0, isGold: true, followers: 560, following: 300, isFollowing: false },
    title: "Sealevel Runtime: Parallel Transaction Execution on Solana",
    content: "Unlike EVM's single-threaded model, Solana's Sealevel runtime enables parallel processing of smart contracts. By describing all states a transaction will read or write during execution, non-overlapping transactions can execute concurrently. This architecture theoretically allows the network to scale performance with Moore's Law, rather than being bound by a single core's clock speed.",
    timestamp: '4h ago',
    likes: 842,
    knowledgeValue: 98,
    comments: 12,
    shares: 45,
    tags: ['Blockchain', 'Architecture', 'Solana'],
    field: 'Technology',
    visibility: 'public',
    contentType: 'standard'
  },
  {
    id: '2',
    author: { name: 'Marcus Graph', handle: '@marcus_g', avatar: '', balance_u: 0, balance_g: 0, followers: 230, following: 120, isFollowing: false },
    title: "Ontology Engineering in Decentralized Knowledge Graphs",
    content: "To build a truly decentralized Wikipedia, we must move beyond simple hyperlinks to semantic triples (Subject-Predicate-Object). By storing these relationships on Arweave, we create an immutable, queryable graph. The challenge lies in consensus: how do we agree on the 'truth' of a relationship without a central authority? We propose a Proof-of-Citation mechanism.",
    timestamp: '12h ago',
    likes: 315,
    knowledgeValue: 92,
    comments: 8,
    shares: 20,
    tags: ['Semantics', 'Data Structure', 'Web3'],
    field: 'Science',
    visibility: 'public',
    contentType: 'standard'
  },
  {
    id: '3',
    author: { name: 'Sophia Wise', handle: '@sophia_w', avatar: '', balance_u: 0, balance_g: 0, followers: 410, following: 400, isFollowing: true },
    title: "Epistemology of the Permaweb: Memory vs. History",
    content: "If history is written by the victors, what happens when nothing can be deleted? The Permaweb (Arweave) creates a new philosophical paradigm where 'forgetting' is impossible. This shifts the burden from preservation to curation. We are not suffering from a lack of information, but a crisis of context. Future historians will not struggle to find data, but to filter truth from the noise.",
    timestamp: '1d ago',
    likes: 156,
    knowledgeValue: 89,
    comments: 24,
    shares: 15,
    tags: ['Philosophy', 'Ethics', 'Arweave'],
    field: 'General',
    visibility: 'public',
    contentType: 'standard'
  },
  {
    id: '4',
    author: { name: 'Alex Rivera', handle: '@arivera_art', avatar: 'https://i.pravatar.cc/150?u=art', balance_u: 0, balance_g: 0, isGold: false, followers: 150, following: 80, isFollowing: false },
    title: "The Intersection of Code and Canvas: Generative Art on Solana",
    content: "Generative art represents a fundamental shift in the role of the artist. Instead of crafting the final image, the artist crafts the system (the code) that generates the image. With Solana's low fees and high throughput, we are seeing a renaissance of on-chain generative art where the code itself is immutable. Collections like DRiP are democratizing access to fine art, proving that digital scarcity doesn't have to be expensive.",
    timestamp: '2d ago',
    likes: 567,
    knowledgeValue: 88,
    comments: 1,
    shares: 89,
    tags: ['Art', 'NFT', 'Generative'],
    field: 'Art',
    visibility: 'public',
    contentType: 'standard'
  },
  {
    id: '5',
    author: { name: 'Dr. Sarah Chen', handle: '@schen_bio', avatar: 'https://i.pravatar.cc/150?u=sarah', balance_u: 0, balance_g: 0, isGold: true, followers: 1500, following: 10, isFollowing: false },
    title: "CRISPR and the Future of Personalized Medicine",
    content: "We are moving from the era of 'generalized medicine' to 'precision medicine'. CRISPR-Cas9 technology allows us to edit genes with unprecedented accuracy. The implications for treating genetic disorders like sickle cell anemia are immense. However, we must carefully navigate the ethical landscape. The distinction between 'therapy' and 'enhancement' is becoming increasingly blurred as access to these technologies widens.",
    timestamp: '3d ago',
    likes: 423,
    knowledgeValue: 95,
    comments: 1,
    shares: 120,
    tags: ['Health', 'Biohacking', 'Ethics'],
    field: 'Health',
    visibility: 'public',
    contentType: 'standard'
  },
  {
    id: '6',
    author: { name: 'Crypto Quant', handle: '@quant_fi', avatar: 'https://i.pravatar.cc/150?u=quant', balance_u: 0, balance_g: 0, isGold: false, followers: 88, following: 200, isFollowing: false },
    title: "Understanding Concentrated Liquidity in Modern AMMs",
    content: "Traditional Constant Product Market Makers (x*y=k) are notoriously capital inefficient. Most liquidity is spread across the entire price curve (0 to infinity), leaving only a fraction active at the current price. Concentrated liquidity models, like those seen in Orca Whirlpools, allow LPs to allocate capital within specific price ranges. This increases fee revenue for LPs and reduces slippage for traders, but introduces higher impermanent loss risks if prices move out of range.",
    timestamp: '4d ago',
    likes: 789,
    knowledgeValue: 97,
    comments: 1,
    shares: 67,
    tags: ['Finance', 'DeFi', 'Liquidity'],
    field: 'Finance',
    visibility: 'public',
    contentType: 'standard'
  }
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: '1',
    title: 'KIP-4: Increase Leaderboard KNOW-G Allocation',
    description: 'Proposal to increase the weekly Treasury distribution of KNOW-G tokens to the top 100 contributors from 10,000 to 15,000.',
    votesFor: 124500,
    votesAgainst: 23400,
    status: 'Active',
    endDate: '2025-11-10',
    tags: ['Treasury', 'Rewards']
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { name: 'Alisa Hester', handle: '', avatar: 'https://i.pravatar.cc/150?u=1', balance_u: 0, balance_g: 0 }, articles: 42, reviews: 158, points: 1450 },
  { rank: 2, user: { name: 'Robert Fox', handle: '', avatar: 'https://i.pravatar.cc/150?u=2', balance_u: 0, balance_g: 0 }, articles: 35, reviews: 125, points: 1320 },
  { rank: 3, user: { name: 'Jane Cooper', handle: '', avatar: 'https://i.pravatar.cc/150?u=3', balance_u: 0, balance_g: 0 }, articles: 28, reviews: 92, points: 1180 },
  { rank: 4, user: { name: 'David Kim', handle: '', avatar: 'https://i.pravatar.cc/150?u=4', balance_u: 0, balance_g: 0 }, articles: 25, reviews: 88, points: 1105 },
  { rank: 5, user: { name: 'Emily White', handle: '', avatar: 'https://i.pravatar.cc/150?u=5', balance_u: 0, balance_g: 0 }, articles: 22, reviews: 76, points: 1050 },
  { rank: 6, user: { name: 'Michael Chen', handle: '', avatar: 'https://i.pravatar.cc/150?u=6', balance_u: 0, balance_g: 0 }, articles: 19, reviews: 65, points: 980 },
  { rank: 7, user: { name: 'Sarah Jones', handle: '', avatar: 'https://i.pravatar.cc/150?u=7', balance_u: 0, balance_g: 0 }, articles: 18, reviews: 50, points: 920 },
  { rank: 8, user: { name: 'Chris Evans', handle: '', avatar: 'https://i.pravatar.cc/150?u=8', balance_u: 0, balance_g: 0 }, articles: 15, reviews: 45, points: 850 },
  { rank: 9, user: { name: 'Natalie Wu', handle: '', avatar: 'https://i.pravatar.cc/150?u=9', balance_u: 0, balance_g: 0 }, articles: 12, reviews: 38, points: 790 },
  { rank: 10, user: { name: 'Tom Wilson', handle: '', avatar: 'https://i.pravatar.cc/150?u=10', balance_u: 0, balance_g: 0 }, articles: 10, reviews: 30, points: 720 },
  { rank: 11, user: { name: 'Lisa Brown', handle: '', avatar: 'https://i.pravatar.cc/150?u=11', balance_u: 0, balance_g: 0 }, articles: 8, reviews: 25, points: 680 },
  { rank: 12, user: { name: 'James Taylor', handle: '', avatar: 'https://i.pravatar.cc/150?u=12', balance_u: 0, balance_g: 0 }, articles: 5, reviews: 15, points: 540 },
  { rank: 54, user: { name: 'John Doe', handle: '', avatar: 'https://i.pravatar.cc/150?u=john', balance_u: 0, balance_g: 0 }, articles: 2, reviews: 5, points: 234 }
];

export const MOCK_HISTORY = [
    {
        id: '1', type: 'contribution', title: 'Solana Firedancer Analysis', date: '2024-10-24', status: 'Approved', reward: '+120 KNOW-U',
        visibility: 'public', content_type: 'standard'
    },
    { id: '2', type: 'vote', title: 'KIP-3: Burn Mechanism', date: '2024-10-22', status: 'Voted Yes', reward: 'DAO' },
    { id: '3', type: 'suggestion', title: 'Fix typo in "Quantum Entanglement"', date: '2024-10-20', status: 'Pending', reward: 'Wait' },
    {
        id: '4', type: 'contribution', title: 'The future of Arweave', date: '2024-10-18', status: 'Approved', reward: '+85 KNOW-U',
        visibility: 'public', content_type: 'standard'
    },
    { id: '5', type: 'vote', title: 'KIP-2: Treasury Diversification', date: '2024-10-15', status: 'Voted No', reward: 'DAO' },
    {
        id: '6', type: 'contribution', title: 'Advanced Rust Patterns for Solana', date: '2024-10-26', status: 'Approved', reward: '+500 KNOW-U',
        visibility: 'public', content_type: 'premium', unlocks: 12
    },
    {
        id: '7', type: 'contribution', title: 'Draft: Zero Knowledge Proofs Intro', date: '2024-10-27', status: 'Draft', reward: '-',
        visibility: 'private', content_type: 'standard'
    },
    // Mock Proposals created by User
    {
        id: '8', type: 'proposal', title: 'KIP-14: Increase Creator Rewards Pool', date: '2024-10-28', status: 'Active', reward: 'Pending',
        visibility: 'public', content_type: 'standard'
    },
    {
        id: '9', type: 'proposal', title: 'KIP-9: Community Guidelines Update', date: '2024-09-15', status: 'Passed', reward: 'DAO',
        visibility: 'public', content_type: 'standard'
    }
];
