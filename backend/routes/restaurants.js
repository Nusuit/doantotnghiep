const express = require("express");
const router = express.Router();
const { z } = require("zod");

const requireAuth = require("../middleware/requireAuth");
const { getPrisma } = require("../db/prisma");

// MCP Geocoding function - Sẽ integrate với MCP server sau
async function geocodeAddress(address) {
  try {
    // Placeholder for MCP integration
    // Tạm thời dùng mock data, sau sẽ thay bằng MCP call
    console.log(`Geocoding address: ${address}`);

    // Deterministic mock geocoding (stable per address)
    const baseLat = 10.7769;
    const baseLng = 106.6917;
    const str = String(address || "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const latOffset = ((hash % 1000) / 1000 - 0.5) * 0.1;
    const lngOffset = (((hash / 1000) % 1000) / 1000 - 0.5) * 0.1;
    return {
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Unable to geocode address");
  }
}

const listQuerySchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const createBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  imageUrl: z.string().optional(),
  priceLevel: z.coerce.number().int().min(0).max(5).optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const updateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    category: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    imageUrl: z.string().optional(),
    priceLevel: z.coerce.number().int().min(0).max(5).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

// GET /api/restaurants - Lấy tất cả restaurants do user tạo
router.get("/", async (req, res) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query params",
        issues: parsed.error.issues,
      });
    }

    const { userId, isActive, limit, offset } = parsed.data;
    const prisma = getPrisma();

    const whereClause = {};

    // Default: only active restaurants for public listing
    whereClause.isActive = isActive === undefined ? true : isActive;

    if (userId) whereClause.userId = userId;

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            // Remove profile relationship for now to avoid errors
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.restaurant.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
});

// POST /api/restaurants - Tạo restaurant mới
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid body",
        issues: parsed.error.issues,
      });
    }

    const prisma = getPrisma();
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      category,
      phone,
      website,
      imageUrl,
      priceLevel,
    } = parsed.data;

    const coordinates =
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude }
        : await geocodeAddress(address);

    // Create restaurant in database
    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        userId: req.user.id,
        category: category?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        priceLevel: priceLevel ?? null,
        isActive: true,
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: {
        restaurant,
        coordinates,
      },
    });
  } catch (error) {
    console.error("Create restaurant error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Restaurant with this information already exists",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
      error: error.message,
    });
  }
});

// GET /api/restaurants/:id - Lấy thông tin một restaurant
router.get("/:id", async (req, res) => {
  try {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
        issues: parsedParams.error.issues,
      });
    }

    const prisma = getPrisma();
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: parsedParams.data.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.json({
      success: true,
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
      error: error.message,
    });
  }
});

// PUT /api/restaurants/:id - Cập nhật restaurant
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
        issues: parsedParams.error.issues,
      });
    }
    const parsedBody = updateBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid body",
        issues: parsedBody.error.issues,
      });
    }

    const prisma = getPrisma();
    const { id } = parsedParams.data;
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      category,
      phone,
      website,
      imageUrl,
      priceLevel,
      isActive,
    } = parsedBody.data;

    // Check if restaurant exists and get current data
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (existingRestaurant.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    let updateData = {};

    // Only update fields that are provided
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (phone) updateData.phone = phone.trim();
    if (website) updateData.website = website.trim();
    if (imageUrl) updateData.imageUrl = imageUrl.trim();
    if (priceLevel !== undefined) updateData.priceLevel = priceLevel;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (address && address.trim() !== existingRestaurant.address) {
      updateData.address = address.trim();
    }

    if (latitude !== undefined && longitude !== undefined) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    } else if (address && address.trim() !== existingRestaurant.address) {
      console.log("Address changed, re-geocoding:", address);
      const coordinates = await geocodeAddress(address.trim());
      updateData.latitude = coordinates.latitude;
      updateData.longitude = coordinates.longitude;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Restaurant updated successfully",
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
      error: error.message,
    });
  }
});

// DELETE /api/restaurants/:id - Xóa restaurant (soft delete)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
        issues: parsedParams.error.issues,
      });
    }

    const prisma = getPrisma();
    const { id } = parsedParams.data;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // Soft delete
    await prisma.restaurant.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant",
      error: error.message,
    });
  }
});

module.exports = router;
