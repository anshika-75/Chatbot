import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Cloud, User, Loader2, Image as ImageIcon, X } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input.trim(), image: selectedImage };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 
        (window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`);
      const response = await axios.post(`${apiBase}/chat`, {
        query: userMessage.content,
        image_base64: userMessage.image,
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
      <header className="sticky top-0 z-10 flex items-center justify-center p-4 bg-white border-b shadow-sm shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Cloud className="w-8 h-8 text-orange-500 fill-orange-100" />
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 text-transparent bg-clip-text">Smartflo</span> AI
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
                    m.role === "assistant" ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm" : "bg-gray-800 text-white"
                  )}
                >
                  {m.role === "assistant" ? <Cloud className="w-5 h-5 fill-white" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {m.role === "assistant" ? "Smartflo AI" : "You"}
                  </span>
                  <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mt-1">
                    {m.image && <img src={m.image} alt="upload" className="max-w-[200px] mb-2 rounded-lg border shadow-sm" />}
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="px-4 py-8 md:px-6 w-full flex justify-center bg-gray-50 md:bg-white rounded-xl shadow-sm my-2 md:mx-4 md:w-auto md:border border-gray-100">
              <div className="flex gap-4 w-full max-w-2xl items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Cloud className="w-5 h-5 fill-white" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-sm text-gray-800">Smartflo AI</span>
                  <div className="flex items-center gap-2 text-gray-500 h-6 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
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
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img src={selectedImage} alt="preview" className="h-20 rounded-lg border shadow-sm" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end bg-white border shadow-sm md:shadow-md rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-500 transition-all border-gray-300"
          >
            <label className="p-3 cursor-pointer text-gray-400 hover:text-orange-500 transition-colors">
               <ImageIcon className="w-5 h-5 mt-1" />
               <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <textarea
              className="w-full max-h-48 resize-none py-3.5 pl-2 pr-12 focus:outline-none bg-transparent placeholder-gray-500" 
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
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="p-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-40 disabled:hover:from-orange-500 disabled:hover:to-orange-400 flex items-center justify-center shadow-sm"
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
