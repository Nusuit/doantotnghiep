const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const MapService = require("../services/mapService");

// Search for locations using MapBox Geocoding API
router.get("/search", authenticateJWT, async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required",
      });
    }

    const results = await MapService.searchLocation(query, parseInt(limit));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Location search error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể tìm kiếm địa điểm",
    });
  }
});

// Get directions between two points
router.get("/directions", authenticateJWT, async (req, res) => {
  try {
    const { start, end, profile = "driving" } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "Start and end coordinates are required",
      });
    }

    const directions = await MapService.getDirections(start, end, profile);

    res.json({
      success: true,
      data: directions,
    });
  } catch (error) {
    console.error("Directions error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể lấy chỉ đường",
    });
  }
});

// Get nearby places (restaurants, attractions, etc.)
router.get("/nearby", authenticateJWT, async (req, res) => {
  try {
    const { lat, lng, category = "restaurant", radius = 1000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const places = await MapService.getNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      category,
      parseInt(radius)
    );

    res.json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Nearby places error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể tìm địa điểm gần đó",
    });
  }
});

// Save user's favorite locations
router.post("/favorites", authenticateJWT, async (req, res) => {
  try {
    const { name, address, lat, lng, category } = req.body;

    if (!name || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Name, latitude, and longitude are required",
      });
    }

    const favorite = await MapService.addFavoriteLocation(req.user.id, {
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      category,
    });

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể lưu địa điểm yêu thích",
    });
  }
});

// Get user's favorite locations
router.get("/favorites", authenticateJWT, async (req, res) => {
  try {
    const favorites = await MapService.getFavoriteLocations(req.user.id);

    res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể lấy danh sách yêu thích",
    });
  }
});

// Delete favorite location
router.delete("/favorites/:favoriteId", authenticateJWT, async (req, res) => {
  try {
    const { favoriteId } = req.params;

    await MapService.deleteFavoriteLocation(req.user.id, favoriteId);

    res.json({
      success: true,
      message: "Đã xóa địa điểm yêu thích",
    });
  } catch (error) {
    console.error("Delete favorite error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể xóa địa điểm yêu thích",
    });
  }
});

module.exports = router;
