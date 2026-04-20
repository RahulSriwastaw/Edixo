# Bulk AI Edit Feature - Integration Guide

## Overview
This guide explains how to integrate the Bulk AI Edit feature into your existing Question Bank UI.

## Architecture

### Backend
- **Endpoint:** `POST /api/questions/bulk-ai-edit`
- **Authentication:** Required (via `authenticate` middleware)
- **Response:** Server-Sent Events (SSE) stream
- **Location:** `eduhub-backend/src/modules/questions/`

### Frontend
- **Components:** Located in `super_admin/src/components/tools/bulk-ai-edit/`
- **Custom Hook:** `super_admin/src/hooks/useBulkAIEdit.ts`
- **Config:** `super_admin/src/lib/ai-providers-config.ts`

## Components

### 1. BulkAIEditManager (Wrapper Component)
Main component that manages selection state and both modals.

```tsx
import { BulkAIEditManager } from '@/components/tools/bulk-ai-edit/BulkAIEditManager';

export function YourQuestionsListPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  return (
    <>
      {/* Your question list view here */}
      
      {/* Add this component */}
      <BulkAIEditManager
        selectedQuestions={selectedQuestions}
        onSelectionChange={setSelectedQuestions}
        onEditComplete={() => {
          // Refresh questions after edit
          refetchQuestions();
        }}
      />
    </>
  );
}
```

### 2. Step1ConfigModal
Configuration modal where users select:
- Edit Type (Question Variation, Language Variation, Solution Add, Custom)
- Action (based on edit type)
- Language (for translation)
- Custom prompt (if needed)

### 3. Step2ExecutionModal
Full-screen execution modal with:
- LEFT: AI configuration (provider, model, settings)
- RIGHT: Real-time execution status and logs
- Real-time log streaming via SSE

## How to Integrate into Question List

### Step 1: Update Question List Component

Add selection checkbox to each question row:

```tsx
<td className="px-4 py-3">
  <Checkbox
    checked={selectedQuestions.includes(question.id)}
    onChange={(checked) => {
      if (checked) {
        setSelectedQuestions([...selectedQuestions, question.id]);
      } else {
        setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
      }
    }}
  />
</td>
```

### Step 2: Add Bulk Actions Bar

The `BulkAIEditManager` component automatically shows the action bar when questions are selected. It appears as a fixed bottom bar with:
- Selection count
- Bulk Tag button
- **Bulk Edit** button (AI-powered)
- Copy to Test button
- Add to Question Bank button
- Clear Selection button

### Step 3: Pass Selection State

```tsx
<BulkAIEditManager
  selectedQuestions={selectedQuestions}
  onSelectionChange={setSelectedQuestions}
  onEditComplete={() => {
    // Refresh your questions list
    queryClient.invalidateQueries({ queryKey: ['questions'] });
    setSelectedQuestions([]);
  }}
/>
```

## API Request Flow

### 1. Frontend sends POST request:
```json
POST /api/questions/bulk-ai-edit
{
  "question_ids": ["id1", "id2", ...],
  "edit_type": "language_variation",
  "action": "make_bilingual",
  "language": "Hindi",
  "ai_provider": "gemini",
  "model": "gemini-3-flash-preview"
}
```

### 2. Backend processes via SSE:
Each log event sent as:
```json
{
  "status": "processing|success|error|completed",
  "question_id": "id1",
  "index": 1,
  "total": 20,
  "message": "Processing question 1/20...",
  "error": "Error details if failed"
}
```

### 3. Frontend updates in real-time:
- Progress bar updates
- Activity logs append
- Success/error counts track

## Edit Types & Actions

### Question Variation
- No action needed
- Generates variations keeping same concept/difficulty

### Language Variation
**Actions:**
- "Make bilingual (add 2nd language)" - Adds translation alongside original
- "Translate fully to another language" - Fully translates to selected language

**Languages:** Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu

### Solution Add / Change
**Actions:**
- "Add solution where missing" - Creates solutions for MCQs without them
- "Make solutions more detailed" - Expands existing solutions
- "Make solutions short & crisp (bullet points)" - Converts to bullet format

### Custom Prompt
- User writes their own AI instruction
- Applied to each question individually

## AI Providers

### Supported Providers
1. **Google Gemini** (Default)
   - Models: gemini-3-flash-preview, gemini-3-pro-preview, gemini-2-flash, gemini-1.5-pro
   
2. **OpenAI**
   - Models: gpt-4o, gpt-4o-mini, gpt-4-turbo
   
3. **Anthropic Claude**
   - Models: claude-opus-latest, claude-sonnet-latest, claude-haiku-latest

### Configuring API Keys
Set in `.env`:
```env
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key
```

## Error Handling

### Frontend
- SSE connection errors trigger error logs in red
- Failed questions show error message in activity log
- Close confirmation dialog on mid-execution close

### Backend
- Invalid request fields return 400 error
- Missing API keys return 500 error
- Individual question failures logged but continue processing
- Summary shows success/failure counts

## Real-Time Streaming

The feature uses Server-Sent Events (SSE) for real-time updates:

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE: Not supported

### Connection Details
- No authentication headers in EventSource (limitation)
- For production, consider upgrading to fetch with ReadableStream
- Auto-reconnect not implemented (intentional - one-shot process)

## Performance Considerations

- Processes questions sequentially (not parallel) to avoid API rate limits
- Each question creates a timeout of max 30 seconds
- Large batches (>100) may take several minutes
- SSE logs accumulate in memory (clear on close)

## Testing

### Test Flow
1. Select 3-5 questions
2. Click "Bulk Edit"
3. Select "Question Variation"
4. Proceed to Step 2
5. Click "Start Bulk Edit"
6. Observe logs streaming in real-time
7. Wait for completion

### Mock/Testing API
For testing without AI API keys:
- Modify backend to return mock responses
- Use environment variable `MOCK_AI_RESPONSES=true`

## File Structure

```
super_admin/
├── src/
│   ├── components/tools/bulk-ai-edit/
│   │   ├── Step1-ConfigModal.tsx
│   │   ├── Step2-ExecutionModal.tsx
│   │   ├── BulkAIEditManager.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── useBulkAIEdit.ts
│   └── lib/
│       └── ai-providers-config.ts
eduhub-backend/
├── src/modules/questions/
│   ├── bulk-ai-edit.controller.ts
│   └── bulk-ai-edit.routes.ts
```

## Troubleshooting

### "Failed to fetch question"
- Check if backend is running
- Verify NEXT_PUBLIC_API_URL environment variable
- Check browser console for CORS errors

### "API key for gemini not configured"
- Set GEMINI_API_KEY in backend .env
- Restart backend server

### SSE not streaming
- Check if browser supports EventSource
- Verify /api/questions/bulk-ai-edit endpoint is mounted
- Check browser network tab for SSE connection

### Very slow processing
- Check AI provider rate limits
- Consider using faster model (Flash instead of Pro)
- Monitor backend CPU/memory usage

## Next Steps

1. **Integrate into your question list page** - Add selection checkboxes
2. **Test with small batch** - Start with 3-5 questions
3. **Monitor performance** - Track processing time and costs
4. **Implement caching** - Cache AI responses for identical questions
5. **Add analytics** - Track feature usage and success rates

## Future Enhancements

- [ ] Parallel processing with concurrent queue
- [ ] WebSocket instead of SSE (for bidirectional communication)
- [ ] Question preview before processing
- [ ] Undo/Revert changes functionality
- [ ] Batch scheduling (process at off-peak hours)
- [ ] Cost estimation before processing
- [ ] Template library for custom prompts
- [ ] Webhook notifications on completion
