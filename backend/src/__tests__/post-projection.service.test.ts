import { PostProjectionService } from "../modules/posts/post-projection.service";

// ── Mock state ────────────────────────────────────────────────────────────────
const mockMget = jest.fn();
const mockSetex = jest.fn().mockReturnThis();
const mockExec = jest.fn().mockResolvedValue([]);
const mockPipelineObj = { setex: mockSetex, exec: mockExec };

jest.mock("../modules/redis", () => ({
  redis: {
    mget: (...args: any[]) => mockMget(...args),
    pipeline: () => mockPipelineObj,
  },
}));

const mockFindMany = jest.fn();
jest.mock("../db/prisma", () => ({
  getPrisma: () => ({ article: { findMany: mockFindMany } }),
}));

// ── Sample DB Article ─────────────────────────────────────────────────────────
function makeDbArticle(id: number) {
  return {
    id,
    title: `Post ${id}`,
    content: "A".repeat(400),
    createdAt: new Date("2024-01-01T00:00:00Z"),
    author: {
      profile: { displayName: "Test User", avatarUrl: "https://example.com/avatar.jpg" },
      email: "test@example.com",
    },
    taxonomies: [
      { taxonomy: { type: "CATEGORY", name: "Place-based Knowledge", slug: "PLACE_BASED_KNOWLEDGE" } },
      { taxonomy: { type: "TAG", name: "Food & Restaurant", slug: "food-restaurant" } },
    ],
    context: { name: "Phở Hòa Pasteur", latitude: 10.7769, longitude: 106.6917 },
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockMget.mockReset();
  mockFindMany.mockReset();
  mockSetex.mockClear();
  mockExec.mockClear().mockResolvedValue([]);
  mockSetex.mockReturnThis();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("PostProjectionService.getProjections", () => {
  it("returns empty map for empty ids", async () => {
    const result = await PostProjectionService.getProjections([]);
    expect(result.size).toBe(0);
    expect(mockMget).not.toHaveBeenCalled();
  });

  it("uses cached projections when available (no DB call)", async () => {
    const projection = { id: 1, title: "Post 1", excerpt: "A", author: { name: "Test User", avatar: "" }, tags: [], category: null, location: null, createdAt: "" };
    mockMget.mockResolvedValue([JSON.stringify(projection)]);

    const result = await PostProjectionService.getProjections([1]);

    expect(result.size).toBe(1);
    expect(result.get(1)).toMatchObject({ id: 1, title: "Post 1" });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("fetches from DB on cache miss", async () => {
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([makeDbArticle(2)]);

    const result = await PostProjectionService.getProjections([2]);

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(result.size).toBe(1);
    expect(result.get(2)).toMatchObject({ id: 2, title: "Post 2" });
  });

  it("extracts correct location from context", async () => {
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([makeDbArticle(3)]);

    const result = await PostProjectionService.getProjections([3]);
    const projection = result.get(3)!;

    expect(projection.location).toEqual({
      name: "Phở Hòa Pasteur",
      lat: 10.7769,
      lng: 106.6917,
    });
  });

  it("truncates content to 150 chars for excerpt", async () => {
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([makeDbArticle(4)]);

    const result = await PostProjectionService.getProjections([4]);
    const projection = result.get(4)!;

    expect(projection.excerpt.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(projection.excerpt.endsWith("...")).toBe(true);
  });

  it("extracts tags and category correctly", async () => {
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([makeDbArticle(5)]);

    const result = await PostProjectionService.getProjections([5]);
    const projection = result.get(5)!;

    expect(projection.tags).toContain("Food & Restaurant");
    expect(projection.category?.slug).toBe("PLACE_BASED_KNOWLEDGE");
  });

  it("deduplicates ids before querying", async () => {
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([makeDbArticle(6)]);

    await PostProjectionService.getProjections([6, 6, 6]);

    expect(mockMget).toHaveBeenCalledWith(["post_projection:6"]);
  });

  it("handles Redis mget error gracefully and falls back to DB", async () => {
    mockMget.mockRejectedValue(new Error("Redis connection refused"));
    mockFindMany.mockResolvedValue([makeDbArticle(7)]);

    const result = await PostProjectionService.getProjections([7]);
    expect(result.size).toBe(1);
  });

  it("falls back to email username when no profile displayName", async () => {
    const article = makeDbArticle(8);
    article.author.profile = null as any;
    mockMget.mockResolvedValue([null]);
    mockFindMany.mockResolvedValue([article]);

    const result = await PostProjectionService.getProjections([8]);
    expect(result.get(8)!.author.name).toBe("test");
  });
});
