# Whiteboard PDF Export — Implementation Guide

## Overview
This guide explains the complete flow for creating, arranging, and uploading class notes as PDF in the whiteboard app.

## 🎯 Complete User Flow

### Teacher's Perspective
1. **During Class**: Teacher creates slides and teaches
2. **End Class**: Teacher clicks "End Class Session" button
3. **Arrange Pages**: Panel opens showing all slides as thumbnails
   - Teachers can delete unwanted pages
   - Reorder pages by moving up/down
   - See page count and deleted page count
   - Delete pages appear in a separate "Deleted Pages" section
   - Can restore deleted pages by clicking them
4. **Export**: Teacher clicks "Proceed to Export" 
5. **PDF Generation**: System generates PDF with:
   - Only the arranged pages (respecting deletion order)
   - Progress indicator showing status
6. **Upload**: PDF uploads to server with retry logic
7. **Confirmation**: Success message shows when complete

### Admin's Perspective (Super Admin Panel)
- Goes to Question Bank → Sets
- Sees "Notes PDF" column with:
  - PDF download link
  - File size (MB)
  - Page count
  - Upload date/time

---

## 📁 File Structure

### New Files Created
```
whiteboard/lib/features/whiteboard/presentation/widgets/panels/
└── page_arrangement_panel.dart    # Main page arrangement UI
```

### Modified Files
```
whiteboard/lib/features/whiteboard/
├── services/
│   └── pdf_exporter_service.dart  # Enhanced PDF export with retry logic
└── presentation/widgets/dialogs/
    └── end_class_dialog.dart      # Updated to use arrangement panel

eduhub-backend/src/modules/whiteboard/
└── whiteboard.routes.ts           # Enhanced PDF upload endpoint
```

---

## 🔧 Key Components

### 1. Page Arrangement Panel (`page_arrangement_panel.dart`)

**Features:**
- Grid view on desktop (4 columns), list view on mobile
- Thumbnail preview of each page
- Page number and slide reference
- Move up/down buttons for reordering
- Delete button with restore option
- Live page count display
- Deleted pages section with restore capability

**Props:**
```dart
PageArrangementPanel(
  onConfirm: () => proceedWithExport(),  // Called when user clicks "Proceed"
  onCancel: () => goBack(),               // Called when user cancels
)
```

### 2. PDF Exporter Service (`pdf_exporter_service.dart`)

**Key Methods:**

#### `exportSessionToPdf()`
- Accepts optional `PdfExportConfig` with page order and deleted pages
- Generates progress dialog
- Captures slides in specified order
- Skips deleted pages
- Uploads with retry logic (3 attempts max)

#### `_uploadPdfWithRetry()`
- Implements exponential backoff retry logic
- Max 3 attempts with 2s, 4s delays
- Proper error messages on complete failure

#### `_uploadPdf()`
- Constructs multipart form data
- Sends to backend with 5-minute timeout
- Includes file size and page count metadata

**Configuration:**
```dart
PdfExportConfig(
  pageOrder: [0, 2, 1, 3],        // New order: skip page 1, move 1 to position 2
  deletedPages: {1, 5},            // Pages deleted by teacher
)
```

### 3. End Class Dialog Update (`end_class_dialog.dart`)

**Flow:**
1. User clicks "End & Arrange"
2. Dialog switches to `PageArrangementPanel`
3. User arranges pages
4. On confirm, calls `exportSessionToPdf()` with config
5. PDF is generated and uploaded

---

## 🛠️ Backend Improvements

### PDF Upload Endpoint
**Route:** `POST /whiteboard/sets/:setId/whiteboard-pdf`

**Enhancements:**
1. **File Validation**
   - Check mime type (application/pdf)
   - Check file size (max 100MB)
   - Filename validation

2. **Set Validation**
   - Verify set exists before upload
   - Use Prisma instead of raw SQL

3. **Storage Options**
   - Primary: AWS S3 with CloudFront CDN
   - Fallback: Local filesystem storage
   - Graceful fallback if S3 fails

4. **Metadata Logging**
   - Timestamp
   - Page count
   - File size
   - Uploader user ID
   - Set reference

5. **Response**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudfront.../whiteboard-pdfs/setId/timestamp.pdf",
    "fileSize": "2.5",
    "totalPages": 12,
    "createdAt": "2025-04-10T12:30:00Z",
    "setId": "ABC123",
    "message": "PDF uploaded and saved successfully"
  }
}
```

### Fetch Notes Endpoint
**Route:** `GET /whiteboard/sets/:setId/notes`

**Improvements:**
- Uses Prisma for type safety
- Returns proper error codes
- Includes full metadata

---

## 📊 Data Flow Diagram

```
User clicks "End Class"
    ↓
EndClassDialog shows
    ↓
User clicks "End & Arrange"
    ↓
