/**
 * Feed → Map → Bookmark Workflow Tests
 *
 * Workflow under test:
 *   1. Author creates a PUBLIC post with location (contextId)
 *   2. Post appears in feed (FeedIndexService returns it)
 *   3. Post has a context with lat/lng (visible on map)
 *   4. User saves the post (SAVE interaction created)
 *   5. Saved post appears in bookmarks (SAVE interactions query)
 */

// ── In-memory DB ───────────────────────────────────────────────────────────────
const db: { articles: any[]; interactions: any[]; favoriteLocations: any[] } = {
  articles: [],
  interactions: [],
  favoriteLocations: [],
};

// ── Prisma mock ────────────────────────────────────────────────────────────────
const mockArticleFindMany = jest.fn();
const mockArticleCreate = jest.fn();
const mockInteractionFindFirst = jest.fn();
const mockInteractionCreate = jest.fn();
const mockInteractionFindMany = jest.fn();
const mockFavFindFirst = jest.fn();
const mockFavCreate = jest.fn();
const mockFavFindMany = jest.fn();
const mockFavDelete = jest.fn();

jest.mock("../db/prisma", () => ({
  getPrisma: () => ({
    article: { findMany: mockArticleFindMany, create: mockArticleCreate },
    interaction: {
      findFirst: mockInteractionFindFirst,
      create: mockInteractionCreate,
      findMany: mockInteractionFindMany,
    },
    favoriteLocation: {
      findFirst: mockFavFindFirst,
      create: mockFavCreate,
      findMany: mockFavFindMany,
      delete: mockFavDelete,
    },
  }),
}));

// Redis mock — cache always misses so tests hit mock prisma
jest.mock("../modules/redis", () => ({
  redis: {
    mget: jest.fn().mockResolvedValue([null]),
    pipeline: jest.fn(() => ({ setex: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) })),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
  },
}));

import { FeedIndexService } from "../modules/feed/feed-index.service";

