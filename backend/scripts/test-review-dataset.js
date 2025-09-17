require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

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

// Sample data for testing
const sampleReviews = [
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    place_name: "Phở Hòa Pasteur",
    address: "260C Pasteur, Quận 3, TP.HCM",
    avg_rating: 4.2,
    total_review: 1250,
    reviewer: "Nguyễn Văn A",
    review_rating: 5,
    review_text:
      "Phở ngon tuyệt vời! Nước dùng trong, thịt tươi. Quán sạch sẽ, phục vụ nhanh 🍜👍",
    review_time: "2 months ago",
    source: "GoogleMaps",
    batch_id: 1,
  },
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    place_name: "Phở Hòa Pasteur",
    address: "260C Pasteur, Quận 3, TP.HCM",
    avg_rating: 4.2,
    total_review: 1250,
    reviewer: "Trần Thị B",
    review_rating: 4,
    review_text:
      "Phở khá ngon, giá cả hợp lý. Tuy nhiên không gian hơi chật trong giờ cao điểm.",
    review_time: "1 month ago",
    source: "GoogleMaps",
    batch_id: 1,
  },
  {
    place_id: "ChIJabcdef123456789",
    place_name: "Cơm Tấm Kiều Giang",
    address: "123 Nguyễn Thái Học, Quận 1, TP.HCM",
    avg_rating: 4.5,
    total_review: 890,
    reviewer: "Lê Văn C",
    review_rating: 5,
    review_text:
      "Cơm tấm ngon nhất khu vực! Sườn nướng thơm phức, cơm dẻo vừa phải 🍚🥩",
    review_time: "3 weeks ago",
    source: "Foody",
    batch_id: 2,
  },
  {
    place_id: "ChIJxyz789abc123def",
    place_name: "Bánh Mì Huynh Hoa",
    address: "26 Lê Thị Riêng, Quận 1, TP.HCM",
    avg_rating: 4.7,
    total_review: 2340,
    reviewer: "Mai Thị D",
    review_rating: 5,
    review_text:
      "Bánh mì đặc biệt rất ngon! Nhiều nhân, bánh giòn. Đáng đồng tiền bát gạo 🥖",
    review_time: "1 week ago",
    source: "TripAdvisor",
    batch_id: 3,
  },
  {
    place_id: "ChIJxyz789abc123def",
    place_name: "Bánh Mì Huynh Hoa",
    address: "26 Lê Thị Riêng, Quận 1, TP.HCM",
    avg_rating: 4.7,
    total_review: 2340,
    reviewer: "Hoàng Văn E",
    review_rating: 3,
    review_text:
      "Bánh mì ngon nhưng phải chờ khá lâu. Giá hơi cao so với mặt bằng chung.",
    review_time: "2 days ago",
    source: "TripAdvisor",
    batch_id: 3,
  },
];

const samplePlaces = [
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "Phở Hòa Pasteur",
    address: "260C Pasteur, Quận 3, TP.HCM",
    lat: 10.7769,
    lng: 106.6955,
    avg_rating: 4.2,
    total_review: 1250,
    source_count: 1,
  },
  {
    place_id: "ChIJabcdef123456789",
    name: "Cơm Tấm Kiều Giang",
    address: "123 Nguyễn Thái Học, Quận 1, TP.HCM",
    lat: 10.7744,
    lng: 106.6935,
    avg_rating: 4.5,
    total_review: 890,
    source_count: 1,
  },
  {
    place_id: "ChIJxyz789abc123def",
    name: "Bánh Mì Huynh Hoa",
    address: "26 Lê Thị Riêng, Quận 1, TP.HCM",
    lat: 10.7696,
    lng: 106.6924,
    avg_rating: 4.7,
    total_review: 2340,
    source_count: 1,
  },
];

