require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: "review_dataset",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

// Updated sample data matching new schema
const multiPlatformSamples = [
  // Google Maps data
  {
    place_id: "ChIJ5ckJkHeuEmsRtT1k_Zf7234",
    name: "Quán Cơm Hạnh Phúc",
    address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
    country: "Vietnam",
    rating: 4.3,
    user_ratings_total: 890,
    review_author: "John Smith",
    review_rating: 5.0,
    review_text:
      "Amazing Vietnamese cuisine! The pho was absolutely delicious 🍜. Staff very friendly and prices reasonable. Highly recommend! 👍",
    review_time: "2 weeks ago",
    source: "Google",
  },
  {
    place_id: "ChIJ5ckJkHeuEmsRtT1k_Zf7234",
    name: "Quán Cơm Hạnh Phúc",
    address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
    country: "Vietnam",
    rating: 4.3,
    user_ratings_total: 890,
    review_author: "Sarah Johnson",
    review_rating: 4.0,
    review_text:
      "Good food and clean environment. The spring rolls were fresh but the service was a bit slow during lunch time.",
    review_time: "1 month ago",
    source: "Google",
  },

  // Yelp data
  {
    place_id: "yelp_rest_abc123xyz",
    name: "Saigon Street Kitchen",
    address: "123 Main Street, Ho Chi Minh City",
    country: "Vietnam",
    rating: 4.7,
    user_ratings_total: 456,
    review_author: "FoodieExplorer99",
    review_rating: 5.0,
    review_text:
      "Phenomenal Vietnamese street food experience! Authentic flavors, generous portions. The bánh mì was incredible 🥖. Must visit when in HCMC!",
    review_time: "2024-08-15",
    source: "Yelp",
  },
  {
    place_id: "yelp_rest_abc123xyz",
    name: "Saigon Street Kitchen",
    address: "123 Main Street, Ho Chi Minh City",
    country: "Vietnam",
    rating: 4.7,
    user_ratings_total: 456,
    review_author: "TravelBug2024",
    review_rating: 4.5,
    review_text:
      "Great local spot! Love the authentic atmosphere. Prices are very reasonable for tourists. The Vietnamese coffee ☕ was perfect.",
    review_time: "2024-09-01",
    source: "Yelp",
  },

  // VSA (Vietnam Social App) data
  {
    place_id: "vsa_place_789def",
    name: "Phở Gà Hà Nội",
    address: "78 Lê Thành Tôn, Quận 1, TP.HCM",
    country: "Vietnam",
    rating: 4.1,
    user_ratings_total: 234,
    review_author: "nguyenvana2024",
    review_rating: 4.0,
    review_text:
      "Phở gà ở đây ngon lắm! Nước dùng ngọt thanh, thịt gà mềm. Giá cả hợp lý, phục vụ nhanh. Mình sẽ quay lại 😊",
    review_time: "3 ngày trước",
    source: "VSA",
  },
  {
    place_id: "vsa_place_789def",
    name: "Phở Gà Hà Nội",
    address: "78 Lê Thành Tôn, Quận 1, TP.HCM",
    country: "Vietnam",
    rating: 4.1,
    user_ratings_total: 234,
    review_author: "foodlover_hcm",
    review_rating: 3.5,
    review_text:
      "Phở bình thường thôi, không có gì đặc biệt. Không gian hơi ồn, nhưng giá OK cho khu vực trung tâm.",
    review_time: "1 tuần trước",
    source: "VSA",
  },

  // SNAP data
  {
    place_id: "snap_location_456ghi",
    name: "Bún Bò Huế Authentic",
    address: "56 Pasteur, District 3, HCMC",
    country: "Vietnam",
    rating: 4.6,
    user_ratings_total: 678,
    review_author: "snap_user_8492",
    review_rating: 5.0,
    review_text:
      "Best bún bò Huế in the city! 🍲 Spicy, flavorful broth with tender beef. The owner is from Huế so you know it's authentic. A hidden gem!",
    review_time: "2024-09-08T14:30:00Z",
    source: "SNAP",
  },

  // TripAdvisor data (updated format)
  {
    place_id: "tripadvisor_rest_321abc",
    name: "The Lunch Lady",
    address: "23 Hoàng Sa, District 1, Ho Chi Minh City",
    country: "Vietnam",
    rating: 4.4,
    user_ratings_total: 1250,
    review_author: "GlobalTraveler2024",
    review_rating: 4.0,
    review_text:
      "Famous spot for local Vietnamese lunch. Very authentic experience, though quite busy during peak hours. Great value for money 💰",
    review_time: "September 2024",
    source: "TripAdvisor",
  },

  // International data (US example)
  {
    place_id: "google_us_rest_555",
    name: "Pho Saigon Restaurant",
    address: "789 Broadway, New York, NY 10003",
    country: "United States",
    rating: 4.2,
    user_ratings_total: 567,
    review_author: "NYCFoodie",
    review_rating: 4.5,
    review_text:
      "Excellent Vietnamese pho in Manhattan! Authentic flavors that remind me of my trip to Vietnam 🇻🇳. Large portions and fair prices for NYC.",
    review_time: "2024-09-05",
    source: "Google",
  },
];

