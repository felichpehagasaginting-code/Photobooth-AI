---
Task ID: 3
Agent: Backend API Developer
Task: Build backend API routes

Work Log:
- Read Prisma schema and database configuration
- Created 13 API route files under /src/app/api/
- Tested all endpoints via curl to verify functionality
- Seeded database with default admin, 3 packages, and 8 filters
- Verified all routes return proper HTTP status codes and JSON responses

Stage Summary:
- All 13 API routes created and tested successfully:
  1. GET /api/seed - Seeds database (idempotent, reports created/already_exists)
  2. GET /api/packages - Returns active packages sorted by sortOrder
  3. GET /api/filters - Returns active filters with optional ?category= filter
  4. POST /api/transactions - Creates transaction with auto-generated orderId (PB-{ts}-{rand})
  5. GET /api/transactions/[id]/status - Returns transaction status with package and photo info
  6. POST /api/transactions/[id]/pay - Simulates QRIS payment, generates UUID download token, 24h expiry
  7. POST /api/photos/upload - Saves original+filtered photos to public/photos/{txId}/, creates Photo DB record
  8. POST /api/admin/login - PIN-based admin auth, returns base64 token
  9. GET /api/admin/stats - Dashboard stats (sessions, revenue, today stats, recent transactions)
  10. GET /api/admin/transactions - Paginated transaction list (?page=&limit=)
  11. GET/PUT /api/admin/packages - List all packages (including inactive) / update package
  12. GET/PUT /api/admin/filters - List all filters (including inactive) / update filter
  13. POST /api/generate-filter - AI filter generation using z-ai-web-dev-sdk image edit API
- Database seeded with default admin (pin: 123456), 3 packages (Basic/Standard/Premium), 8 filters (Anime Ghibli, Anime Shonen, Watercolor, Cyberpunk Neon, Vintage Film, AI Beauty, Fantasy Background, Comic Book)
- All endpoints return proper error responses with appropriate status codes
