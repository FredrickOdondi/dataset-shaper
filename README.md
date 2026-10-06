# Monk: AI-Powered LLM Data Preparation

**Turn raw data into training-ready datasets in one click.** Monk detects what each column means and maps it into the format you need for LLM fine-tuning.

**Live:** https://dataset-shaper.vercel.app

## Features

- **Upload** CSV and spreadsheet files, or connect a database
- **AI column detection:** figures out which fields are prompts, responses, labels or metadata
- **Chat-based mapping:** refine the schema mapping by talking to the assistant
- **Export** clean, fine-tuning-ready datasets

## Architecture

React frontend plus three Supabase Edge Functions:

| Function | Role |
|---|---|
| `process-file` | Parses uploaded files |
| `process-database` | Pulls and shapes data from a connected database |
| `chat-mapping` | LLM-driven column mapping via chat |

## Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Supabase (Edge Functions) · PapaParse

## Run locally

```bash
npm install
npm run dev
```
