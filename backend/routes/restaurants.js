const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// MCP Geocoding function - Sẽ integrate với MCP server sau
async function geocodeAddress(address) {
  try {
    // Placeholder for MCP integration
    // Tạm thời dùng mock data, sau sẽ thay bằng MCP call
    console.log(`Geocoding address: ${address}`);

    // Mock geocoding - trong thực tế sẽ gọi MCP
    const mockCoordinates = {
      latitude: 10.7769 + (Math.random() - 0.5) * 0.1,
      longitude: 106.6917 + (Math.random() - 0.5) * 0.1,
    };

    return mockCoordinates;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Unable to geocode address");
  }
}

// GET /api/restaurants - Lấy tất cả restaurants do user tạo
router.get("/", async (req, res) => {
  try {
    const { userId, isActive, limit = 50, offset = 0 } = req.query;

    const whereClause = {};

    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

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
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.restaurant.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total,
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
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      userId,
      category,
      phone,
      website,
      imageUrl,
      priceLevel,
    } = req.body;

    // Validate required fields
    if (!name || !description || !address || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, address, userId",
      });
    }

    // Geocode the address using MCP
    console.log("Starting geocoding for address:", address);
    const coordinates = await geocodeAddress(address);

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: "Unable to geocode the provided address",
      });
    }

    // Create restaurant in database
    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        userId: parseInt(userId),
        category: category?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        priceLevel: priceLevel ? parseInt(priceLevel) : null,
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
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: parseInt(id),
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
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      category,
      phone,
      website,
      imageUrl,
      priceLevel,
    } = req.body;

    // Check if restaurant exists and get current data
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    let updateData = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (phone) updateData.phone = phone.trim();
    if (website) updateData.website = website.trim();
    if (imageUrl) updateData.imageUrl = imageUrl.trim();
    if (priceLevel !== undefined) updateData.priceLevel = parseInt(priceLevel);

    // If address changed, re-geocode
    if (address && address.trim() !== existingRestaurant.address) {
      console.log("Address changed, re-geocoding:", address);
      const coordinates = await geocodeAddress(address.trim());
      updateData.address = address.trim();
      updateData.latitude = coordinates.latitude;
      updateData.longitude = coordinates.longitude;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Soft delete
    await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        updatedAt: new Date(),
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