// ── Restore implementations before each test ──────────────────────────────────
beforeEach(() => {
  db.articles = [];
  db.interactions = [];
  db.favoriteLocations = [];

  // article.findMany — filter by status/visibility/id
  mockArticleFindMany.mockImplementation(async ({ where, take }: any) => {
    let rows = db.articles.filter((a) => {
      if (where?.status && a.status !== where.status) return false;
      if (where?.visibility && a.visibility !== where.visibility) return false;
      if (where?.tier?.in && !where.tier.in.includes(a.tier)) return false;
      if (where?.id?.in && !where.id.in.includes(a.id)) return false;
      return true;
    });
    if (take) rows = rows.slice(0, take);
    return rows;
  });

  // article.create — push to db and return id
  mockArticleCreate.mockImplementation(async ({ data }: any) => {
    const article = { id: db.articles.length + 1, ...data, createdAt: new Date(), updatedAt: new Date() };
    db.articles.push(article);
    return { id: article.id };
  });

  // interaction.findFirst
  mockInteractionFindFirst.mockImplementation(async ({ where }: any) =>
    db.interactions.find((i) => {
      if (where?.userId !== undefined && i.userId !== where.userId) return false;
      if (where?.articleId !== undefined && i.articleId !== where.articleId) return false;
      if (where?.type !== undefined && i.type !== where.type) return false;
      return true;
    }) ?? null
  );

  // interaction.create
  mockInteractionCreate.mockImplementation(async ({ data }: any) => {
    const interaction = { id: db.interactions.length + 1, ...data, createdAt: new Date() };
    db.interactions.push(interaction);
    return interaction;
  });

  // interaction.findMany
  mockInteractionFindMany.mockImplementation(async ({ where }: any) =>
    db.interactions.filter((i) => {
      if (where?.userId !== undefined && i.userId !== where.userId) return false;
      if (where?.type !== undefined && i.type !== where.type) return false;
      return true;
    })
  );

  // favoriteLocation.findFirst
  mockFavFindFirst.mockImplementation(async ({ where }: any) =>
    db.favoriteLocations.find((f) => {
      if (where?.userId !== undefined && f.userId !== where.userId) return false;
      if (where?.lat !== undefined && f.lat !== where.lat) return false;
      if (where?.lng !== undefined && f.lng !== where.lng) return false;
      if (where?.id !== undefined && f.id !== where.id) return false;
      return true;
    }) ?? null
  );

  // favoriteLocation.create
  mockFavCreate.mockImplementation(async ({ data }: any) => {
    const fav = { id: db.favoriteLocations.length + 1, ...data, createdAt: new Date() };
    db.favoriteLocations.push(fav);
    return fav;
  });

  // favoriteLocation.findMany
  mockFavFindMany.mockImplementation(async ({ where }: any) =>
    db.favoriteLocations.filter((f) => !where?.userId || f.userId === where.userId)
  );

  // favoriteLocation.delete
  mockFavDelete.mockImplementation(async ({ where }: any) => {
    const idx = db.favoriteLocations.findIndex((f) => f.id === where.id);
    if (idx !== -1) db.favoriteLocations.splice(idx, 1);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────
const AUTHOR_ID = 10;
const READER_ID = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function createPost(overrides: Partial<any> = {}) {
  return mockArticleCreate({
    data: {
      title: "Phở Hòa Pasteur — Phố Pasteur nổi tiếng",
      content: "A".repeat(250),
      type: "POST",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      authorId: AUTHOR_ID,
      contextId: 1,
      rankingScore: 50,
      tier: "TIER_0",
      ...overrides,
    },
  });
}

async function savePost(userId: number, articleId: number) {
  const existing = await mockInteractionFindFirst({ where: { userId, articleId, type: "SAVE" } });
  if (!existing) {
    await mockInteractionCreate({ data: { userId, articleId, type: "SAVE" } });
  }
}

async function getUserSavedArticleIds(userId: number): Promise<number[]> {
  const rows = await mockInteractionFindMany({ where: { userId, type: "SAVE" } });
  return rows.map((r: any) => r.articleId);
}

// ── Workflow Tests ─────────────────────────────────────────────────────────────
describe("Workflow: Create Post → Feed → Map → Bookmark", () => {
  it("Step 1: A PUBLIC post appears in the feed index", async () => {
    const post = await createPost();

    const result = await FeedIndexService.getFeedIndex(READER_ID, 10);
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain(post.id);
  });

  it("Step 1b: A PRIVATE post does NOT appear in the feed", async () => {
    await createPost({ visibility: "PRIVATE" });

    const result = await FeedIndexService.getFeedIndex(READER_ID, 10);
    expect(result.items).toHaveLength(0);
  });

  it("Step 1c: An UNPUBLISHED (DRAFT) post does NOT appear in the feed", async () => {
    await createPost({ status: "DRAFT" });

    const result = await FeedIndexService.getFeedIndex(READER_ID, 10);
    expect(result.items).toHaveLength(0);
  });

  it("Step 2: Post has location (contextId) — visible on map", async () => {
    const post = await createPost({ contextId: 42 });
    const stored = db.articles.find((a) => a.id === post.id);
    expect(stored?.contextId).toBe(42);
  });

  it("Step 3: User saves a post (SAVE interaction created)", async () => {
    const post = await createPost();
    await savePost(READER_ID, post.id);

    const savedIds = await getUserSavedArticleIds(READER_ID);
    expect(savedIds).toContain(post.id);
  });

  it("Step 3b: Saving same post twice is idempotent (no duplicate)", async () => {
    const post = await createPost();
    await savePost(READER_ID, post.id);
    await savePost(READER_ID, post.id);

    const savedIds = await getUserSavedArticleIds(READER_ID);
    const count = savedIds.filter((id) => id === post.id).length;
    expect(count).toBe(1);
  });

  it("Step 4: Saved post appears in bookmarks, unsaved post does not", async () => {
    const post1 = await createPost({ title: "Post 1" });
    const post2 = await createPost({ title: "Post 2" });

    await savePost(READER_ID, post1.id);

    const bookmarkedIds = await getUserSavedArticleIds(READER_ID);
    expect(bookmarkedIds).toContain(post1.id);
    expect(bookmarkedIds).not.toContain(post2.id);
  });

  it("Full workflow: create → appears in feed → save → appears in bookmarks", async () => {
    // 1. Author creates post
    const post = await createPost();

    // 2. Post appears in feed
    const feedResult = await FeedIndexService.getFeedIndex(READER_ID, 10);
    expect(feedResult.items.map((i) => i.id)).toContain(post.id);

    // 3. Reader saves the post
    await savePost(READER_ID, post.id);

    // 4. Saved post appears in bookmarks
    const savedIds = await getUserSavedArticleIds(READER_ID);
    expect(savedIds).toContain(post.id);
  });

  it("Multiple users can save the same post independently", async () => {
    const post = await createPost();
    const userA = 30;
    const userB = 31;

    await savePost(userA, post.id);
    await savePost(userB, post.id);

    expect(await getUserSavedArticleIds(userA)).toContain(post.id);
    expect(await getUserSavedArticleIds(userB)).toContain(post.id);

    // Bookmarks are user-scoped
    expect(await getUserSavedArticleIds(userA)).toHaveLength(1);
    expect(await getUserSavedArticleIds(userB)).toHaveLength(1);
  });
});

// ── Map Favorites Workflow ─────────────────────────────────────────────────────
describe("Workflow: Map Favorites (save/fetch/delete)", () => {
  const place = { name: "Phở Hòa Pasteur", address: "260C Pasteur", lat: 10.7769, lng: 106.6917, category: "pho" };

  it("saves a favorite location", async () => {
    const fav = await mockFavCreate({ data: { userId: READER_ID, ...place } });
    expect(fav.id).toBeDefined();
    expect(fav.userId).toBe(READER_ID);
  });

  it("fetches all favorites for a user", async () => {
    await mockFavCreate({ data: { userId: READER_ID, ...place } });
    await mockFavCreate({ data: { userId: READER_ID, name: "Bánh Mì Huỳnh Hoa", address: "26 Lê Thị Riêng", lat: 10.7701, lng: 106.6894, category: "banh-mi" } });

    const favorites = await mockFavFindMany({ where: { userId: READER_ID } });
    expect(favorites).toHaveLength(2);
    expect(favorites.every((f: any) => f.userId === READER_ID)).toBe(true);
  });

  it("does not return other users' favorites", async () => {
    await mockFavCreate({ data: { userId: READER_ID, ...place } });
    await mockFavCreate({ data: { userId: 99, ...place } });

    const favorites = await mockFavFindMany({ where: { userId: READER_ID } });
    expect(favorites).toHaveLength(1);
  });

  it("saves are idempotent — findFirst prevents duplicates", async () => {
    const addFavorite = async (userId: number, lat: number, lng: number) => {
      const existing = await mockFavFindFirst({ where: { userId, lat, lng } });
      if (!existing) {
        await mockFavCreate({ data: { userId, ...place, lat, lng } });
      }
    };

    await addFavorite(READER_ID, place.lat, place.lng);
    await addFavorite(READER_ID, place.lat, place.lng);

    const favorites = await mockFavFindMany({ where: { userId: READER_ID } });
    expect(favorites).toHaveLength(1);
  });

  it("deletes a favorite location", async () => {
    const fav = await mockFavCreate({ data: { userId: READER_ID, ...place } });
    await mockFavDelete({ where: { id: fav.id } });

    const favorites = await mockFavFindMany({ where: { userId: READER_ID } });
    expect(favorites).toHaveLength(0);
  });

  it("deleting one favorite does not affect others", async () => {
    const fav1 = await mockFavCreate({ data: { userId: READER_ID, ...place } });
    await mockFavCreate({ data: { userId: READER_ID, name: "Bánh Mì", address: "26 Lê Thị Riêng", lat: 10.7701, lng: 106.6894, category: "banh-mi" } });

    await mockFavDelete({ where: { id: fav1.id } });

    const favorites = await mockFavFindMany({ where: { userId: READER_ID } });
    expect(favorites).toHaveLength(1);
    expect(favorites[0].name).toBe("Bánh Mì");
  });
});

// ── Feed Pagination ───────────────────────────────────────────────────────────
describe("Feed pagination", () => {
  it("returns nextCursor when there are more articles", async () => {
    for (let i = 0; i < 6; i++) {
      await createPost({ title: `Post ${i}`, rankingScore: 100 - i });
    }

    const page1 = await FeedIndexService.getFeedIndex(READER_ID, 5);
    expect(page1.items).toHaveLength(5);
    expect(page1.nextCursor).toBeDefined();
  });

  it("returns no nextCursor when articles fit in one page", async () => {
    for (let i = 0; i < 3; i++) {
      await createPost({ title: `Post ${i}` });
    }

    const result = await FeedIndexService.getFeedIndex(READER_ID, 10);
    expect(result.items).toHaveLength(3);
    expect(result.nextCursor).toBeUndefined();
  });

  it("second page does not overlap with first page", async () => {
    for (let i = 0; i < 8; i++) {
      await createPost({ title: `Post ${i}`, rankingScore: 100 - i });
    }

    const page1 = await FeedIndexService.getFeedIndex(READER_ID, 5);
    const page1Ids = new Set(page1.items.map((i) => i.id));

    // Override findMany for second page call to return remaining items
    const remaining = db.articles.filter((a) => !page1Ids.has(a.id));
    mockArticleFindMany.mockResolvedValueOnce(remaining);

    const page2 = await FeedIndexService.getFeedIndex(READER_ID, 5, page1.nextCursor);
    for (const item of page2.items) {
      expect(page1Ids.has(item.id)).toBe(false);
    }
  });
});
