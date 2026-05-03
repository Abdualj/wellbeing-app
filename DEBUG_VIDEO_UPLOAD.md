# Debugging Video Upload Issues

## Current Status
Video uploads are not working properly. Possible causes:
1. Base64 encoded videos are too large for HTTP payload
2. Backend request size limit
3. Database field size limit
4. Frontend timeout

## Diagnosis Steps

### 1. Check Video File Size After Base64 Encoding
Base64 encoding increases file size by approximately 33%.

Example:
- Original video: 10 MB
- Base64 encoded: ~13.3 MB
- With data URL prefix: ~13.3 MB

### 2. Backend Payload Size Limits

#### Express Default Limits
```javascript
// Default: 100kb
// Need to increase in app.ts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

#### Render.com Limits
- Free tier: 512 MB RAM
- Request timeout: 90 seconds
- No explicit payload size limit mentioned

### 3. Database Constraints
```prisma
model Post {
  attachments String[]  // PostgreSQL text array - no size limit
}
```
PostgreSQL text type can store up to 1GB per field.

## Issues Found

### Issue 1: Express Body Parser Limit
**Problem:** Default Express JSON body parser limit is 100kb
**Solution:** Increase limit in `src/app.ts`

### Issue 2: Video Base64 Size
**Problem:** Videos can be 10-50MB, which becomes 13-66MB in base64
**Solution:** Either:
- A) Use cloud storage (AWS S3, Cloudinary)
- B) Compress videos client-side before upload
- C) Stream video uploads instead of base64

### Issue 3: Request Timeout
**Problem:** Large payloads take time to upload
**Solution:** Add progress indicator and increase timeout

## Recommended Solutions

### Short-term (Immediate Fix)
1. **Increase Express body size limit** to 50MB
2. **Add video compression** on frontend
3. **Better error handling** for large files

### Long-term (Production Ready)
1. **Implement cloud storage** (AWS S3 or Cloudinary)
2. **Direct upload** from frontend to storage
3. **Store URLs** in database instead of base64
4. **Add image/video optimization** pipeline

## Implementation

### Step 1: Update Backend Body Parser
File: `src/app.ts`

```typescript
// Increase body parser limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### Step 2: Add Client-Side Video Compression
Options:
- **ffmpeg.wasm** - Full video compression in browser
- **video-compress** - Simple video compression library
- **browser-image-compression** - Works for videos too

### Step 3: Test with Different Video Sizes
- ✅ Small video (< 5MB)
- ⚠️ Medium video (5-20MB)
- ❌ Large video (> 20MB)

## Testing Plan

1. **Test small video** (< 5MB)
   - Should work after increasing body limit
   
2. **Test medium video** (5-20MB)
   - May work but slow
   - Needs compression
   
3. **Test large video** (> 20MB)
   - Likely to fail
   - Needs cloud storage solution

## Error Messages to Watch For

1. **"Request Entity Too Large"** → Body parser limit
2. **"Payload Too Large"** → Nginx/proxy limit
3. **"Request Timeout"** → Upload taking too long
4. **"Unexpected Error"** → Catch-all, check backend logs
5. **"File size exceeds limit"** → Frontend validation

## Current Limits

### Frontend (mediaCompression.js)
- Images: Auto-compressed to 1920x1080, 80% quality
- Videos: Max 50MB, max 120 seconds
- File validation before upload

### Backend (needs update)
- JSON body limit: **100kb** ❌ (too small)
- URL encoded limit: **100kb** ❌ (too small)
- Need to update to: **50mb** ✅

### Database
- PostgreSQL text array: Unlimited (up to 1GB per field) ✅

## Next Steps

1. ✅ Update Express body parser limits
2. ✅ Test with small video
3. ⚠️ Add video compression library
4. 🔄 Consider cloud storage for production

---

**Date:** May 3, 2026
**Status:** In Progress
