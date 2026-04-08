import { FeedIndexService } from "../modules/feed/feed-index.service";

// ── Mock Prisma ───────────────────────────────────────────────────────────────
const mockFindMany = jest.fn();
jest.mock("../db/prisma", () => ({
  getPrisma: () => ({ article: { findMany: mockFindMany } }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeArticles(count: number, baseScore = 100) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    createdAt: new Date(Date.UTC(2024, 0, 1) - i * 60_000),
    rankingScore: baseScore - i,
  }));
}

function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("FeedIndexService.getFeedIndex", () => {
  beforeEach(() => mockFindMany.mockReset());

  it("returns items and no nextCursor when results <= limit", async () => {
    const articles = makeArticles(3);
    mockFindMany.mockResolvedValue(articles);

    const result = await FeedIndexService.getFeedIndex(1, 10);

    expect(result.items).toHaveLength(3);
    expect(result.nextCursor).toBeUndefined();
  });

  it("returns nextCursor and trims items when results > limit", async () => {
    // getFeedIndex fetches limit+1 to detect more pages
    const articles = makeArticles(11); // limit=10 → 11 returned
    mockFindMany.mockResolvedValue(articles);

    const result = await FeedIndexService.getFeedIndex(1, 10);

    expect(result.items).toHaveLength(10);
    expect(result.nextCursor).toBeDefined();
  });

  it("encodes correct cursor fields (id, createdAt, rankingScore)", async () => {
    const articles = makeArticles(6);
    mockFindMany.mockResolvedValue(articles);

    const result = await FeedIndexService.getFeedIndex(1, 5);
    const decoded = decodeCursor(result.nextCursor!);

    expect(decoded).toMatchObject({
      id: articles[4].id,
      rankingScore: articles[4].rankingScore,
      createdAt: articles[4].createdAt.toISOString(),
    });
  });

  it("passes cursor-based where clause on second page", async () => {
    const articles = makeArticles(3);
    mockFindMany.mockResolvedValue(articles);

    // First call to get a cursor
    await FeedIndexService.getFeedIndex(1, 5);

    // Build a cursor manually
    const cursor = Buffer.from(
      JSON.stringify({ id: 5, createdAt: new Date().toISOString(), rankingScore: 95 })
    ).toString("base64url");

    mockFindMany.mockResolvedValue(makeArticles(2));
    await FeedIndexService.getFeedIndex(1, 5, cursor);

    const callArgs = mockFindMany.mock.calls[1][0];
    expect(callArgs.where).toHaveProperty("OR");
  });

  it("only returns PUBLISHED PUBLIC articles", async () => {
    mockFindMany.mockResolvedValue([]);
    await FeedIndexService.getFeedIndex(1, 10);

    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.status).toBe("PUBLISHED");
    expect(where.visibility).toBe("PUBLIC");
  });

  it("returns empty list when no articles exist", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await FeedIndexService.getFeedIndex(1, 10);
    expect(result.items).toHaveLength(0);
    expect(result.nextCursor).toBeUndefined();
  });

  it("ignores a malformed cursor and returns first page", async () => {
    mockFindMany.mockResolvedValue(makeArticles(3));
    const result = await FeedIndexService.getFeedIndex(1, 10, "not-valid-base64!!!");
    // Should not throw and should work as first-page call
    expect(result.items).toHaveLength(3);
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.OR).toBeUndefined();
  });
});
