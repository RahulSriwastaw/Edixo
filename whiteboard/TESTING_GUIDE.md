# Testing & Verification Guide

## 🧪 How to Test the Implementation

### Prerequisites
- Flutter app properly set up
- Backend API endpoints implemented (see BACKEND_INTEGRATION_GUIDE.md)
- Test PDFs or whiteboard content ready
- Debug device/emulator configured

---

## 🎯 Quick Smoke Test (5 minutes)

### Step 1: Initialize Worker Pool
```dart
// In main.dart or app start
void main() {
  runApp(const MyApp());
  // Initialize worker pool on startup
  BackgroundPdfWorker.instance.initialize();
}
```

**Verify:** No crashes, console shows initialization message

### Step 2: Test End Class Dialog
```dart
// In your test UI
FloatingActionButton(
  onPressed: () => showDialog(
    context: context,
    builder: (context) => const EndClassDialog(),
  ),
  child: const Icon(Icons.stop),
)
```

**Expected behavior:**
1. Dialog appears with session info
2. Click "End & Arrange"
3. Page arrangement panel shows
4. Progress dialog appears
5. UI remains responsive

### Step 3: Verify No UI Freeze
**While PDF is generating:**
- Scroll other content ✓ Should work smoothly
- Tap buttons ✓ Should respond
- Interact with app ✓ Should be responsive

**Result:** If UI is smooth → Implementation working! ✅

---

## 📊 Detailed Testing Scenarios

### Scenario 1: Small PDF (< 1MB)

**Test Data:**
```dart
final slides = [
  imageBytes1,  // ~100KB
  imageBytes2,  // ~100KB
  imageBytes3,  // ~100KB
  // ... 5 slides total = ~500KB PDF
];
```

**Expected Flow:**
```
1. Click "End Class"          → Dialog appears
2. Arrange pages              → Selection works
3. Click "Confirm"            → Progress dialog shows
4. "Preparing slides" (0-15%) → Takes ~1s
5. "Generating PDF" (15-65%)  → Takes ~2s (background)
6. "Uploading" (70-100%)      → Takes ~1s (direct upload)
7. Success notification       → File saved ✅
```

**Performance:**
- Time: ~4-5 seconds total
- Memory: ~150MB peak
- UI: Stays responsive ✓

---

### Scenario 2: Large PDF (50-100MB)

**Test Data:**
```dart
final slides = [
  // 100+ slides with images
  // Total PDF size: 50-100MB
];
```

**Expected Flow:**
```
1. Click "End Class"               → Dialog appears
2. Arrange pages                   → Selection works
3. Click "Confirm"                 → Progress dialog shows
4. "Preparing slides" (0-15%)      → Takes ~2s
5. "Generating PDF" (15-65%)       → Takes ~8-10s (background)
   - Shows progress: 20%, 40%, 60%
   - UI remains responsive during this
6. "Uploading" (70-100%)           → Shows chunks
   - Chunk 1: POST /upload-chunk
   - Chunk 2: POST /upload-chunk
   - Chunk 3: POST /upload-chunk
   - ... (1MB each)
   - Then: POST /finalize-upload
7. Success notification            → File saved ✅
```

**Performance:**
- Time: ~15-20 seconds total
- Memory: ~300-350MB peak (steady)
- UI: Stays responsive ✓
- Upload: Uses chunking ✓

---

### Scenario 3: Multiple Concurrent Exports

**Test Data:**
```dart
// Open 3 tabs/windows, each trying to export simultaneously
```

**Expected Flow:**
```
Export 1: Queued (HIGH PRIORITY)
Export 2: Queued (NORMAL)
Export 3: Queued (NORMAL)
           ↓
    Worker pool processes:
    - Export 1: Worker 1 generating PDF
    - Export 2: Worker 2 generating PDF (parallel)
    - Export 3: Waiting...
           ↓
    Export 1 completes → Worker 1 free
    Export 3 moves to Worker 1
           ↓
    Export 2 uploads (while 3 still generating)
           ↓
    All complete within ~25s ✓
```

**Verification:**
- All 3 complete successfully
- No conflicts or corruption
- Progress shown for each
- Total time: ~25s (vs 60s if sequential)

---

## 🔍 Manual Testing Checklist

