"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { create } from "zustand";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

type MessageType = "user" | "ai";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  addMessage: (content: string, type: MessageType) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (content, type) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          content,
          type,
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));

export default function ChatPage() {
  const t = useTranslations("chat");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, addMessage } = useChatStore();

  useEffect(() => {
    setIsCheckingAuth(false);

    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, router, locale]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);

    addMessage(message, "user");
    setMessage("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    setTimeout(() => {
      addMessage(message, "ai");
      setSending(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-lg">
            {t("loading", { defaultValue: "Загрузка..." })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-lg border">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  msg.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <div className="prose dark:prose-invert prose-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          className="pr-20"
          disabled={sending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending}
          size="icon"
          className={`${sending ? "opacity-70" : ""}`}
        >
          <SendIcon size={18} />
        </Button>
      </div>
    </div>
  );
}