async function insertSampleData() {
  console.log("🌱 Inserting sample data...");

  try {
    // Insert sample reviews
    console.log("📝 Inserting sample reviews...");
    for (const review of sampleReviews) {
      await pool.execute(
        `
        INSERT INTO reviews_raw (
          place_id, place_name, address, avg_rating, total_review,
          reviewer, review_rating, review_text, review_time, source, batch_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          review.place_id,
          review.place_name,
          review.address,
          review.avg_rating,
          review.total_review,
          review.reviewer,
          review.review_rating,
          review.review_text,
          review.review_time,
          review.source,
          review.batch_id,
        ]
      );
    }
    console.log(`✅ Inserted ${sampleReviews.length} sample reviews`);

    // Insert sample places
    console.log("🏪 Inserting sample places...");
    for (const place of samplePlaces) {
      await pool.execute(
        `
        INSERT INTO places_meta_dataset (
          place_id, name, address, lat, lng, avg_rating, total_review, source_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          avg_rating = VALUES(avg_rating),
          total_review = VALUES(total_review),
          source_count = VALUES(source_count),
          last_updated = NOW()
      `,
        [
          place.place_id,
          place.name,
          place.address,
          place.lat,
          place.lng,
          place.avg_rating,
          place.total_review,
          place.source_count,
        ]
      );
    }
    console.log(`✅ Inserted ${samplePlaces.length} sample places`);

    // Insert sample batch records
    console.log("📦 Creating sample import batches...");
    const batches = [
      {
        source: "GoogleMaps",
        description: "Sample Google Maps reviews",
        total_rows: 2,
        successful_rows: 2,
      },
      {
        source: "Foody",
        description: "Sample Foody reviews",
        total_rows: 1,
        successful_rows: 1,
      },
      {
        source: "TripAdvisor",
        description: "Sample TripAdvisor reviews",
        total_rows: 2,
        successful_rows: 2,
      },
    ];

    for (const batch of batches) {
      // Get source_id
      const [sources] = await pool.query(
        "SELECT id FROM data_sources WHERE source_name = ?",
        [batch.source]
      );
      const source_id = sources.length > 0 ? sources[0].id : null;

      await pool.execute(
        `
        INSERT INTO import_batches (
          source_id, description, total_rows, successful_rows, failed_rows, 
          completed_at, status
        ) VALUES (?, ?, ?, ?, ?, NOW(), 'completed')
      `,
        [
          source_id,
          batch.description,
          batch.total_rows,
          batch.successful_rows,
          0,
        ]
      );
    }
    console.log(`✅ Created ${batches.length} sample import batches`);
  } catch (error) {
    console.error("❌ Error inserting sample data:", error.message);
    throw error;
  }
}

async function runAnalysisQueries() {
  console.log("\n📊 Running analysis queries...");

  try {
    // Total statistics
    const [reviewCount] = await pool.query(
      "SELECT COUNT(*) as count FROM reviews_raw"
    );
    const [placeCount] = await pool.query(
      "SELECT COUNT(*) as count FROM places_meta_dataset"
    );
    const [sourceCount] = await pool.query(
      "SELECT COUNT(*) as count FROM data_sources"
    );

    console.log(`📈 Database Statistics:`);
    console.log(`   - Total Reviews: ${reviewCount[0].count}`);
    console.log(`   - Total Places: ${placeCount[0].count}`);
    console.log(`   - Data Sources: ${sourceCount[0].count}`);

    // Reviews by source
    const [bySource] = await pool.query(`
      SELECT source, COUNT(*) as review_count, AVG(review_rating) as avg_rating
      FROM reviews_raw 
      GROUP BY source 
      ORDER BY review_count DESC
    `);

    console.log(`\n📊 Reviews by Source:`);
    bySource.forEach((row) => {
      const avgRating = parseFloat(row.avg_rating) || 0;
      console.log(
        `   - ${row.source}: ${
          row.review_count
        } reviews (avg: ${avgRating.toFixed(1)}⭐)`
      );
    });

    // Top rated places
    const [topPlaces] = await pool.query(`
      SELECT name, avg_rating, total_review, address
      FROM places_meta_dataset 
      ORDER BY avg_rating DESC, total_review DESC 
      LIMIT 5
    `);

    console.log(`\n🏆 Top Rated Places:`);
    topPlaces.forEach((place, index) => {
      console.log(
        `   ${index + 1}. ${place.name} (${place.avg_rating}⭐, ${
          place.total_review
        } reviews)`
      );
      console.log(`      📍 ${place.address}`);
    });

    // Rating distribution
    const [ratingDist] = await pool.query(`
      SELECT review_rating, COUNT(*) as count
      FROM reviews_raw 
      WHERE review_rating IS NOT NULL
      GROUP BY review_rating 
      ORDER BY review_rating DESC
    `);

    console.log(`\n⭐ Rating Distribution:`);
    ratingDist.forEach((row) => {
      const stars =
        "★".repeat(row.review_rating) + "☆".repeat(5 - row.review_rating);
      console.log(`   ${stars} (${row.review_rating}): ${row.count} reviews`);
    });

    // Recent reviews
    const [recentReviews] = await pool.query(`
      SELECT r.place_name, r.reviewer, r.review_rating, 
             LEFT(r.review_text, 80) as review_excerpt, r.source
      FROM reviews_raw r
      ORDER BY r.crawltime DESC 
      LIMIT 3
    `);

    console.log(`\n🕒 Recent Reviews:`);
    recentReviews.forEach((review, index) => {
      console.log(
        `   ${index + 1}. ${review.place_name} - ${review.review_rating}⭐ (${
          review.source
        })`
      );
      console.log(`      👤 ${review.reviewer}: "${review.review_excerpt}..."`);
    });
  } catch (error) {
    console.error("❌ Error running analysis queries:", error.message);
    throw error;
  }
}

async function testPerformance() {
  console.log("\n⚡ Testing query performance...");

  try {
    console.time("Place lookup by place_id");
    await pool.query("SELECT * FROM reviews_raw WHERE place_id = ?", [
      "ChIJN1t_tDeuEmsRUsoyG83frY4",
    ]);
    console.timeEnd("Place lookup by place_id");

    console.time("Reviews by rating");
    await pool.query(
      "SELECT COUNT(*) FROM reviews_raw WHERE review_rating >= ?",
      [4]
    );
    console.timeEnd("Reviews by rating");

    console.time("Geographic query (nearby places)");
    await pool.query(
      `
      SELECT * FROM places_meta_dataset 
      WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
    `,
      [10.77, 10.78, 106.69, 106.7]
    );
    console.timeEnd("Geographic query (nearby places)");

    console.log("✅ Performance tests completed");
  } catch (error) {
    console.error("❌ Error in performance tests:", error.message);
  }
}

(async () => {
  try {
    console.log("🧪 Testing Review Dataset Database\n");

    // Check if database exists
    const [tables] = await pool.query("SHOW TABLES");
    if (tables.length === 0) {
      console.error(
        "❌ No tables found. Please run init-review-dataset.js first!"
      );
      process.exit(1);
    }

    console.log(`✅ Found ${tables.length} tables in review_dataset database`);

    // Insert sample data
    await insertSampleData();

    // Run analysis
    await runAnalysisQueries();

    // Test performance
    await testPerformance();

    console.log("\n🎉 Review dataset database test completed successfully!");
    console.log(
      "💡 The database is ready for large-scale restaurant review data import"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