### Dialog UI Tests
- [ ] Dialog appears when triggered
- [ ] Page arrangement panel displays all pages
- [ ] Can select/deselect pages
- [ ] "Confirm" button enables/disables properly
- [ ] "Cancel" closes dialog
- [ ] Progress dialog shows during export
- [ ] Progress bar animates smoothly
- [ ] Status text updates in real-time
- [ ] Success message appears after completion

### Performance Tests
- [ ] UI remains responsive during PDF generation
- [ ] No stutter or jank visible
- [ ] Memory usage stays < 400MB
- [ ] Battery drain is acceptable (background processing)
- [ ] CPU usage reasonable (not maxing out)

### Error Handling Tests
- [ ] Network error → Shows retry message
- [ ] Invalid page selection → Shows error
- [ ] Large file timeout → Shows timeout error
- [ ] Upload cancellation → Cleans up properly
- [ ] Out of memory → Graceful handling

### Queue Tests
- [ ] Queue accepts multiple tasks
- [ ] Priority tasks complete first
- [ ] Statistics tracking works
- [ ] Events stream emits correctly
- [ ] Timeout triggers after 10 minutes

### Upload Tests
- [ ] Small file uses direct upload
- [ ] Large file uses chunked upload
- [ ] Retry works on network error
- [ ] Progress calculation accurate
- [ ] ETA countdown works
- [ ] Upload can be cancelled

---

## 📱 Device Testing

### On Emulator
```bash
# Launch emulator
flutter emulators launch emulator-5554

# Run app
flutter run -d emulator-5554

# Monitor performance
flutter run -d emulator-5554 --profile
```

### On Physical Device
```bash
# Connect device
flutter devices

# Run app
flutter run -d <device_id>

# Check logs
flutter logs -d <device_id>
```

---

## 🧠 Debug Commands

### Check Worker Pool Status
```dart
debugPrint('Worker initialized: ${BackgroundPdfWorker.instance.isInitialized}');
```

### Monitor Queue
```dart
var stats = PdfGenerationQueue.instance.getStats();
debugPrint('''
  Pending: ${stats.pendingTasks}
  Priority: ${stats.priorityTasks}
  Active: ${stats.activeTasks}
  Is Idle: ${stats.isIdle}
''');
```

### Subscribe to Queue Events
```dart
PdfGenerationQueue.instance.events.listen((event) {
  debugPrint('Queue Event: ${event.type} - ${event.taskId}');
});
```

### Check Upload Progress
```dart
onProgress: (uploadProgress) {
  debugPrint('Upload: ${uploadProgress.formattedProgress}');
  debugPrint('ETA: ${uploadProgress.estimatedRemaining}');
}
```

---

## 🌐 Backend API Testing

### Test Direct Upload
```bash
curl -X POST http://localhost:4000/api/whiteboard/sets/test_set/whiteboard-pdf \
  -F "file=@test.pdf" \
  -F "totalPages=10" \
  -F "fileSize=2.50"
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "data": {
    "fileUrl": "uploads/whiteboard/class_notes_test_set_1234567890.pdf",
    "fileName": "class_notes_test_set_1234567890.pdf",
    "fileSize": 2621440,
    "totalPages": 10
  }
}
```

### Test Chunked Upload
```bash
# Chunk 1
curl -X POST http://localhost:4000/api/whiteboard/sets/test_set/upload-chunk \
  -F "uploadId=1712720000000_12345" \
  -F "chunkIndex=0" \
  -F "totalChunks=2" \
  -F "chunk=@chunk_0.bin"

# Chunk 2
curl -X POST http://localhost:4000/api/whiteboard/sets/test_set/upload-chunk \
  -F "uploadId=1712720000000_12345" \
  -F "chunkIndex=1" \
  -F "totalChunks=2" \
  -F "chunk=@chunk_1.bin"

# Finalize
curl -X POST http://localhost:4000/api/whiteboard/sets/test_set/finalize-upload \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "1712720000000_12345",
    "fileName": "class_notes_test_set.pdf",
    "totalPages": 50,
    "totalSize": 52428800
  }'
```

---

## 📈 Performance Benchmarking

