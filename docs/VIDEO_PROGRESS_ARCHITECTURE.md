# Video Progress Tracking - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. Opens Course Detail Page
         ↓
2. Fetches Video Progress for All Videos
         ↓
3. Sees Progress Bars in UI
         ↓
4. Clicks "Play" on Video
         ↓
5. Video Resumes from Last Position
         ↓
6. Watches Video (Progress Updates Every 10s)
         ↓
7. Closes Video / Navigates Away
         ↓
8. Progress Saved ✓
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      CourseDetailPage.tsx                         │
│                                                                   │
│  State:                                                           │
│  • videoProgress: { videoId: watchTime }                         │
│                                                                   │
│  On Mount:                                                        │
│  • fetchVideoProgress(materialIds[])                             │
│    └─> GET /api/progress/video/{id}/status (for each video)     │
│                                                                   │
│  Renders:                                                         │
│  • Module List with Progress Bars                                │
│  • Material List with Progress Indicators                        │
│  • VideoPlayer with initialWatchTime prop                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ passes initialWatchTime
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                        VideoPlayer.tsx                            │
│                                                                   │
│  Props:                                                           │
│  • videoId: string                                               │
│  • initialWatchTime: number (seconds)                            │
│                                                                   │
│  State:                                                           │
│  • watchTime: number                                             │
│  • duration: number                                              │
│  • isResumed: boolean                                            │
│                                                                   │
│  On Load:                                                         │
│  • video.currentTime = initialWatchTime                          │
│                                                                   │
│  Every 10 seconds:                                               │
│  • POST /api/progress/video/{id}/watch-time                      │
│    { watch_time, total_duration }                                │
│                                                                   │
│  On Unmount:                                                      │
│  • Final progress update                                         │
│                                                                   │
│  Renders:                                                         │
│  • Video Player                                                  │
│  • Progress Bar (visual indicator)                               │
│  • Time Display (X:XX / Y:YY)                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    backend/routes/progress.py                     │
│                                                                   │
│  Endpoints:                                                       │
│                                                                   │
│  1. GET /api/progress/video/<video_id>/status                    │
│     • Returns: { watch_time, total_duration, progress_% }        │
│     • Used by: CourseDetailPage on mount                         │
│                                                                   │
│  2. POST /api/progress/video/<video_id>/watch-time               │
│     • Body: { watch_time, total_duration }                       │
│     • Upserts watch_progress document                            │
│     • Auto-completes at 80%                                      │
│     • Used by: VideoPlayer every 10s                             │
│                                                                   │
│  3. GET /api/progress/course/<course_id>                         │
│     • Returns: Overall course progress                           │
│     • Includes video watch statistics                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ reads/writes
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                         MongoDB Database                          │
│                                                                   │
│  Collection: watch_progress                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ {                                                           │ │
│  │   _id: ObjectId,                                           │ │
│  │   student_id: "user123",                                   │ │
│  │   material_id: "video456",                                 │ │
│  │   course_id: "course789",                                  │ │
│  │   watch_time: 125.5,          // seconds                   │ │
│  │   total_duration: 600,         // seconds                  │ │
│  │   progress_percentage: 20.92,  // calculated               │ │
│  │   last_watched: ISODate()                                  │ │
│  │ }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Indexes:                                                         │
│  • { student_id: 1, material_id: 1 } - UNIQUE                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Scenario 1: Loading Course Page

```
┌─────────┐         ┌──────────────┐         ┌─────────┐         ┌──────────┐
│ Student │         │ CourseDetail │         │ Backend │         │ Database │
└────┬────┘         └──────┬───────┘         └────┬────┘         └────┬─────┘
     │                     │                      │                   │
     │ Opens Course        │                      │                   │
     ├────────────────────>│                      │                   │
     │                     │                      │                   │
     │                     │ GET /progress/video/1/status             │
     │                     ├─────────────────────>│                   │
     │                     │                      │ Query watch_progress
     │                     │                      ├──────────────────>│
     │                     │                      │<──────────────────┤
     │                     │<─────────────────────┤ { watch_time: 125 }
     │                     │                      │                   │
     │                     │ GET /progress/video/2/status             │
     │                     ├─────────────────────>│                   │
     │                     │                      ├──────────────────>│
     │                     │<─────────────────────┤                   │
     │                     │                      │                   │
     │ Shows Progress Bars │                      │                   │
     │<────────────────────┤                      │                   │
     │                     │                      │                   │
```

