import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  Compass,
  ArrowRight,
  ChevronDown,
  ShoppingBag,
  MapPin,
  Leaf,
  Store,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useAppLocation } from '../../context/LocationContext';

const STARTER_PROMPTS = [
  { label: '🥐 Bakery Deals', text: 'Where can I find discounted bakery and pastry deals today?' },
  { label: '📍 Nearby Stores', text: 'Show me how to find rescue stores near my location on the map.' },
  { label: '⏰ How Pickups Work', text: 'How do reservations and store pickup countdown timers work?' },
  { label: '🏪 Partner Onboarding', text: 'How can a local store or bakery register to sell surplus food?' },
  { label: '🌱 CO₂ & Savings', text: 'How does Tschüss calculate my environmental and carbon impact?' },
];

export const TschussAIChatBubble: React.FC = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { role } = useAuth();
  const { location: userCity } = useAppLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('tschuss_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback to default
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hi there! 👋 I'm **Tschüss AI**, your food rescue guide.\n\nI can help you:\n- 🥐 Find fresh, discounted surplus food in your city\n- 📍 Navigate to [Discover Deals](/app/discover) or the [Store Map](/app/map)\n- 🏪 Guide retailers on listing inventory in [For Business](/for-business)\n- ⏰ Explain reservation pick-up windows and [My Impact](/app/impact)\n\nWhat are you looking for today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Discover Food Deals', path: '/app/discover' },
          { label: 'Explore Store Map', path: '/app/map' },
          { label: 'How It Works', path: '/how-it-works' },
          { label: 'For Business', path: '/for-business' },
        ],
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('tschuss_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(newMessages, {
        currentPath: routeLocation.pathname,
        userRole: role || 'consumer',
        location: userCity?.name || 'Munich',
      });

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI chat response:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "I ran into a temporary issue, but you can explore [Discover Deals](/app/discover) or view our [How It Works](/how-it-works) guide directly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Discover Deals', path: '/app/discover' },
          { label: 'Store Map', path: '/app/map' },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      role: 'assistant',
      content: `Chat cleared! How else can I guide you across Tschüss today? You can browse [Discover Food Deals](/app/discover) or check [Store Map](/app/map).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Discover Food Deals', path: '/app/discover' },
        { label: 'Explore Store Map', path: '/app/map' },
      ],
    };
    setMessages([welcomeMsg]);
    localStorage.removeItem('tschuss_chat_history');
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    // On small screens, close the chat modal so the user sees the page they clicked
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Bubble */}
      <div 
        id="tschuss-ai-launcher"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2"
      >
        {/* First time teaser tooltip */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-900 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700 max-w-xs flex items-center gap-2 mb-1 cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
              <div className="leading-tight">
                <span className="font-bold text-emerald-400 block text-2xs uppercase tracking-wider">Tschüss AI</span>
                <span className="text-stone-300">Need help finding deals or registering a store?</span>
              </div>
              <button
                type="button"
                aria-label="Close message"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-stone-400 hover:text-white p-1 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          type="button"
          id="btn-toggle-tschuss-ai"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Tschüss AI Assistant' : 'Open Tschüss AI Assistant'}
          className={`relative flex items-center gap-2 px-4 py-3 rounded-full shadow-xl transition-all duration-300 font-bold text-sm cursor-pointer border ${
            isOpen
              ? 'bg-stone-900 text-white border-stone-800'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400/40 hover:shadow-emerald-900/20 hover:shadow-2xl'
          }`}
        >
          {/* Active pulse beacon */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          )}

          {isOpen ? (
            <>
              <X className="w-5 h-5 text-stone-300" />
              <span>Close AI</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Tschüss AI</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Expanded Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="tschuss-ai-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-36 right-4 sm:bottom-20 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md h-[550px] max-h-[82vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden hardware-accelerated"
          >
            {/* Chat Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-tight font-display text-white">Tschüss AI</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-3xs text-stone-300 font-medium">Food Rescue & Website Navigator</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-clear-chat-history"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="btn-close-chat-modal"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-br-xs'
                          : 'bg-stone-100/90 text-stone-800 border border-stone-200/80 rounded-bl-xs'
                      }`}
                    >
                      {/* Message Content rendered with ReactMarkdown */}
                      <div className="space-y-2 prose-xs">
                        <Markdown
                          components={{
                            a: ({ href, children }) => {
                              const isInternal = href?.startsWith('/');
                              return (
                                <button
                                  type="button"
                                  onClick={() => href && handleActionClick(href)}
                                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg text-2xs transition-colors my-0.5 cursor-pointer no-underline"
                                >
                                  <span>{children}</span>
                                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                                </button>
                              );
                            },
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-1.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-1.5">{children}</ol>,
                            li: ({ children }) => <li className="leading-snug">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-stone-900">{children}</strong>,
                            h3: ({ children }) => <h4 className="font-black text-xs text-stone-950 mt-1 mb-0.5">{children}</h4>,
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>

                      <span
                        className={`block text-3xs mt-1.5 ${
                          isUser ? 'text-emerald-200/75 text-right' : 'text-stone-400 text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Suggested Navigation Pills beneath AI Message */}
                    {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={`${action.path}-${idx}`}
                            type="button"
                            onClick={() => handleActionClick(action.path)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-700 hover:text-emerald-900 text-2xs font-semibold shadow-2xs transition-all cursor-pointer group active:scale-95"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Loading Thinking Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-stone-100 text-stone-600 max-w-[80%] border border-stone-200"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-2xs font-medium text-stone-600">Tschüss AI is finding the best answer...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips when only welcome message */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/50">
                <span className="text-3xs font-bold uppercase text-stone-400 tracking-wider block mb-1.5">
                  Suggested Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSendMessage(prompt.text)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-700 hover:text-emerald-900 text-3xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-stone-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  id="tschuss-ai-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Tschüss AI anything..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-100 border border-stone-200 focus:border-emerald-500 focus:bg-white text-stone-900 placeholder:text-stone-400 text-xs px-3.5 py-2.5 rounded-2xl outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  id="btn-send-tschuss-ai"
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between mt-2 text-3xs text-stone-400 px-1">
                <span>Gemini-powered Assistant</span>
                <span>Tschüss Food Rescue</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
