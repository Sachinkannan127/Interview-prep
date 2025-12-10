# Enhanced Logging Guide

## Overview
The backend now includes comprehensive logging to help debug and monitor Gemini API interactions.

## Log Sections

### 1. Service Initialization (on backend start)
```
============================================================
GEMINI SERVICE INITIALIZATION
============================================================
API Key present: True
API Key length: 39
API Key starts with: AIzaSyB6JK...
Configuring Gemini API...
Creating model instances...
✅ SUCCESS: Gemini AI initialized successfully
Flash Model: models/gemini-2.5-flash
Pro Model (using Flash): models/gemini-2.5-flash
⚠️  Note: Using gemini-2.5-flash for both generation and evaluation
⚠️  Rate limit: 5 requests per minute per model
============================================================
```

### 2. Interview Start - Question Generation
```
======================================================================
START INTERVIEW API ENDPOINT
======================================================================
User ID: abc123
User email: user@example.com
Interview config received:
  type: technical
  subType: react
  difficulty: mid
  duration: 30
  videoEnabled: true

--- Calling Gemini Service to generate first question ---

============================================================
GENERATE FIRST QUESTION
============================================================
Initialized: True
Flash Model: <google.generativeai.generative_models.GenerativeModel>
Config received: { "type": "technical", "subType": "react"... }

--- Building prompt ---
Prompt length: 1234 characters
Prompt preview (first 200 chars):
You are an expert interviewer conducting a technical interview...

--- Calling Gemini API ---
Using model: models/gemini-2.5-flash
Sending request to Gemini...

✅ API Response received!
Response type: <class 'google.generativeai.types.generation_types.GenerateContentResponse'>
Response has text: True
Response text length: 156 chars
Response preview: What are React hooks and how do they improve...

✅ SUCCESS: Question generated!
Final question: What are React hooks and how do they improve functional components?
============================================================

--- First question received ---
Question length: 72 chars
Question: What are React hooks and how do they improve functional components?

--- Creating interview document ---

✅ SUCCESS: Interview created with ID: interview_xyz789
======================================================================
```

### 3. Answer Submission - Evaluation
```
============================================================
EVALUATE AND GENERATE NEXT
============================================================
Initialized: True
Pro Model: <google.generativeai.generative_models.GenerativeModel>
QA History length: 1
Current answer length: 342 chars
Config: { "type": "technical"... }

--- Building evaluation prompt ---
Prompt length: 2156 characters
Prompt preview (first 300 chars):
You are an expert interviewer evaluating a candidate's response...

--- Calling Gemini Evaluation API ---
Using model: models/gemini-2.5-flash
Sending evaluation request to Gemini...

✅ API Response received!
Response type: <class 'google.generativeai.types.generation_types.GenerateContentResponse'>
Response has text: True
Response text length: 523 chars
Response preview: {"score": 85, "feedback": "Good understanding..."...

✅ SUCCESS: Evaluation complete!
Score: 85
Next question: Can you explain how useEffect works and provide...
============================================================
```

### 4. Error Scenarios

#### API Key Not Configured
```
============================================================
GEMINI SERVICE INITIALIZATION
============================================================
API Key present: False
API Key length: 0
❌ WARNING: Gemini API key not configured or invalid
Backend will run with fallback questions
============================================================
```

#### Model Initialization Failed
```
❌ ERROR: Failed to initialize Gemini AI
Error type: InvalidArgument
Error message: Invalid API key format
[Full stack trace...]
Backend will run with fallback questions
```

#### API Call Failed
```
❌ GEMINI API ERROR
Error type: ResourceExhausted
Error message: 429 You exceeded your current quota...
Error details:
[Full stack trace...]

⚠️  Falling back to predefined questions
============================================================
```

#### Rate Limit Hit
```
❌ GEMINI API ERROR
Error type: ResourceExhausted
Error message: 429 You exceeded your current quota
* Quota exceeded for metric: generate_content_free_tier_requests
* Limit: 5 requests per minute
* Model: gemini-2.5-flash
Please retry in 33.912401449s
```

## Log Icons Reference

