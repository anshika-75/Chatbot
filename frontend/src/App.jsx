import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am the Smartflo documentation assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        query: userMessage.content,
      });
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I am having trouble connecting to the server. Please check if the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-center h-16 bg-white border-b shadow-sm shrink-0">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          Smartflo AI
        </h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto w-full md:max-w-3xl mx-auto scroll-smooth" ref={scrollRef}>
        <div className="flex flex-col pb-6 pt-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "px-4 py-8 md:px-6 w-full flex justify-center transition-colors",
                m.role === "assistant" ? "bg-gray-50 md:bg-white rounded-xl shadow-sm my-2 md:mx-4 md:w-auto md:border border-gray-100" : "bg-white md:bg-transparent"
              )}
            >
              <div className="flex gap-4 w-full max-w-2xl">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    m.role === "assistant" ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                  )}
                >
                  {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {m.role === "assistant" ? "Smartflo AI" : "You"}
                  </span>
                  <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mt-1">
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="px-4 py-8 md:px-6 w-full flex justify-center bg-gray-50 md:bg-white rounded-xl shadow-sm my-2 md:mx-4 md:w-auto md:border border-gray-100">
              <div className="flex gap-4 w-full max-w-2xl items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-sm text-gray-800">Smartflo AI</span>
                  <div className="flex items-center gap-2 text-gray-500 h-6 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="w-full shrink-0 bg-white md:bg-transparent pb-4">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end bg-white border shadow-sm md:shadow-md rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all border-gray-300"
          >
            <textarea
              className="w-full max-h-48 resize-none py-3.5 pl-4 pr-12 focus:outline-none bg-transparent placeholder-gray-500"
              placeholder="Ask anything about Smartflo..."
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2 bottom-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-400">
              Smartflo Documentation AI Chatbot
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