### Measure PDF Generation Time
```dart
final stopwatch = Stopwatch()..start();
final pdf = await PdfGenerationQueue.instance.enqueueTask(...);
stopwatch.stop();
debugPrint('PDF generation: ${stopwatch.elapsedMilliseconds}ms');
```

### Measure Upload Time
```dart
final stopwatch = Stopwatch()..start();
await uploadService.uploadPdfWithStreaming(...);
stopwatch.stop();
debugPrint('Upload time: ${stopwatch.elapsedMilliseconds}ms');
```

### Memory Profiling
```dart
// On physical device
# Use Android Studio Profiler or:
adb shell dumpsys meminfo package_name

# iOS
# Use Xcode Instruments
```

---

## ✅ Test Results Template

### Run this test and record results:

```
Date: __________
Device: __________
OS Version: __________
Flutter Version: __________

TEST SCENARIO: Small PDF Export (< 1MB)
✓ Dialog appears:          YES / NO
✓ Page arrangement works:  YES / NO
✓ PDF generated:           YES / NO (time: ___ s)
✓ Upload successful:       YES / NO (time: ___ s)
✓ UI responsive:           YES / NO
✓ Memory usage:            ___ MB (expected < 200MB)
✓ Total time:              ___ s (expected 4-5s)

ISSUES: ___________________________________________________________

TEST SCENARIO: Large PDF Export (50+ MB)
✓ Dialog appears:          YES / NO
✓ Page arrangement works:  YES / NO
✓ PDF generated:           YES / NO (time: ___ s)
✓ Chunking used:           YES / NO (chunks: ___)
✓ Upload successful:       YES / NO (time: ___ s)
✓ UI responsive:           YES / NO
✓ Memory usage:            ___ MB (expected < 400MB)
✓ Total time:              ___ s (expected 15-20s)

ISSUES: ___________________________________________________________

TEST SCENARIO: Concurrent Exports (3 simultaneous)
✓ All queued:              YES / NO
✓ Parallel processing:     YES / NO
✓ All completed:           YES / NO
✓ No conflicts:            YES / NO
✓ Total time:              ___ s (expected ~25s)

ISSUES: ___________________________________________________________

OVERALL STATUS: PASS / FAIL
"""
```

---

## 🚨 Common Issues & Solutions

### Issue: "Worker pool not initialized"
**Test:**
```dart
assert(BackgroundPdfWorker.instance.isInitialized);
```
**Fix:** Call `BackgroundPdfWorker.instance.initialize()` on app startup

---

### Issue: "UI still freezes"
**Test:**
```dart
// Measure frame time while generating
// Should stay ~60fps (16ms/frame)
```
**Fix:** Check if workers are actually spawning:
```dart
debugPrint('Isolates: ${BackgroundPdfWorker.instance._isolates.length}');
```

---

### Issue: "Upload timeout errors"
**Test:** Increase timeout in config
**Solution:**
```dart
config = ChunkedUploadConfig(
  timeout: Duration(minutes: 5), // Was 2
);
```

---

### Issue: "High memory usage"
**Test:** Generate with 1000+ pages
**Solution:** Reduce batch size:
```dart
const pageSize = 25; // Instead of 50
```

---

## 🎓 Expected Results Summary

### Metrics
| Metric | Expected | Your Result |
|--------|----------|------------|
| UI blocking time | < 2s | ___ |
| Memory peak | < 400MB | ___ |
| PDF gen time (10 pages) | 2-3s | ___ |
| Upload time (10MB) | 3-5s | ___ |
| Concurrent exports | 3 simultaneous | ___ |

### User Experience
- [ ] UI responsive → Smooth interaction
- [ ] Progress visible → Real-time updates
- [ ] No frozen state → Can tap buttons
- [ ] Upload shows progress → Confidence
- [ ] Success message → Clear confirmation

---

## 📝 Documentation Links

For more details, see:
- **QUICK_REFERENCE.md** - Quick overview
- **ADVANCED_PDF_OPTIMIZATION_GUIDE.md** - Complete technical details
- **BACKEND_INTEGRATION_GUIDE.md** - Server setup
- **ARCHITECTURE.md** - System design

---

**Ready to test?** Start with the 5-minute smoke test above! 🚀

Once verified, you're ready for:
1. Code review
2. Integration testing
3. Production deployment
4. User acceptance testing

**Last Updated:** April 10, 2026
