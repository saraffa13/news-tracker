import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, words, articleText } = await request.json();

    if (!date || !articleId || !words || !articleText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const wordList = words as string[];

    const prompt = `You are a vocabulary assistant for an Indian English newspaper reader learning new words.

Given the following newspaper article text and a list of words, return a JSON array of word objects. For each word, provide:
- word: the word exactly as given
- pronunciation: Hindi transliteration (Devanagari script)
- meaning_english: clear English definition (1-2 sentences)
- meaning_hindi: Hindi meaning
- example_sentence: a new example sentence (not from the article)
- context_in_article: how this word is used in the given article (quote or paraphrase the relevant part)

ARTICLE TEXT:
${articleText}

WORDS TO DEFINE:
${wordList.join(", ")}

Return ONLY a valid JSON array, no markdown, no explanation. Example format:
[{"word":"example","pronunciation":"एग्ज़ाम्पल","meaning_english":"...","meaning_hindi":"...","example_sentence":"...","context_in_article":"..."}]`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter error:", res.status, errText);
      return NextResponse.json(
        { error: "OpenRouter API failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response - strip markdown fences if present
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let generatedWords;
    try {
      generatedWords = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse LLM response:", cleaned);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (!Array.isArray(generatedWords)) {
      return NextResponse.json(
        { error: "AI returned invalid format" },
        { status: 500 }
      );
    }

    // Ensure each word has the learnt field
    const wordsToSave = generatedWords.map((w: Record<string, unknown>) => ({
      word: w.word || "",
      pronunciation: w.pronunciation || "",
      meaning_english: w.meaning_english || "",
      meaning_hindi: w.meaning_hindi || "",
      example_sentence: w.example_sentence || "",
      context_in_article: w.context_in_article || "",
      learnt: false,
    }));

    // Save to database - push new words into the article's difficult_words array
    await dbConnect();
    await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $push: { "articles.$.difficult_words": { $each: wordsToSave } } }
    );

    return NextResponse.json({ words: wordsToSave });
  } catch (error) {
    console.error("POST /api/words/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate words" },
      { status: 500 }
    );
  }
}
