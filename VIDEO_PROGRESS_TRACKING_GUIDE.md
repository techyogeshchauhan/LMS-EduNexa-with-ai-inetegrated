# Video Progress Tracking System - Complete Guide

## Overview
This guide explains the persistent video progress tracking system that allows students to resume videos from where they left off and displays visual progress indicators throughout the course interface.

## Architecture

### Database Schema

#### `watch_progress` Collection
```javascript
{
  _id: ObjectId,
  student_id: String,           // User ID of the student
  material_id: String,           // Video material ID
  course_id: String,             // Course ID
  watch_time: Number,            // Current position in seconds
  total_duration: Number,        // Total video duration in seconds
  progress_percentage: Number,   // Calculated percentage (0-100)
  last_watched: DateTime         // Last update timestamp
}
```

**Indexes:**
- `{ student_id: 1, material_id: 1 }` - Unique compound index for fast lookups

## Backend Implementation

### API Endpoints

#### 1. Update Video Watch Progress
```
POST /api/progress/video/<video_id>/watch-time
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "watch_time": 125.5,      // seconds
  "total_duration": 600     // seconds
}

Response:
{
  "message": "Watch time updated"
}
```

**Features:**
- Updates progress every 10 seconds while video is playing
- Auto-marks video as complete when 80% watched
- Upserts record (creates if doesn't exist, updates if exists)

#### 2. Get Video Progress Status
```
GET /api/progress/video/<video_id>/status
Authorization: Bearer <token>

Response:
{
  "watch_time": 125.5,
  "total_duration": 600,
  "progress_percentage": 20.92,
  "last_watched": "2024-10-14T10:30:00Z"
}
```

#### 3. Get Course Progress (includes video progress)
```
GET /api/progress/course/<course_id>
Authorization: Bearer <token>

Response:
{
  "progress": {
    "course_id": "...",
    "student_id": "...",
    "overall_progress": 45.5,
    "materials": {
      "total": 10,
      "completed": 4,
      "completed_ids": ["id1", "id2", ...]
    },
    ...
  }
}
```

## Frontend Implementation

### VideoPlayer Component

**Key Features:**

1. **Resume Functionality**
   - Accepts `initialWatchTime` prop
   - Automatically seeks to last watched position on load
   - Prevents multiple resume attempts with `isResumed` state

2. **Progress Tracking**
   - Updates server every 10 seconds
   - Final update on component unmount
   - Tracks `currentTime` and `duration` in real-time

3. **Visual Progress Bar**
   - Shows percentage and time remaining
   - Blue progress indicator below video
   - Updates in real-time as video plays

**Props:**
```typescript
interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  onComplete?: () => void;
  initialWatchTime?: number;  // Resume position in seconds
}
```

**Usage:**
```tsx
<VideoPlayer
  videoId="video123"
  title="Introduction to React"
  onClose={() => setSelectedVideo(null)}
  onComplete={() => markComplete()}
  initialWatchTime={125.5}  // Resume from 2:05
/>
```

### CourseDetailPage Integration

**Features:**

1. **Fetch Video Progress on Load**
   - Loads progress for all video materials in course
   - Stores in `videoProgress` state object
   - Key: material_id, Value: watch_time in seconds

2. **Progress Indicators in Module List**
   - Shows mini progress bar under video titles
   - Displays "X minutes watched"
   - Only visible if progress > 0

3. **Progress Bars in Material List**
   - Thin progress bar under each video material
   - Tooltip shows exact time watched
   - Visual feedback before opening video

**State Management:**
```typescript
const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

// Example: { "video_id_1": 125.5, "video_id_2": 450.2 }
```

## Update Strategy - Best Practices

### 1. **Throttled Updates (Current Implementation)**
```typescript
// Update every 10 seconds while playing
const progressInterval = setInterval(updateProgress, 10000);
```

**Pros:**
- Reduces server load
- Good balance between accuracy and performance
- Minimal data loss (max 10 seconds)

**Cons:**
- Small data loss if browser crashes

### 2. **Debounced Updates (Alternative)**
```typescript
// Update after user stops seeking/pausing
const debouncedUpdate = debounce(updateProgress, 2000);
video.addEventListener('pause', debouncedUpdate);
video.addEventListener('seeked', debouncedUpdate);
```

**Pros:**
- Updates on meaningful events
- Less frequent updates

**Cons:**
- May miss progress if user closes tab quickly

### 3. **Hybrid Approach (Recommended for Production)**
```typescript
// Combine both strategies
const progressInterval = setInterval(updateProgress, 15000); // Every 15s
video.addEventListener('pause', updateProgress);
video.addEventListener('seeked', updateProgress);
window.addEventListener('beforeunload', updateProgress);
```

**Pros:**
- Best accuracy
- Handles all edge cases
- Minimal data loss

## Optimization Tips

### 1. **Batch Progress Updates**
For courses with many videos, batch fetch progress:

```typescript
// Instead of individual requests
const fetchAllVideoProgress = async (videoIds: string[]) => {
  const response = await fetch('/api/progress/videos/batch', {
    method: 'POST',
    body: JSON.stringify({ video_ids: videoIds })
  });
  return response.json();
};
```

### 2. **Local Storage Backup**
Store progress locally as backup:

```typescript
const updateProgress = async () => {
  // Save to localStorage first
  localStorage.setItem(`video_${videoId}_progress`, watchTime.toString());
  
  // Then sync to server
  await fetch('/api/progress/video/...');
};
```

### 3. **WebSocket for Real-time Updates**
For live progress tracking across devices:

```typescript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:5000/progress');

ws.onmessage = (event) => {
  const { videoId, watchTime } = JSON.parse(event.data);
  setVideoProgress(prev => ({ ...prev, [videoId]: watchTime }));
};
```

## Auto-Complete Logic

Videos are automatically marked as complete when:
- Progress reaches 80% or more
- Implemented in backend: `progress.py`

```python
if watch_progress['progress_percentage'] >= 80:
    # Mark material as complete
    # Update enrollment progress
```

**Why 80%?**
- Accounts for credits/outro
- Industry standard (YouTube, Coursera use similar)
- Prevents forcing users to watch every second

## Testing Checklist

- [ ] Video resumes from last position
- [ ] Progress updates every 10 seconds
- [ ] Progress bar shows correct percentage
- [ ] Progress persists after closing video
- [ ] Progress persists after page refresh
- [ ] Multiple videos track independently
- [ ] Progress shows in course module list
- [ ] Auto-complete triggers at 80%
- [ ] Works across different browsers
- [ ] Mobile responsive progress bars

## Common Issues & Solutions

### Issue: Video doesn't resume
**Solution:** Check that `initialWatchTime` is passed and `isResumed` state works

### Issue: Progress not saving
**Solution:** Verify JWT token is valid and progress endpoint is accessible

### Issue: Progress bar not showing
**Solution:** Ensure `videoProgress` state is populated and material IDs match

### Issue: Progress resets to 0
**Solution:** Check database indexes and upsert logic in backend

## Performance Metrics

**Expected Performance:**
- Progress update latency: < 100ms
- Database query time: < 50ms
- Frontend render time: < 16ms (60fps)
- Storage per video: ~200 bytes

**Scalability:**
- 1000 students × 100 videos = 100K records
- With indexes: < 10ms query time
- Estimated storage: ~20MB

## Future Enhancements

1. **Analytics Dashboard**
   - Average watch time per video
   - Drop-off points analysis
   - Engagement heatmaps

2. **Smart Resume**
   - Skip intro/outro automatically
   - Resume from chapter boundaries
   - "Continue watching" suggestions

3. **Offline Support**
   - Service worker for offline tracking
   - Sync when connection restored
   - Progressive Web App features

4. **Multi-device Sync**
   - Real-time progress across devices
   - "Continue on another device" feature
   - Conflict resolution for simultaneous viewing

## Security Considerations

1. **Authorization**
   - Only students can update their own progress
   - Teachers can view aggregate statistics
   - No cross-student data access

2. **Rate Limiting**
   - Limit progress updates to 1 per second
   - Prevent spam/abuse
   - Implement on backend

3. **Data Validation**
   - Validate watch_time <= total_duration
   - Sanitize all inputs
   - Check material ownership

## Conclusion

This video progress tracking system provides:
- ✅ Persistent progress across sessions
- ✅ Visual feedback throughout UI
- ✅ Optimized database queries
- ✅ Auto-completion at 80%
- ✅ Resume functionality
- ✅ Scalable architecture

The system balances user experience, performance, and data accuracy effectively.
