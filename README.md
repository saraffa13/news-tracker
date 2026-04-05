# NewsDecoder

A personal newspaper learning tool that helps you understand English newspaper articles by breaking them into explanations and vocabulary. Built for daily readers of Indian Express (or any English newspaper).

## Features

- **Add daily news** via JSON paste or file upload
- **Browse by date** with article counts and word counts
- **4 reading modes**: All News, Original Articles, Explained, Vocabulary
- **Word search** across all dates with date range filtering
- **Article search** by title
- **Dark/Light theme** with smooth transitions
- **Mobile responsive** design

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd newsdecoder
npm install
```

### 2. Configure MongoDB

Create a `.env.local` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsdecoder
```

You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a free cloud database.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `MONGODB_URI` as an environment variable in project settings
4. Deploy

## JSON Schema

Generate this JSON from your newspaper reading sessions and paste/upload it into the app:

```json
{
  "date": "2026-04-05",
  "newspaper": "Indian Express",
  "articles": [
    {
      "id": "art_001",
      "title": "Article title here",
      "category": "Energy",
      "original_text": "The full article text or summary...",
      "explanation": "A simplified breakdown of the article...",
      "one_line_summary": "One line summary of the article.",
      "difficult_words": [
        {
          "word": "Curtailment",
          "pronunciation": "कर्टेलमेंट",
          "meaning_english": "The act of reducing or limiting something",
          "meaning_hindi": "कटौती / कमी",
          "example_sentence": "The curtailment of funding affected the project.",
          "context_in_article": "RE curtailment refers to solar energy being cut back"
        }
      ]
    }
  ]
}
```

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | YYYY-MM-DD format |
| `newspaper` | string | Newspaper name |
| `articles` | array | Array of article objects |
| `articles[].id` | string | Unique article ID (e.g., art_001) |
| `articles[].title` | string | Article headline |
| `articles[].category` | string | Topic category |
| `articles[].original_text` | string | Original article text |
| `articles[].explanation` | string | Simplified explanation |
| `articles[].one_line_summary` | string | Brief summary |
| `articles[].difficult_words` | array | Vocabulary items |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/news` | List all dates (summary) |
| POST | `/api/news` | Save new daily news |
| GET | `/api/news/[date]` | Get full data for a date |
| PUT | `/api/news/[date]` | Update/replace a date |
| DELETE | `/api/news/[date]` | Delete a date |
| GET | `/api/words?q=&from=&to=` | Search words |
| GET | `/api/search?q=` | Search article titles |