### Scenario 2: Watching Video

```
┌─────────┐         ┌──────────────┐         ┌─────────┐         ┌──────────┐
│ Student │         │ VideoPlayer  │         │ Backend │         │ Database │
└────┬────┘         └──────┬───────┘         └────┬────┘         └────┬─────┘
     │                     │                      │                   │
     │ Clicks Play         │                      │                   │
     ├────────────────────>│                      │                   │
     │                     │                      │                   │
     │                     │ video.currentTime = 125 (resume)         │
     │                     │                      │                   │
     │ Watches...          │                      │                   │
     │                     │                      │                   │
     │ (10 seconds pass)   │                      │                   │
     │                     │ POST /progress/video/1/watch-time        │
     │                     ├─────────────────────>│                   │
     │                     │ { watch_time: 135 }  │                   │
     │                     │                      │ Upsert            │
     │                     │                      ├──────────────────>│
     │                     │                      │<──────────────────┤
     │                     │<─────────────────────┤ Success           │
     │                     │                      │                   │
     │ (10 seconds pass)   │                      │                   │
     │                     │ POST /progress/...   │                   │
     │                     ├─────────────────────>│                   │
     │                     │ { watch_time: 145 }  │                   │
     │                     │                      ├──────────────────>│
     │                     │<─────────────────────┤                   │
     │                     │                      │                   │
     │ Closes Video        │                      │                   │
     ├────────────────────>│                      │                   │
     │                     │ Final Update         │                   │
     │                     ├─────────────────────>│                   │
     │                     │                      ├──────────────────>│
     │                     │                      │                   │
```

## UI Components Hierarchy

```
CourseDetailPage
│
├── Course Header
│   └── Course Stats (includes overall progress)
│
├── Tabs (Overview, Modules, Assignments)
│
├── Modules Tab
│   └── Module List
│       └── Module Card
│           ├── Module Info
│           │   ├── Title
│           │   ├── Description
│           │   └── Progress Bar ◄── Shows video progress
│           │
│           └── Materials (expandable)
│               └── Material Item
│                   ├── Icon (Video/PDF/Link)
│                   ├── Title
│                   ├── Progress Bar ◄── Shows video progress
│                   └── Actions (Play/Download)
│
└── VideoPlayer Modal (when video selected)
    ├── Video Element
    ├── Controls (native)
    └── Progress Info Panel ◄── Shows real-time progress
        ├── Progress Percentage
        ├── Time Display
        └── Progress Bar
```

## Progress Bar Visual States

