"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { MessageCircle, X, Send, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Loader } from "@/components/ui/loader";

interface AIChatProps {
  className?: string;
  lectureName?: string;
  currentSlide: number;
  totalSlides: number;
  currentNote?: string;
  allNotes?: Record<number, string>;
}

function stripHtml(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

export function AIChat({
  className,
  lectureName,
  currentSlide,
  totalSlides,
  currentNote,
  allNotes,
}: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // Format all notes for context
  const formattedNotes = allNotes
    ? Object.entries(allNotes)
        .filter(([, note]) => note && note.trim() !== "" && note !== "<p></p>")
        .map(([slide, note]) => `Slide ${slide}: ${stripHtml(note)}`)
        .join("\n\n")
    : undefined;

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        context: {
          className,
          lectureName,
          currentSlide,
          totalSlides,
          currentNote: currentNote ? stripHtml(currentNote) : undefined,
          allNotes: formattedNotes,
        },
      },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }

  function getMessageText(message: (typeof messages)[0]): string {
    return message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-background border rounded-2xl shadow-xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ChatContainerRoot className="flex-1 p-4">
        <ChatContainerContent className="gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
              <Sparkles className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">How can I help you?</p>
              <p className="text-xs mt-1">
                Ask questions about your lecture notes
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message
              key={message.id}
              className={message.role === "user" ? "flex-row-reverse" : ""}
            >
              <MessageAvatar
                src={
                  message.role === "user"
                    ? "/user-avatar.png"
                    : "/ai-avatar.png"
                }
                alt={message.role === "user" ? "You" : "AI"}
                fallback={message.role === "user" ? "U" : "AI"}
              />
              <MessageContent
                markdown={message.role === "assistant"}
                className={
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }
              >
                {getMessageText(message)}
              </MessageContent>
            </Message>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <Message>
              <MessageAvatar src="/ai-avatar.png" alt="AI" fallback="AI" />
              <div className="rounded-lg p-2 bg-muted">
                <Loader variant="typing" />
              </div>
            </Message>
          )}

          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>

      {/* Input */}
      <div className="p-3 border-t">
        <form onSubmit={handleSubmit}>
          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={() => {
              if (!input.trim()) return;
              sendMessage({ text: input });
              setInput("");
            }}
            className="rounded-2xl"
          >
            <PromptInputTextarea
              placeholder="Ask about your notes..."
              className="min-h-10 text-sm"
            />
            <PromptInputActions className="justify-end pt-2">
              {isLoading ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={stop}
                  className="rounded-full"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim()}
                  className="rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </PromptInputActions>
          </PromptInput>
        </form>
      </div>
    </div>
  );
}