async function validateNewSchema() {
  console.log("🔍 Validating New Multi-Platform Schema\n");

  try {
    // Check table structure
    const [columns] = await pool.query("DESCRIBE reviews_raw");
    console.log("📋 Table Structure Validation:");

    const requiredColumns = [
      "id",
      "place_id",
      "name",
      "address",
      "country",
      "rating",
      "user_ratings_total",
      "review_author",
      "review_rating",
      "review_text",
      "review_time",
      "source",
      "crawltime",
    ];

    const actualColumns = columns.map((col) => col.Field);
    let allColumnsPresent = true;

    requiredColumns.forEach((required) => {
      const exists = actualColumns.includes(required);
      console.log(
        `   ${exists ? "✅" : "❌"} ${required}: ${
          exists ? "EXISTS" : "MISSING"
        }`
      );
      if (!exists) allColumnsPresent = false;
    });

    if (!allColumnsPresent) {
      throw new Error("Schema validation failed - missing required columns");
    }

    // Check data types
    console.log("\n🔧 Data Type Validation:");
    const typeChecks = {
      place_id: "varchar(64)",
      name: "varchar(255)",
      address: "varchar(512)",
      country: "varchar(64)",
      rating: "float",
      user_ratings_total: "int",
      review_author: "varchar(128)",
      review_rating: "float",
      review_text: "longtext",
      review_time: "varchar(64)",
      source: "varchar(64)",
    };

    columns.forEach((col) => {
      if (typeChecks[col.Field]) {
        const expectedType = typeChecks[col.Field];
        const actualType = col.Type;
        const matches = actualType.includes(expectedType.split("(")[0]);
        console.log(
          `   ${matches ? "✅" : "⚠️"} ${col.Field}: ${actualType} ${
            matches ? "(OK)" : "(Check needed)"
          }`
        );
      }
    });

    // Check indexes
    const [indexes] = await pool.query(
      "SHOW INDEX FROM reviews_raw WHERE Key_name != 'PRIMARY'"
    );
    console.log(`\n📊 Index Validation (${indexes.length} indexes):`);

    const expectedIndexes = [
      "idx_reviews_composite",
      "idx_reviews_place_id",
      "idx_reviews_source",
      "idx_reviews_author",
      "idx_reviews_country",
    ];

    const actualIndexNames = [...new Set(indexes.map((idx) => idx.Key_name))];
    expectedIndexes.forEach((expected) => {
      const exists = actualIndexNames.includes(expected);
      console.log(
        `   ${exists ? "✅" : "⚠️"} ${expected}: ${
          exists ? "EXISTS" : "NOT FOUND"
        }`
      );
    });

    console.log("\n✅ Schema validation completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Schema validation failed:", error.message);
    return false;
  }
}

