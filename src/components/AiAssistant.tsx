import React, { useState, useRef, useEffect } from 'react';
import { BudgetSummary, ChatMessage, CurrencyConfig, Expense } from '../types';
import { generateLocalFinancialAdvice } from '../utils/financialAdvisor';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertCircle,
  X,
  Minimize2,
  Flame,
  PieChart,
  Percent,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface AiAssistantProps {
  allowance: number;
  currency: CurrencyConfig;
  summary: BudgetSummary;
  expenses: Expense[];
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  allowance,
  currency,
  summary,
  expenses,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'initial-welcome',
      role: 'assistant',
      text: `👋 **Hi there! I'm your AI Budget Co-pilot.**\n\nI have full visibility into your allowance and real-time expenses. Ask me anything, or tap one of the quick interactive prompts below!`,
      timestamp: Date.now(),
      provider: 'claude',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    if (allowance <= 0) {
      setErrorMsg('Please enter your monthly allowance in the card above first!');
      return;
    }
    setErrorMsg(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          allowance,
          currency: { ...currency, symbol: currency.symbol === '₨' ? 'Rs.' : currency.symbol },
          expenses,
          summary: {
            totalSpent: summary.totalSpent,
            remaining: summary.remaining,
            percentageSpent: summary.percentageSpent,
            daysLeftInMonth: summary.daysLeftInMonth,
            categoryTotals: summary.categoryTotals,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      let replyText = data?.reply;

      if (!replyText || data?.fallbackNeeded) {
        replyText = generateLocalFinancialAdvice(
          query,
          allowance,
          currency,
          summary,
          expenses
        );
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        provider: data?.provider || 'local',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.warn('Using local financial advisor:', err);
      const fallbackReply = generateLocalFinancialAdvice(
        query,
        allowance,
        currency,
        summary,
        expenses
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: fallbackReply,
        timestamp: Date.now(),
        provider: 'local',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: `💬 Chat reset! What financial question can I help you tackle today?`,
        timestamp: Date.now(),
        provider: 'claude',
      },
    ]);
  };

  const interactivePrompts = [
    {
      label: 'Analyze spending',
      icon: PieChart,
      color: 'hover:text-[#808000]',
      prompt: 'Analyze my spending and tell me where I am overspending.',
    },
    {
      label: 'Roast my habits 🔥',
      icon: Flame,
      color: 'hover:text-amber-600',
      prompt: 'Roast my spending habits with a witty savage review!',
    },
    {
      label: '50/30/20 split',
      icon: Percent,
      color: 'hover:text-[#808000]',
      prompt: 'Show me a recommended budget split (50/30/20) for my allowance.',
    },
    {
      label: 'Will I exhaust early?',
      icon: Clock,
      color: 'hover:text-rose-600',
      prompt: 'Will my current pace exhaust my allowance before month-end?',
    },
  ];

  return (
    <>
      {/* 1. COLLAPSED FLOATING BUTTON AT BOTTOM-LEFT */}
      {!isOpen && (
        <div className="fixed bottom-5 left-5 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-[#808000] hover:bg-[#6e6e00] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Open AI Financial Advisor"
          >
            <div className="relative">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>

            <span className="text-xs font-semibold tracking-wide">
              AI Advisor
            </span>

            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono hidden sm:inline">
              Claude Sonnet
            </span>
          </button>
        </div>
      )}

      {/* 2. EXPANDED INTERACTIVE CHAT DOCKED AT BOTTOM-LEFT */}
      {isOpen && (
        <div className="fixed bottom-5 left-4 sm:left-6 z-40 w-[92vw] sm:w-[410px] h-[540px] max-h-[85vh] bg-white/95 dark:bg-[#1b1c17]/95 backdrop-blur-md border border-[#e5e5dc] dark:border-[#2b2d24] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-[#f8f8f4] dark:bg-[#151611] border-b border-[#e8e8df] dark:border-[#282a20] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#808000] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    AI Financial Advisor
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#808000] dark:bg-[#c4c43b] animate-ping" />
                </div>
                <p className="text-[10px] text-stone-400">
                  Powered by Claude Sonnet 4.6 · Real-time budget analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                title="Minimize assistant"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Warning banner if allowance not set */}
          {allowance <= 0 && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Set your monthly allowance to unlock live budget forecasts!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2 bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#808000] text-white rounded-br-xs font-medium'
                        : 'bg-[#f8f8f4] dark:bg-[#23251e] text-stone-800 dark:text-stone-200 rounded-bl-xs border border-[#ebebe3] dark:border-[#2f3127]'
                    }`}
                  >
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ') || line.startsWith('## ')) {
                        return (
                          <p key={idx} className="font-bold text-xs text-[#808000] dark:text-[#c4c43b] mt-1.5 mb-0.5">
                            {line.replace(/^#+\s*/, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={idx} className="font-semibold text-stone-900 dark:text-stone-100 mt-1 mb-0.5">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-0.5">
                            <span className="text-[#808000] dark:text-[#c4c43b] font-bold">•</span>
                            <span>{line.replace(/^[-*•]\s*/, '')}</span>
                          </div>
                        );
                      }
                      return line ? <p key={idx} className="my-0.5">{line}</p> : <div key={idx} className="h-1" />;
                    })}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 px-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 bg-[#f8f8f4] dark:bg-[#23251e] rounded-xl text-stone-500 max-w-[150px] text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#808000]" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Action Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-[#ecece4] dark:border-[#272920] bg-[#fbfbf9]/60 dark:bg-[#171813]/60 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {interactivePrompts.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleSendMessage(btn.prompt)}
                    disabled={isLoading}
                    className="px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-[#f0f0ea] hover:bg-[#e4e4dc] dark:bg-[#23251e] dark:hover:bg-[#2b2e25] rounded-md whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3 text-[#808000] dark:text-[#c4c43b]" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5 pt-1.5 pb-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your budget, savings, or pace..."
                disabled={isLoading}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#2d3027] rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#808000] focus:ring-1 focus:ring-[#808000] transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-[#808000] hover:bg-[#6e6e00] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