```
┌─────────────────────────────────────────────────────────────┐
│ Module: Introduction to React                               │
│ 5 minutes watched                                           │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ └─ 50% progress bar (blue)                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Video Player                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [Video Content]                            │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Progress: 45.5%                          2:30 / 5:30        │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ └─ Real-time progress bar                                   │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   CourseDetailPage State                     │
│                                                              │
│  videoProgress: {                                            │
│    "video_id_1": 125.5,  // seconds watched                 │
│    "video_id_2": 450.2,                                      │
│    "video_id_3": 0       // not started                     │
│  }                                                           │
│                                                              │
│  ↓ Passed as prop                                           │
│                                                              │
│  <VideoPlayer initialWatchTime={videoProgress[videoId]} />  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    VideoPlayer State                         │
│                                                              │
│  watchTime: 125.5        // Current position                │
│  duration: 600           // Total duration                  │
│  isResumed: true         // Prevent multiple resumes        │
│                                                              │
│  ↓ Updates every frame                                      │
│                                                              │
│  Progress Bar: (watchTime / duration) * 100 = 20.92%        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Auto-Complete Logic

```
┌─────────────────────────────────────────────────────────────┐
│              Video Progress Thresholds                       │
│                                                              │
│  0% ─────────────────────────────────────────────── 100%    │
│  │                                              │            │
│  │                                              │            │
│  Not Started                                   80%          │
│                                                 │            │
│                                    Auto-Complete Trigger    │
│                                                              │
│  When progress >= 80%:                                      │
│  1. Mark material as complete                               │
│  2. Update enrollment.completed_materials[]                 │
│  3. Recalculate course progress                             │
│  4. Update UI (show checkmark)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                   Optimization Strategies                    │
│                                                              │
│  1. Throttled Updates                                       │
│     • Update every 10 seconds (not every frame)             │
│     • Reduces API calls by 600x (60fps → 0.1/s)            │
│                                                              │
│  2. Database Upsert                                         │
│     • Single operation (not find + update)                  │
│     • Atomic operation                                      │
│     • Prevents race conditions                              │
│                                                              │
│  3. Indexed Queries                                         │
│     • Compound index: (student_id, material_id)             │
│     • Query time: O(log n) instead of O(n)                  │
│                                                              │
│  4. Batch Fetching (Future)                                 │
│     • Fetch all video progress in one request               │
│     • Reduces N requests to 1 request                       │
│                                                              │
│  5. Local State Caching                                     │
│     • Store progress in React state                         │
│     • Avoid re-fetching on re-renders                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Scenarios                          │
│                                                              │
│  1. Network Failure                                         │
│     • Progress update fails                                 │
│     • Solution: Retry with exponential backoff              │
│     • Fallback: Store in localStorage                       │
│                                                              │
│  2. Invalid Token                                           │
│     • 401 Unauthorized                                      │
│     • Solution: Redirect to login                           │
│                                                              │
│  3. Video Not Found                                         │
│     • 404 Not Found                                         │
│     • Solution: Show error message                          │
│                                                              │
│  4. Database Error                                          │
│     • 500 Internal Server Error                             │
│     • Solution: Log error, show toast                       │
│                                                              │
│  5. Browser Crash                                           │
│     • Progress lost (max 10 seconds)                        │
│     • Solution: Acceptable data loss                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                   Authorization Matrix                       │
│                                                              │
│  Action                    │ Student │ Teacher │ Admin      │
│  ─────────────────────────┼─────────┼─────────┼──────────  │
│  View own progress         │    ✓    │    ✗    │    ✓       │
│  Update own progress       │    ✓    │    ✗    │    ✗       │
│  View student progress     │    ✗    │    ✓    │    ✓       │
│  View aggregate stats      │    ✗    │    ✓    │    ✓       │
│  Delete progress           │    ✗    │    ✗    │    ✓       │
│                                                              │
│  Validation:                                                 │
│  • watch_time <= total_duration                             │
│  • progress_percentage <= 100                               │
│  • student_id matches JWT token                             │
│  • material_id exists in database                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Scale Estimates                           │
│                                                              │
│  Assumptions:                                                │
│  • 10,000 students                                          │
│  • 100 videos per course                                    │
│  • 10 courses per student                                   │
│                                                              │
│  Database:                                                   │
│  • Total records: 10,000 × 100 × 10 = 10M records          │
│  • Storage per record: ~200 bytes                           │
│  • Total storage: 10M × 200B = 2GB                          │
│  • With indexes: ~3GB                                       │
│                                                              │
│  API Load:                                                   │
│  • Updates per student: 1 every 10s while watching          │
│  • Concurrent watchers: 1,000 (10% of students)             │
│  • Requests per second: 1,000 / 10 = 100 req/s              │
│  • Easily handled by single server                          │
│                                                              │
│  Optimization for Scale:                                     │
│  • Add read replicas for queries                            │
│  • Cache frequently accessed progress                       │
│  • Batch updates (queue system)                             │
│  • Shard by student_id                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a robust, scalable, and user-friendly video progress tracking system!
