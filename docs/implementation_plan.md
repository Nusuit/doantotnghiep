# KnowledgeShare Optimization & Features Implementation Plan

This plan covers the implementation of Mobile OAuth, Flutter Web fixes, and proposed Database Schema optimizations.

Provide a comprehensive optimization and feature set for the KnowledgeShare project across Mobile, Web, and Backend.

## User Review Required

> [!IMPORTANT]
> **Mapbox Web Support**: For Mapbox to work on Flutter Web, you might need to add Mapbox GL JS to your [web/index.html](file:///c:/Kien/Web/doantotnghiep/mobile-app/web/index.html). I will provide the script to run the app, but if the map doesn't show, we'll need to update [web/index.html](file:///c:/Kien/Web/doantotnghiep/mobile-app/web/index.html).

## Proposed Changes

### [Component] mobile-app/scripts

#### [MODIFY] [run_web.bat](file:///c:/Kien/Web/doantotnghiep/mobile-app/scripts/run_web.bat)
Updated to support Bash/Windows environments, automatic port freeing, and correct API URL.

### [Component] Database (Prisma)

#### [MODIFY] [schema.prisma](file:///c:/Kien/Web/doantotnghiep/backend/prisma/schema.prisma)
*   **Split User table:** Separate Auth/Security fields (OTP, tokens, password hash) into a `UserSecurity` table.
*   **Cleanup Legacy Tables (Priority):**
    *   Delete `restaurants`, `places`, and `otp_verifications` tables.
    *   Delete the root [prisma/schema.prisma](file:///c:/Kien/Web/doantotnghiep/prisma/schema.prisma) file (old 5-table schema) to avoid Prisma Client confusion.
*   **Remove redundant fields:** Delete `trust_level` and keep `reputation_score` for display.
*   **Upgrade `favorite_locations`:** Add `articleId`, `authorId`, and `contextId` (FKs) to maintain a live connection between the saved place and the original knowledge source/author.
*   **[NEW] `Follow` system:** Add a `Follow` table (followerId, followingId).
*   **Merge Context Reviews into Articles:**
    *   Delete the `context_reviews` table and the `stars` field.
    *   Add a `type` enum to [Article](file:///c:/Kien/Web/doantotnghiep/backend/src/services/scoring.service.ts#41-50) (e.g., `POST`, `REVIEW`).
    *   Standardize on Upvote/Downvote/Suggestion/Report for all content types.
*   **Simplify Article-Context Relationship (Strict One-to-One):**
    *   Delete the `article_contexts` junction table.
    *   Add a mandatory `contextId` field directly to the [Article](file:///c:/Kien/Web/doantotnghiep/backend/src/services/scoring.service.ts#41-50) table.
    *   *Note:* Context remains the "Subject" that makes an article unique (Location, Book info, etc.).
*   **Merge Category & Tag → `Taxonomy`:**
    *   Combine both into a single table with a `type` enum (`CATEGORY`, `TAG`).
    *   Supports both hierarchical (Category) and flat (Tag) classification.
*   **[NEW] Unified `Collection` System (Private Bookmarks & Public Series):**
    *   Replace `Series` and `FavoriteLocation` with a unified `Collection` and `CollectionItem` model.
    *   Add `isPublic` flag to `Collection`:
        *   `false`: Acts as private bookmark folders (Private World).
        *   `true`: Acts as a public `Series` (Public World).
    *   `CollectionItem` can link to an [Article](file:///c:/Kien/Web/doantotnghiep/backend/src/services/scoring.service.ts#41-50) or a [Context](file:///c:/Kien/Web/doantotnghiep/backend/src/middleware/requestContext.ts#4-15) directly.
*   **Cleanup Content Logging:**
    *   Delete `ArticleHistory` (can be handled via versioning or logs if needed later).
*   **Optimize `interactions` (Signal Store):**
    *   Role: Capture raw user behavior signals (View, TimeSpent, ScrollDepth, Report, Upvote/Downvote).
    *   *Action:* Merge the `Vote` model into `Interaction` by adding an `UPVOTE/DOWNVOTE` type to `InteractionType`.
*   **[NEW] Unified Wallet/Ledger (Economy):**
    *   Merge `PointTransaction` and `Transaction` into a single `Ledger` or `WalletTransaction` table.
    *   Distinguish by `currency` (POINTS, KNOW_U, KNOW_G).
    *   Rationale: Streamlines reward distribution and balance tracking logic in the Backend.
*   **Gamification Logic (`Badge`):**
    *   Keep `Badge` and `UserBadge` but link criteria primarily to `reputation_score` and high-quality `interactions`.

### [Component] Mobile App (iOS/Android)

#### [MODIFY] [Info.plist](file:///c:/Kien/Web/doantotnghiep/mobile-app/ios/Runner/Info.plist)
Added `CFBundleURLTypes` for `knowledgeshare://` deep link.

#### [MODIFY] [mapbox_config.dart](file:///c:/Kien/Web/doantotnghiep/mobile-app/lib/src/core/config/mapbox_config.dart)
Implemented conditional imports to prevent crashes on Flutter Web while keeping native Mapbox functionality.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Run [scripts/run_web.bat](file:///c:/Kien/Web/doantotnghiep/mobile-app/scripts/run_web.bat) from the `mobile-app` directory.
2. Verify if the app launches in Chrome.
3. Check if the `API_BASE_URL` and `MAPBOX_ACCESS_TOKEN` are correctly passed to the app.
