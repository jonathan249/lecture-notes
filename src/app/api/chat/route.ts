import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: {
    className?: string;
    lectureName?: string;
    currentSlide?: number;
    totalSlides?: number;
    currentNote?: string;
    allNotes?: string;
  }} = await req.json();

  // Build system prompt with lecture context
  const systemPrompt = `You are a helpful AI assistant for a lecture notes application. You help students understand lecture content and answer questions about their notes.

${
  context
    ? `Current context:
- Class: ${context.className || "Unknown"}
- Lecture: ${context.lectureName || "Unknown"}
- Current slide: ${context.currentSlide || "Unknown"} of ${context.totalSlides || "Unknown"}
${context.currentNote ? `\nCurrent slide notes:\n${context.currentNote}` : ""}
${context.allNotes ? `\nAll notes from this lecture:\n${context.allNotes}` : ""}`
    : ""
}

Be concise and helpful. If asked about the lecture content, use the provided notes as context. Format responses in markdown when appropriate.`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