| Icon | Meaning | When Used |
|------|---------|-----------|
| ✅ | Success | Successful operations |
| ❌ | Error | Failed operations |
| ⚠️ | Warning | Important notices, fallbacks |
| --- | Section | Log section dividers |
| === | Major Section | Major operation boundaries |

## Debugging Tips

### Issue: Not Getting Gemini Questions

1. **Check Initialization Logs**
   ```
   Look for: "✅ SUCCESS: Gemini AI initialized successfully"
   ```
   - If you see ❌ or ⚠️ warnings, check API key configuration

2. **Check Model Names**
   ```
   Flash Model: models/gemini-2.5-flash  ✅ Correct
   Flash Model: models/gemini-1.5-flash-002  ❌ Wrong (404 error)
   ```

3. **Check API Calls**
   ```
   Look for: "--- Calling Gemini API ---"
   Then: "✅ API Response received!"
   ```
   - If you see ❌ error, check the error type and message

4. **Check Rate Limits**
   ```
   Error type: ResourceExhausted
   Quota exceeded for metric: generate_content_free_tier_requests
   ```
   - Wait 60 seconds and try again
   - Free tier: 5 requests per minute

### Issue: Fallback Questions Always Used

**Check for:**
```
Initialized: False
```

**Causes:**
- API key missing or invalid
- Model initialization failed
- Previous API call failed (auto-disables for subsequent calls)

**Solution:**
1. Verify API key in `.env` file
2. Restart backend to reinitialize
3. Check logs for initialization errors

### Issue: Rate Limit Errors

**Log shows:**
```
429 You exceeded your current quota
Limit: 5, model: gemini-2.5-flash
Please retry in 33s
```

**Solutions:**
- Wait 60 seconds between test batches
- Use pre-generated questions for testing
- Upgrade to paid tier for higher limits

## Monitoring API Health

### Healthy Logs Pattern
```
✅ SUCCESS: Gemini AI initialized
✅ API Response received!
✅ SUCCESS: Question generated!
✅ SUCCESS: Evaluation complete!
```

### Unhealthy Logs Pattern
```
❌ ERROR: Failed to initialize
⚠️  Falling back to predefined questions
```

## Log File Locations

- **Console Output**: Backend terminal window
- **Production**: Consider adding file logging to `backend/logs/`

## Testing the Logs

1. **Start Backend**
   ```bash
   cd backend
   python main.py
   ```
   Watch for initialization logs

2. **Start Interview** (via frontend or API)
   - Triggers question generation logs
   - Check for ✅ success indicators

3. **Submit Answer**
   - Triggers evaluation logs
   - Check score and next question generation

4. **Force Error** (for testing)
   - Temporarily set invalid API key
   - Restart backend
   - Should see ❌ error logs and fallback activation

## Log Analysis Checklist

- [ ] Service initialized successfully
- [ ] Models created with correct names (gemini-2.5-flash)
- [ ] API key present and valid length
- [ ] API calls receive responses
- [ ] Questions generated successfully
- [ ] Evaluations complete with scores
- [ ] No rate limit errors (or manageable delays)

## Production Recommendations

1. **Add Structured Logging**
   - Use Python's `logging` module with levels (INFO, WARNING, ERROR)
   - Format logs as JSON for easy parsing

2. **Log Aggregation**
   - Send logs to centralized service (e.g., CloudWatch, Datadog)
   - Set up alerts for error patterns

3. **Metrics Tracking**
   - Track API success/failure rates
   - Monitor rate limit hits
   - Measure response times

4. **Sensitive Data**
   - Never log full API keys (already truncated: AIzaSyB6JK...)
   - Sanitize user PII in logs
   - Limit answer text length in logs

## Quick Reference Commands

### View Live Logs
```bash
# In terminal where backend is running
# Logs appear automatically as requests are processed
```

### Grep for Errors
```bash
# On Linux/Mac
tail -f server.log | grep "❌\|ERROR"

# On Windows PowerShell
Get-Content server.log -Wait | Select-String "ERROR|❌"
```

### Count API Calls
```bash
# Count successful API calls
grep "✅ API Response received!" server.log | wc -l

# Count rate limit errors
grep "ResourceExhausted" server.log | wc -l
```
