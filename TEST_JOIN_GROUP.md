# Test: Join Group and Profile Refresh

## Steps to Test:

1. **Open Browser Console** (F12)
2. **Navigate to Groups page** (`/groups`)
3. **Join a new group**
4. **Watch the console logs** - You should see:

   ```
   [AppContext] 🔄 Profile refresh requested (count: X)
   [AppContext] 🔄 Fetching user groups...
   [AppContext] ✅ User groups fetched: X groups
   [GroupCard] 📊 Groups received: X
   [GroupCard] 📋 Groups updated at: [timestamp]
   ```

5. **Check the Profile page** - The debug panel should show:
   - Updated timestamp
   - Increased group count
   - New group in the raw data

## What to Look For:

### Console Logs:

- ✅ `triggerProfileRefresh` is called after joining
- ✅ `fetchUserGroups` is executed
- ✅ New groups data is received
- ✅ `GroupCard` component re-renders

### UI Changes:

- ✅ Debug panel timestamp updates
- ✅ Group count increases
- ✅ New group appears in the appropriate section (Created/Joined)

## If It Still Doesn't Work:

1. Check if `shouldRefreshProfile` counter is incrementing (console log)
2. Check if the API call is returning the new group
3. Check if the groups state is actually updating
4. Try manually clicking the "Refresh" button on the profile page