PageArrangementPanel opens
    ├─ Displays all slides as thumbnails
    ├─ User arranges/deletes pages
    └─ Creates PdfExportConfig
    ↓
User clicks "Proceed to Export"
    ↓
PdfExporterService.exportSessionToPdf(config)
    ├─ Captures slides in new order
    ├─ Skips deleted pages
    ├─ Generates PDF bytes
    └─ Calls _uploadPdfWithRetry()
    ↓
_uploadPdfWithRetry(retry logic: 3 attempts)
    ├─ Attempt 1 (0s delay)
    ├─ Attempt 2 (2s delay if failed)
    ├─ Attempt 3 (4s delay if failed)
    └─ Success or final error
    ↓
Backend: POST /whiteboard/sets/:setId/whiteboard-pdf
    ├─ Validates file
    ├─ Uploads to S3 (or local)
    ├─ Saves metadata to DB
    └─ Returns success
    ↓
Frontend: Shows success message
    ↓
Admin can see PDF in Super Admin Panel
```

---

## 🔄 Retry Logic

**Configuration:**
- **Max Retries:** 3
- **Upload Timeout:** 5 minutes
- **Backoff Strategy:** Exponential (0s, 2s, 4s)

**Error Handling:**
- Network timeout → Retry automatically
- Server error (5xx) → Retry automatically
- Bad request (4xx) → Fail immediately
- All retries failed → Show error message

---

## 🚀 Usage Example

```dart
// In your widget where you need PDF export

final pdfService = PdfExporterService(ref);

// Simple export (all pages)
await pdfService.exportSessionToPdf(context);

// Export with page arrangement
final config = PdfExportConfig(
  pageOrder: [0, 2, 1, 3],  // Reordered
  deletedPages: {1, 5},      // Deleted
);
await pdfService.exportSessionToPdf(context, config: config);
```

---

## 📱 Super Admin Integration

### Display in Question Bank
The super admin panel already supports displaying PDF notes:

**Location:** `/question-bank/sets`

**Shows:**
```
┌─────────────────────────────────┐
│ Notes PDF                       │
│ ┌─────────────────────────────┐ │
│ │ 📄 Notes PDF      ⬇️        │ │
│ │ 12 pages • 2.5MB            │ │
│ │ 10-Apr-2025                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: PDF upload stuck/hanging
**Solution:** 
- Check network connectivity
- Verify server is running
- Check file size (max 100MB)
- Review browser console for errors

### Issue: Pages not showing in arrangement panel
**Solution:**
- Ensure slides are captured (cache should have thumbnails)
- Check `slideCaptureProvider` state
- Verify PNG bytes are valid

### Issue: PDF missing pages
**Solution:**
- Check `deletedPages` set contents
- Verify `pageOrder` array is correct
- Review PDF generation logs

### Issue: Backend returns 404
**Solution:**
- Verify set_id exists in database
- Check if set is marked as deleted
- Verify Prisma connection

---

## 📝 Testing Checklist

- [ ] Can open "End Class" dialog
- [ ] Can click "End & Arrange" to open panel
- [ ] Can see all slides as thumbnails
- [ ] Can drag/reorder pages
- [ ] Can delete pages
- [ ] Can restore deleted pages
- [ ] Page count updates correctly
- [ ] Can proceed to export
- [ ] PDF generates without errors
- [ ] Upload completes successfully
- [ ] PDF visible in super admin panel
- [ ] PDF metadata shows correct info
- [ ] Retry logic works (simulate network error)
- [ ] Mobile view is responsive

---

## 🔐 Security Considerations

1. **File Upload Validation**
   - Mime type check (PDF only)
   - File size limit (100MB)
   - Original filename sanitization

2. **Access Control**
   - Verify user has access to set
   - Log who uploaded the PDF
   - Track upload timestamp

3. **Storage Security**
   - S3 bucket with proper ACLs
   - Encryption at rest
   - CloudFront CDN with signing

---

## 📊 Performance Tips

1. **Large Classes (50+ slides)**
   - Arrange panel uses grid/list efficiently
   - PNG capture is memory-managed
   - Upload uses 5-minute timeout

2. **Network Issues**
   - Retry logic handles temporary failures
   - Exponential backoff prevents overwhelming server
   - Clear progress feedback to user

3. **Database**
   - Prisma with proper indexing on set_id
   - JSONB storage for pdf_notes is efficient
   - Single update query for metadata

---

## 🚀 Future Enhancements

1. **Page Annotations**
   - Add text/drawing to pages before export
   - Merge multiple sets' notes

2. **Auto-backup**
   - Periodic backup of notes to cloud
   - Version history

3. **Sharing**
   - Share PDF with students
   - QR code for quick access

4. **Advanced Editing**
   - PDF compression options
   - Custom watermarking
   - OCR for text extraction
