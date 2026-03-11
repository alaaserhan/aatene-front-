"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Bot } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useUIStore } from "@/src/stores/ui-store";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import axios from "axios";

const WEBHOOK_URL = "https://auto.mosaady.com/webhook/50a13617-dcab-4703-9b18-f7109d348abe";

interface ChatMessage {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
    id: 0,
    text: "مرحباً بك في مركز الدعم الذكي\nأنا مساعد الذكاء الاصطناعي، جاهز للإجابة على أسئلتك ومساعدتك في حل أي مشكلة بسرعة وسهولة.",
    sender: "bot",
    timestamp: new Date(),
};

export default function BotChat() {
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const pathname = usePathname();


    const isOpen = useUIStore((state) => state.isChatOpen);
    const setChatOpen = useUIStore((state) => state.setChatOpen);
    const toggleChat = useUIStore((state) => state.toggleChat);

    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setChatOpen(false);
    }, [pathname, setChatOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || isSending || !user) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            text: inputText.trim(),
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
        setInputText("");
        setIsSending(true);

        try {
            interface BotResponse {
                output?: string;
                response?: string;
                message?: string | { text: string };
            }

            const response = await axios.post<BotResponse>(WEBHOOK_URL, {
                message: userMessage.text,
                user_id: user.id,
                user_name: user.fullname || `${user.first_name} ${user.last_name}`,
            }, {
                validateStatus: (status) => status >= 200 && status < 300
            });

            const data = response.data;
            let botReply = "";

            if (response.status === 202 && data.output) {
                try {
                    const outputJson = JSON.parse(data.output);
                    if (outputJson.route === "WAITING" && outputJson.reason) {
                        botReply = outputJson.reason;
                    }
                } catch {
                    // Fallback if parsing fails
                }
            }

            if (!botReply) {
                botReply = data.output ||
                    (typeof data.message === "string" ? data.message : data.message?.text) ||
                    data.response ||
                    "شكراً لتواصلك معنا!";
            }

            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                text: typeof botReply === "string" ? botReply : "شكراً لتواصلك معنا!",
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev: ChatMessage[]) => [...prev, botMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                text: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    }, [inputText, isSending, user]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isHydrated || !isLoggedIn || !user) return null;

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden animate-in fade-in duration-300"
                    onClick={() => setChatOpen(false)}
                />
            )}

            {isOpen && (
                <div
                    className={cn(
                        "z-[9999] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
                        "fixed max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2",
                        "md:fixed md:bottom-24 md:right-6"
                    )}
                    style={{
                        height: "min(520px, calc(100vh - 120px))",
                        boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
                    }}
                >
                    <div
                        className="px-5 py-4 flex items-center justify-between shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                        }}
                    >
                        <div className="flex items-center gap-3" dir="rtl">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm leading-tight">التواصل مع الذكاء</h3>
                                <h3 className="text-white font-medium text-sm leading-tight">الاصطناعي</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>

                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-4" dir="rtl" ref={scrollRef}>
                        <div className="flex flex-col gap-3">
                            {messages.map((msg: ChatMessage) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.sender === "user"
                                            ? "bg-gradient-to-br from-[#395A7D] to-[#6496CD] text-white rounded-2xl rounded-tl-sm"
                                            : "bg-white text-gray-700 rounded-2xl rounded-tr-sm border border-gray-100"
                                            }`}
                                        style={
                                            msg.sender === "bot"
                                                ? { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                                                : undefined
                                        }
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex ">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tr-sm border border-gray-100 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white px-4 py-3 border-t border-gray-100 shrink-0" dir="rtl">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="اكتب رسالتك هنا ..."
                                disabled={isSending}
                                className="flex-1 bg-transparent text-sm text-right text-gray-700 placeholder:text-gray-400 outline-none border-none h-10"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || isSending}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${inputText.trim()
                                    ? "bg-[#395A7D] hover:bg-[#2c4460] text-white"
                                    : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {isSending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 -rotate-135" style={{ marginRight: "-1px" }} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer group"
                style={{
                    background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                    boxShadow: "0 6px 24px rgba(44,68,96,0.35)",
                }}
            >
                <Bot className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
            </button>
        </>
    );
}

