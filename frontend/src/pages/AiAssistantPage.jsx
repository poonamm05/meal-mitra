import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Send, Sparkles, ChefHat, Trash2,
  BookOpen
} from 'lucide-react';
import { sendAiMessage, getConversation, clearConversation } from '../utils/api';

const QUICK_PROMPTS = [
  'I have potatoes, onions and tomatoes. What can I make?',
  'Suggest a healthy dinner under 30 minutes for 2 people.',
  'What high-protein meal can I make in 20 minutes?',
  'I don\'t want to eat paneer today. Give me alternatives.',
  'Give me a light dinner for a bloated stomach after a heavy lunch.',
];

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadChat = async () => {
      try {
        const res = await getConversation();
        if (res.data.data?.messages) {
          setMessages(res.data.data.messages);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await sendAiMessage({ message: textToSend.trim() });
      const aiReply = {
        role: 'assistant',
        content: res.data.data.reply,
        suggestedDishes: res.data.data.suggestedDishes || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to my recipe knowledge base. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear your conversation history?')) {
      try {
        await clearConversation();
        setMessages([
          {
            role: 'assistant',
            content: 'Conversation history reset. How can I help you decide what to cook today? 🍳',
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Helper to format assistant markdown text
  const formatMarkdown = (content) => {
    return content.split('\n').map((line, idx) => {
      // Bold parser
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="min-h-[1.2rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-slate-900">MealMitra AI Assistant</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">Your everyday culinary decision partner</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-100 space-y-6">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-1">
                  <ChefHat className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-brand-500 text-white rounded-br-none shadow-glow font-medium'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}
              >
                <div className="space-y-1">{formatMarkdown(msg.content)}</div>

                {/* Embedded recipe suggestion cards if provided by AI */}
                {msg.suggestedDishes && msg.suggestedDishes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recommended Dishes to Cook:
                    </span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {msg.suggestedDishes.map((dish) => {
                        const d = typeof dish === 'object' ? dish : { name: dish, _id: dish };
                        return (
                          <Link
                            key={d._id}
                            to={`/recipes/${d._id}`}
                            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-300 transition-colors flex items-center gap-2.5 group"
                          >
                            {d.imageUrl && (
                              <img
                                src={d.imageUrl}
                                alt={d.name}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-slate-800 truncate group-hover:text-brand-600">
                                {d.name}
                              </h5>
                              <span className="text-[10px] text-slate-500">
                                {(d.prepTime || 0) + (d.cookTime || 0)}m
                              </span>
                            </div>
                            <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs italic">
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>MealMitra AI is calculating the best cooking options...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 no-scrollbar">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs whitespace-nowrap hover:border-brand-400 hover:text-brand-600 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-brand-500" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask anything... 'What can I cook with potatoes, onions, and rice?'"
          className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none shadow-soft"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="px-6 py-3.5 rounded-2xl bg-brand-500 text-white font-bold shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