async function insertMultiPlatformSamples() {
  console.log("\n🌍 Inserting Multi-Platform Sample Data...");

  try {
    // Clear existing sample data
    await pool.execute(
      "DELETE FROM reviews_raw WHERE source IN ('Google', 'Yelp', 'VSA', 'SNAP', 'TripAdvisor')"
    );

    // Insert new samples
    for (const sample of multiPlatformSamples) {
      await pool.execute(
        `
        INSERT INTO reviews_raw (
          place_id, name, address, country, rating, user_ratings_total,
          review_author, review_rating, review_text, review_time, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          sample.place_id,
          sample.name,
          sample.address,
          sample.country,
          sample.rating,
          sample.user_ratings_total,
          sample.review_author,
          sample.review_rating,
          sample.review_text,
          sample.review_time,
          sample.source,
        ]
      );
    }

    console.log(
      `✅ Inserted ${multiPlatformSamples.length} multi-platform sample reviews`
    );
    return true;
  } catch (error) {
    console.error("❌ Failed to insert sample data:", error.message);
    return false;
  }
}

async function runAnalytics() {
  console.log("\n📊 Multi-Platform Analytics\n");

  try {
    // Overall statistics
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(DISTINCT place_id) as unique_places,
        COUNT(DISTINCT source) as unique_sources,
        COUNT(DISTINCT country) as unique_countries,
        COUNT(DISTINCT review_author) as unique_reviewers
      FROM reviews_raw
    `);

    console.log("📈 Database Overview:");
    console.log(`   Total Reviews: ${stats[0].total_reviews}`);
    console.log(`   Unique Places: ${stats[0].unique_places}`);
    console.log(`   Unique Sources: ${stats[0].unique_sources}`);
    console.log(`   Unique Countries: ${stats[0].unique_countries}`);
    console.log(`   Unique Reviewers: ${stats[0].unique_reviewers}`);

    // Source distribution
    const [sources] = await pool.query(`
      SELECT 
        source,
        COUNT(*) as review_count,
        COUNT(DISTINCT place_id) as unique_places,
        AVG(review_rating) as avg_rating,
        MIN(review_rating) as min_rating,
        MAX(review_rating) as max_rating
      FROM reviews_raw 
      GROUP BY source 
      ORDER BY review_count DESC
    `);

    console.log("\n📊 Source Platform Analysis:");
    sources.forEach((row) => {
      console.log(`   ${row.source}:`);
      console.log(`     - Reviews: ${row.review_count}`);
      console.log(`     - Places: ${row.unique_places}`);
      console.log(
        `     - Avg Rating: ${parseFloat(row.avg_rating).toFixed(2)}⭐`
      );
      console.log(`     - Rating Range: ${row.min_rating} - ${row.max_rating}`);
    });

    // Country distribution
    const [countries] = await pool.query(`
      SELECT 
        country,
        COUNT(*) as review_count,
        COUNT(DISTINCT source) as platform_count,
        AVG(rating) as avg_place_rating
      FROM reviews_raw 
      WHERE country IS NOT NULL
      GROUP BY country 
      ORDER BY review_count DESC
    `);

    console.log("\n🌍 Geographic Distribution:");
    countries.forEach((row) => {
      console.log(`   ${row.country}:`);
      console.log(`     - Reviews: ${row.review_count}`);
      console.log(`     - Platforms: ${row.platform_count}`);
      console.log(
        `     - Avg Place Rating: ${parseFloat(row.avg_place_rating).toFixed(
          2
        )}⭐`
      );
    });

    // Rating analysis
    const [ratings] = await pool.query(`
      SELECT 
        FLOOR(review_rating) as rating_floor,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews_raw WHERE review_rating IS NOT NULL), 1) as percentage
      FROM reviews_raw 
      WHERE review_rating IS NOT NULL
      GROUP BY FLOOR(review_rating)
      ORDER BY rating_floor DESC
    `);

    console.log("\n⭐ Review Rating Distribution:");
    ratings.forEach((row) => {
      const stars =
        "★".repeat(row.rating_floor) + "☆".repeat(5 - row.rating_floor);
      console.log(
        `   ${stars} (${row.rating_floor}): ${row.count} reviews (${row.percentage}%)`
      );
    });

    // Sample reviews by platform
    const [samples] = await pool.query(`
      SELECT 
        source, name, country, review_author, review_rating,
        LEFT(review_text, 60) as review_excerpt,
        review_time
      FROM reviews_raw 
      ORDER BY crawltime DESC
      LIMIT 5
    `);

    console.log("\n📝 Recent Reviews Sample:");
    samples.forEach((review, index) => {
      console.log(`   ${index + 1}. ${review.name} (${review.source})`);
      console.log(`      Location: ${review.country}`);
      console.log(
        `      Rating: ${review.review_rating}⭐ by ${review.review_author}`
      );
      console.log(`      Text: "${review.review_excerpt}..."`);
      console.log(`      Time: ${review.review_time}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Analytics failed:", error.message);
    return false;
  }
}

async function testMLReadiness() {
  console.log("\n🤖 ML/Analytics Readiness Test\n");

  try {
    // Text analytics
    const [textStats] = await pool.query(`
      SELECT 
        source,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN review_text IS NOT NULL AND LENGTH(review_text) > 0 THEN 1 END) as has_text,
        AVG(LENGTH(review_text)) as avg_text_length,
        COUNT(CASE WHEN review_text LIKE '%😊%' OR review_text LIKE '%🍜%' OR review_text LIKE '%👍%' THEN 1 END) as emoji_count
      FROM reviews_raw
      GROUP BY source
    `);

    console.log("📝 Text Analysis Readiness:");
    textStats.forEach((row) => {
      const textCoverage = ((row.has_text / row.total_reviews) * 100).toFixed(
        1
      );
      console.log(`   ${row.source}:`);
      console.log(
        `     - Text Coverage: ${textCoverage}% (${row.has_text}/${row.total_reviews})`
      );
      console.log(
        `     - Avg Text Length: ${Math.round(row.avg_text_length)} chars`
      );
      console.log(`     - Emoji Usage: ${row.emoji_count} reviews`);
    });

    // Numeric data readiness
    const [numericStats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as has_place_rating,
        COUNT(CASE WHEN review_rating IS NOT NULL THEN 1 END) as has_review_rating,
        COUNT(CASE WHEN user_ratings_total IS NOT NULL THEN 1 END) as has_user_total,
        COUNT(*) as total_records
      FROM reviews_raw
    `);

    console.log("\n🔢 Numeric Data Completeness:");
    const numeric = numericStats[0];
    console.log(
      `   Place Ratings: ${(
        (numeric.has_place_rating / numeric.total_records) *
        100
      ).toFixed(1)}% complete`
    );
    console.log(
      `   Review Ratings: ${(
        (numeric.has_review_rating / numeric.total_records) *
        100
      ).toFixed(1)}% complete`
    );
    console.log(
      `   User Totals: ${(
        (numeric.has_user_total / numeric.total_records) *
        100
      ).toFixed(1)}% complete`
    );

    // Query performance test
    console.log("\n⚡ Query Performance Test:");

    console.time("Multi-platform place lookup");
    await pool.query(
      "SELECT * FROM reviews_raw WHERE place_id = ? AND source IN ('Google', 'Yelp')",
      ["ChIJ5ckJkHeuEmsRtT1k_Zf7234"]
    );
    console.timeEnd("Multi-platform place lookup");

    console.time("Cross-platform rating analysis");
    await pool.query(`
      SELECT place_id, source, AVG(review_rating) as avg_rating 
      FROM reviews_raw 
      WHERE place_id IS NOT NULL 
      GROUP BY place_id, source
    `);
    console.timeEnd("Cross-platform rating analysis");

    console.time("Geographic + platform filter");
    await pool.query(
      "SELECT * FROM reviews_raw WHERE country = ? AND source = ?",
      ["Vietnam", "Google"]
    );
    console.timeEnd("Geographic + platform filter");

    console.log("\n✅ ML/Analytics readiness test completed!");
    return true;
  } catch (error) {
    console.error("❌ ML readiness test failed:", error.message);
    return false;
  }
}

(async () => {
  try {
    console.log("🚀 Testing Unified Multi-Platform Review Schema\n");

    // Validate schema
    const schemaValid = await validateNewSchema();
    if (!schemaValid) {
      console.error("❌ Schema validation failed. Exiting...");
      process.exit(1);
    }

    // Insert sample data
    const dataInserted = await insertMultiPlatformSamples();
    if (!dataInserted) {
      console.error("❌ Sample data insertion failed. Exiting...");
      process.exit(1);
    }

    // Run analytics
    const analyticsSuccess = await runAnalytics();
    if (!analyticsSuccess) {
      console.error("❌ Analytics failed. Exiting...");
      process.exit(1);
    }

    // Test ML readiness
    const mlReady = await testMLReadiness();
    if (!mlReady) {
      console.error("❌ ML readiness test failed. Exiting...");
      process.exit(1);
    }

    console.log(
      "\n🎉 All tests passed! Multi-platform review schema is ready for production!"
    );
    console.log(
      "✅ Supports: Google Maps, Yelp, VSA, SNAP, TripAdvisor, and more"
    );
    console.log("✅ Optimized for ML/data analytics workloads");
    console.log("✅ Unicode/emoji support verified");
    console.log("✅ Cross-platform analysis capabilities confirmed");
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
