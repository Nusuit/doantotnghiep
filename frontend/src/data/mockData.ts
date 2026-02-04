export const CURRENT_USER = {
    name: 'Anh Kien',
    handle: '@anhkien',
    email: 'kien@example.com',
    balance_u: 1250,
    balance_g: 500,
    avatar: 'https://github.com/shadcn.png',
    isGold: true,
    followers: 1240,
    following: 450,
    isFollowing: false
};

export const FIELDS = [
    { type: 'Technology', icon: 'memory', description: 'Blockchain, AI, IoT, and Cyber-Physical Systems.' },
    { type: 'Science', icon: 'biotech', description: 'Biology, Physics, Chemistry, and Space Exploration.' },
    { type: 'Art', icon: 'palette', description: 'Digital Art, Music, Generative Algorithms, and History.' },
    { type: 'Finance', icon: 'attach_money', description: 'DeFi, Macroeconomics, Trading Strategies, and Taxes.' },
    { type: 'Health', icon: 'medical_services', description: 'Medicine, Nutrition, Longevity, and Mental Health.' },
    { type: 'History', icon: 'history_edu', description: 'Ancient Civilizations, Wars, Politics, and Archival.' },
];

export const FEATURED_TAGS = ['Zero-Knowledge', 'Solana', 'Longevity', 'Generative Art', 'Macroeconomics', 'Rust'];

export const SCHOLARS_OF_WEEK = [
    { id: 1, name: 'Dr. Sarah Chen', rank: 'Professor', ks: '2,420', field: 'Bio', bg: 'bg-emerald-900', text: 'text-emerald-100' },
    { id: 2, name: 'Marcus Graph', rank: 'Expert', ks: '980', field: 'Data', bg: 'bg-slate-800', text: 'text-slate-100' },
    { id: 3, name: 'Elena Rust', rank: 'Doctor', ks: '1,520', field: 'Tech', bg: 'bg-indigo-900', text: 'text-indigo-100' },
    { id: 4, name: 'Alex Rivera', rank: 'Scholar', ks: '450', field: 'Art', bg: 'bg-stone-800', text: 'text-stone-100' },
];

export const MOCK_COMMENTS: Record<string, any[]> = {
    '1': [
        { id: 1, author: 'Alice', content: 'Great insights!', timestamp: '2h ago', likes: 5 },
        { id: 2, author: 'Bob', content: 'I disagree with the second point.', timestamp: '1h ago', likes: 2 },
    ]
};

export const MOCK_LEADERBOARD = [
    { user: { name: 'Dr. Sarah Chen', handle: '@schen' }, points: 52420, rank: 1, articles: 42, reviews: 156 },
    { user: { name: 'Marcus Graph', handle: '@marcus' }, points: 14980, rank: 2, articles: 28, reviews: 312 },
    { user: { name: 'Elena Rust', handle: '@erust' }, points: 8520, rank: 3, articles: 15, reviews: 89 },
    { user: { name: 'Alex Rivera', handle: '@arivera' }, points: 3450, rank: 4, articles: 12, reviews: 45 },
    { user: { name: 'Jordan Lee', handle: '@jlee' }, points: 2100, rank: 5, articles: 8, reviews: 32 },
    { user: { name: 'Casey Wu', handle: '@cwu' }, points: 1800, rank: 6, articles: 7, reviews: 21 },
    { user: { name: 'Sam Smith', handle: '@ssmith' }, points: 950, rank: 7, articles: 5, reviews: 12 },
    { user: { name: 'Taylor Doe', handle: '@tdoe' }, points: 800, rank: 8, articles: 3, reviews: 18 },
    { user: { name: 'Morgan Kim', handle: '@mkim' }, points: 600, rank: 9, articles: 2, reviews: 10 },
    { user: { name: 'Jamie Fox', handle: '@jfox' }, points: 400, rank: 10, articles: 1, reviews: 5 },
];

export const RICH_PROPOSALS = [
    {
        id: 'KIP-12',
        type: 'Treasury',
        title: 'Allocate 10,000 KNOW-G for Content Creators Fund',
        description: 'Establish a monthly grant pool for high-impact technical writers. This proposal seeks to incentivize deep-dive technical analysis by allocating a dedicated stream from the Community Treasury.',
        author: '0x9a...3f12',
        status: 'Active',
        endDate: '2 days',
        quorum: 60, // % needed to pass
        votes: {
            yes: 65,
            no: 25,
            abstain: 10
        },
        totalVotes: 142050,
        arweaveTx: 'ar://8x9s...kL2m',
        solanaSlot: 2459102
    },
    {
        id: 'KIP-11',
        type: 'Protocol',
        title: 'Update Knowledge Score Algorithm v2.0',
        description: 'Refine the weighting of citations and peer reviews in KS calculation. The current algorithm over-indexes on comment volume rather than semantic depth.',
        author: 'Dr. E. Rust',
        status: 'Passed',
        endDate: 'Ended Oct 24',
        quorum: 50,
        votes: {
            yes: 88,
            no: 12,
            abstain: 0
        },
        totalVotes: 89000,
        arweaveTx: 'ar://3nF1...p9Xq',
        solanaSlot: 2451000
    },
    {
        id: 'KIP-10',
        type: 'Parameter',
        title: 'Reduce Slashing Penalty for Minor Edits',
        description: 'Currently, rejected edits result in a 100% stake burn. This proposal suggests lowering the penalty to 20% for edits classified as "Stylistic" to encourage more participation.',
        author: 'Marcus Graph',
        status: 'Defeated',
        endDate: 'Ended Oct 15',
        quorum: 50,
        votes: {
            yes: 30,
            no: 65,
            abstain: 5
        },
        totalVotes: 56000,
        arweaveTx: 'ar://1aZ9...m2Vb',
        solanaSlot: 2445000
    }
];

export const TOP_DELEGATES = [
    { name: 'Dr. Sarah Chen', handle: '@schen', power: '2.4M', trust: 98 },
    { name: 'Marcus Graph', handle: '@marcus', power: '1.8M', trust: 95 },
    { name: 'DAO Steward', handle: '@steward', power: '1.1M', trust: 92 },
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
    {
        id: '8', type: 'proposal', title: 'KIP-14: Increase Creator Rewards Pool', date: '2024-10-28', status: 'Active', reward: 'Pending',
        visibility: 'public', content_type: 'standard'
    },
    {
        id: '9', type: 'proposal', title: 'KIP-9: Community Guidelines Update', date: '2024-09-15', status: 'Passed', reward: 'DAO',
        visibility: 'public', content_type: 'standard'
    }
];
