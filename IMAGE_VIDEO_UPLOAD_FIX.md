# Image/Video Upload Fix

## Issue
When sharing posts with images or videos, only the text content was appearing in the posts. The images and videos were not being uploaded or displayed.

## Root Cause
The `handleCreatePost` function in `Community.jsx` was not properly handling the `imageFile` and `videoFile` data from the ShareModal component. It was only sending the `content` and `visibility` fields to the backend.

## Solution

### Backend Schema
The backend already supports attachments through the `attachments` field in the Post model:
```typescript
attachments: String[] // Array of base64-encoded images/videos
```

### Frontend Changes
Updated `frontend/src/views/Community.jsx`:

1. **Added file-to-base64 conversion helper function:**
   ```javascript
   const fileToBase64 = (file) => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = () => resolve(reader.result);
       reader.onerror = (error) => reject(error);
     });
   };
   ```

2. **Updated handleCreatePost to convert files:**
   - Convert `imageFile` and `videoFile` to base64 format
   - Add converted files to `attachments` array
   - Send attachments with the post data

3. **Data flow:**
   ```
   ShareModal (user uploads file) 
     → File object
     → handleCreatePost (converts to base64)
     → Backend API (receives base64 string)
     → Database (stores as String[])
     → Post component (displays from attachments array)
   ```

## How It Works Now

1. User selects an image or video in ShareModal
2. File is previewed using `URL.createObjectURL(file)`
3. When user clicks "Share":
   - Files are converted to base64 strings
   - Base64 strings are added to `attachments` array
   - Post data with attachments is sent to backend
4. Backend stores attachments in database
5. When fetching posts, attachments are retrieved and displayed
6. Post component checks if attachment starts with `data:image/` or `data:video/` and renders accordingly

## Files Modified
- `frontend/src/views/Community.jsx`

## Testing

To test the fix:
1. Go to https://wellspring-ws.netlify.app
2. Log in to your account
3. Click "New post"
4. Add some text content
5. Click the Photo or Video icon
6. Select an image or video file
7. Click "Share"
8. The post should now display with the image/video attached

## Technical Details

### Base64 Encoding
- Images and videos are converted to base64 data URLs
- Format: `data:image/png;base64,iVBORw0KG...` or `data:video/mp4;base64,AAAAGG...`
- Stored as strings in PostgreSQL database
- No file storage system needed

### Advantages
- ✅ Simple implementation
- ✅ No separate file storage needed
- ✅ Works with existing database schema
- ✅ No CORS issues with file access

### Considerations
- ⚠️ Base64 encoding increases file size by ~33%
- ⚠️ Large files may hit request size limits
- ⚠️ Database size will grow faster
- 💡 Future improvement: Consider using cloud storage (AWS S3, Cloudinary) for production

## Deployment Status
- ✅ Changes committed to Git
- ✅ Pushed to GitHub main branch
- 🔄 Netlify will automatically redeploy frontend
- ✅ No backend changes needed

## Date: May 3, 2026
