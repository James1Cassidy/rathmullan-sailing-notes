# Ollama Setup Guide

## Overview
Switched from Gemini API to **Ollama** for local, free text generation. This eliminates API costs and rate limits while keeping everything private.

## Installation

### 1. Download Ollama
- **Windows:** https://ollama.ai/download
- Or via package manager:
  ```powershell
  winget install Ollama.Ollama
  ```

### 2. Start Ollama Server
Open PowerShell and run:
```powershell
ollama serve
```

Leave this running in the background. Ollama listens on `http://localhost:11434`

### 3. Pull a Model (New Terminal)
Keep the first terminal running, open a new one:

**For drills (recommended - fast):**
```powershell
ollama pull mistral
```

**Or for higher quality:**
```powershell
ollama pull llama2
```

**Or for smallest/fastest:**
```powershell
ollama pull neural-chat
```

Check installed models:
```powershell
ollama list
```

---

## Configuration

### Change Default Model
Edit `functions/api/gemini/generate.js`:
```javascript
const OLLAMA_MODEL = 'mistral'; // Change to 'llama2', 'neural-chat', etc.
```

### Change Ollama Port (if needed)
If Ollama isn't on localhost:11434, update:
```javascript
const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
```

---

## Deployment

### Local Testing
1. Start Ollama: `ollama serve`
2. Pull model: `ollama pull mistral`
3. Use app normally - drill generation will call localhost Ollama

### Cloudflare Production Deploy
The functions are already updated to call local Ollama. However:

⚠️ **Important:** Cloudflare Workers cannot reach your local machine directly.

**Options:**
- **Option A:** Run Ollama on a public server (VPS, EC2, etc.) and update `OLLAMA_ENDPOINT`
- **Option B:** Keep Ollama local for local/development only, disable drills in production
- **Option C:** Use a hybrid approach with a relay server

For now, recommend **Option B** - test locally, fallback to static drills in production.

---

## Model Recommendations

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `neural-chat` | 4GB | ⚡⚡⚡ | Good | Drills (fastest) |
| `mistral` | 5GB | ⚡⚡ | Excellent | General (recommended) |
| `llama2` | 7GB | ⚡ | Very Good | Better quality |
| `orca-mini` | 3GB | ⚡⚡⚡ | OK | Ultra-light |

---

## Troubleshooting

**Error: "Ollama unavailable"**
- Ensure `ollama serve` is running
- Check port 11434 is open: `netstat -ano | findstr :11434`

**Model not found**
- Run: `ollama pull mistral` (or your chosen model)

**Slow response**
- Try smaller model (neural-chat)
- Check CPU isn't maxed out
- Consider GPU support: https://ollama.ai/blog/gpu

**Text generation poor quality**
- Try different model (mistral, llama2)
- Increase prompt clarity in UI

---

## TTS (Text-to-Speech)

Ollama doesn't support TTS. Options:
1. Use browser **Web Speech API** (free, works offline)
2. Integrate **ElevenLabs** (free tier available)
3. Disable TTS for now

Currently TTS endpoint returns 501 (Not Implemented).

---

## Benefits of Ollama

✅ **Free** - No API costs
✅ **Private** - All data stays local
✅ **Fast** - No network latency
✅ **Offline** - Works without internet
✅ **Customizable** - Use any model

---

## Next Steps

1. Install Ollama
2. Pull a model (`ollama pull mistral`)
3. Deploy updated functions: `firebase deploy --only functions`
4. Test drill generation - should work locally
5. Decide on production deployment strategy
