// components/chatbot/FloatingChatbot.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Halo! Saya AI Assistant. Ada yang bisa saya bantu?",
    sender: "bot",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    text: "Bisa jelaskan tentang fitur chatbot ini?",
    sender: "user",
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "3",
    text: "Tentu! Ini adalah AI chatbot floating dengan UI modern. Saya bisa membantu menjawab pertanyaan, memberikan informasi, atau sekedar mengobrol.",
    sender: "bot",
    timestamp: new Date(Date.now() - 900000),
  },
  {
    id: "4",
    text: "Bagaimana cara mengoptimalkan pengalaman menggunakan chatbot?",
    sender: "user",
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "5",
    text: "Gunakan pertanyaan yang spesifik dan jelas untuk hasil terbaik. Saya juga mendukung berbagai topik pembicaraan!",
    sender: "bot",
    timestamp: new Date(Date.now() - 300000),
  },
];

const quickQuestions = [
  "Apa yang bisa kamu lakukan?",
  "Bagaimana cara menggunakan fitur ini?",
  "Bisa beri contoh penggunaannya?",
  "Apa keuntungan menggunakan AI chatbot?",
  "Bagaimana cara mengatur preferensi?",
  "Apakah data saya aman?",
];

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showForm &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setShowForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setIsTyping(true);
    setShowForm(false);

    // Simulate AI response after delay
    setTimeout(() => {
      const responses = [
        "Saya mengerti pertanyaan Anda. Berdasarkan informasi yang saya miliki...",
        "Itu pertanyaan yang bagus! Mari saya jelaskan lebih detail.",
        "Terima kasih atas pertanyaannya. Berikut penjelasan saya:",
        "Saya sedang memproses pertanyaan Anda. Mohon tunggu sebentar.",
        "Untuk pertanyaan itu, saya sarankan untuk mempertimbangkan beberapa faktor penting.",
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        handleSendMessage();
      }, 300);
    } else {
      handleSendMessage();
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      setShowForm(true);
      setTimeout(() => {
        setIsOpen(true);
        setShowForm(false);
      }, 800);
    } else {
      setIsOpen(false);
    }
  };

  const nextSlide = () => {
    setSliderIndex((prev) => (prev + 2) % quickQuestions.length);
  };

  const prevSlide = () => {
    setSliderIndex(
      (prev) => (prev - 2 + quickQuestions.length) % quickQuestions.length
    );
  };

  const displayedQuestions = quickQuestions.slice(sliderIndex, sliderIndex + 2);

  return (
    <>
      {/* Floating Button with Animation */}
      {!isOpen && !showForm && (
        <button
          onClick={handleButtonClick}
          className={cn(
            "flex bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl",
            "transition-all duration-500 hover:scale-110 hover:shadow-3xl",
            "bg-gradient-to-br from-primary to-primary-dark",
            "border-2 border-white/20",
            "animate-in zoom-in duration-300"
          )}
        >
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {messages.length}
          </span>
        </button>
      )}

      {/* Animated Form Transition */}
      {showForm && (
        <div
          ref={formRef}
          className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 duration-300"
        >
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-2xl dark:bg-neutral-900">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                  setShowForm(false);
                  setIsOpen(true);
                }
              }}
              placeholder="Tanya sesuatu..."
              autoFocus
              className="w-64 rounded-full border-0 bg-transparent px-4 py-2 text-sm outline-none focus:ring-0"
            />
            <button
              onClick={() => {
                handleSendMessage();
                setShowForm(false);
                setIsOpen(true);
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                inputText.trim()
                  ? "bg-gradient-to-br from-primary to-primary-dark text-white hover:scale-105"
                  : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className={cn(
            "fixed bottom-20 right-6 z-50 flex flex-col rounded-2xl shadow-2xl",
            "border border-neutral-200/50 dark:border-white/[0.15]",
            "bg-white/95 backdrop-blur-sm dark:bg-neutral-900/95",
            "transition-all duration-500",
            isMinimized ? "h-16 w-64" : "h-[600px] w-96",
            "animate-in slide-in-from-right-8 duration-300"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between rounded-t-2xl p-4",
              "bg-gradient-to-r from-primary/5 to-primary-light/5",
              "border-b border-neutral-200/50 dark:border-white/[0.15]"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-green-500 dark:border-neutral-900" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-neutral-800 dark:text-neutral-200">
                  AI Assistant
                </h3>
                {!isMinimized && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {isTyping ? "Mengetik..." : "Online • Bisa membantu"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-2 transition-all hover:scale-105 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Minimize2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 transition-all hover:scale-105 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent dark:scrollbar-thumb-neutral-700">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 animate-in fade-in duration-300",
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          "transition-all duration-300 hover:scale-110",
                          message.sender === "user"
                            ? "bg-accent"
                            : "bg-primary "
                        )}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>

                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl p-3",
                          "shadow-input transition-all duration-300 hover:shadow-md",
                          message.sender === "user"
                            ? cn(
                                "rounded-tr-none",
                                "bg-primary text-white",
                                "animate-in slide-in-from-right-4 duration-300"
                              )
                            : cn(
                                "rounded-tl-none",
                                "bg-gradient-to-r from-primary/10 to-primary-light/10",
                                "border border-neutral-200/50 dark:border-white/[0.15]",
                                "animate-in slide-in-from-left-4 duration-300"
                              )
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="mt-1 text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl rounded-tl-none p-3",
                          "bg-gradient-to-r from-primary/10 to-primary-light/10",
                          "border border-neutral-200/50 dark:border-white/[0.15]"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-primary"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-primary"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            Mengetik...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Initial Messages Slider */}
              <div className="border-t border-neutral-200/50 dark:border-white/[0.15] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Pertanyaan populer:
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={prevSlide}
                      className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {displayedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2 text-left text-xs transition-all duration-300",
                        "border border-primary/20",
                        "bg-gradient-to-r from-primary/5 to-primary-light/5",
                        "hover:from-primary/10 hover:to-primary-light/10",
                        "hover:scale-[1.02] hover:shadow-sm",
                        "animate-in fade-in duration-300"
                      )}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-neutral-200/50 dark:border-white/[0.15] p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tulis pesan Anda di sini..."
                      className={cn(
                        "w-full resize-none rounded-xl border px-4 py-3 pr-12",
                        "border-primary/30 focus:border-primary",
                        "bg-white/50 dark:bg-neutral-800/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                        "transition-all duration-300"
                      )}
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2",
                        "transition-all duration-300 hover:scale-105",
                        inputText.trim()
                          ? cn(
                              "bg-gradient-to-br from-primary to-primary-dark",
                              "text-white shadow-md hover:shadow-lg"
                            )
                          : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  Tekan{" "}
                  <kbd className="rounded bg-neutral-200 px-1 py-0.5 dark:bg-neutral-700">
                    Enter
                  </kbd>{" "}
                  untuk mengirim
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
