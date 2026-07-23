'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChevronDown, MessageSquare, Bell } from 'lucide-react';
import { usePreranaAI } from '../../hooks/usePreranaAI';
import { getPageSuggestions } from '../../lib/ai/prompts';
import type { AIContext } from '../../types/ai';

interface PreranaAIProps {
  context: AIContext;
}

export default function PreranaAI({ context }: PreranaAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, isLoading, clearMessages, insights } = usePreranaAI(context);
  const suggestions = getPageSuggestions(context.page);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setShowSuggestions(false);
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    sendMessage(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getRoleColor = () => {
    const colors: Record<string, string> = {
      student: '#7C3AED',
      parent: '#7C3AED',
      teacher: '#F97316',
      recruiter: '#6366F1',
      admin: '#7C3AED',
    };
    return colors[context.role] || '#7C3AED';
  };

  function stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[-*]\s/gm, '')
      .replace(/^#+\s/gm, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^>\s/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  }

  const color = getRoleColor();

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-2xl transition-all hover:shadow-xl"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        {isOpen ? <X size={22} /> : <Bot size={22} />}
      </motion.button>

      {/* Insight Indicator */}
      {insights.length > 0 && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 z-50 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="relative flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
            <Bell size={14} className="text-[#7C3AED]" />
            <span className="text-xs font-bold text-[#0F172A]">{insights[0]?.message}</span>
          </div>
        </motion.div>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl shadow-black/10 sm:w-[420px]"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Prerana AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                    <span className="text-[10px] font-semibold text-white/80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearMessages} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white" title="Clear chat">
                  <MessageSquare size={13} />
                </button>
                <button onClick={() => setIsOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white">
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: '400px' }}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#F3F0FF]">
                    <Sparkles size={28} className="text-[#7C3AED]" />
                  </div>
                  <p className="text-sm font-extrabold text-[#0F172A]">How can I help you?</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">I&apos;m your {context.role} portal assistant</p>

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {suggestions.slice(0, 4).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="rounded-xl border border-[#EDE9FE] bg-[#F5F3FF] px-3 py-2 text-[11px] font-bold text-[#7C3AED] transition hover:bg-[#EDE9FE]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'border border-[#E2E8F0] bg-[#FAFAFA] text-[#475569]'
                        }`}
                        style={msg.role === 'user' ? { background: `linear-gradient(135deg, ${color}, ${color}dd)` } : {}}
                      >
                        <div className="whitespace-pre-wrap">{stripMarkdown(msg.content)}{msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse" style={{ background: color }} />}</div>
                        {!msg.isStreaming && (
                          <p className="mt-1 text-[10px] font-medium opacity-60">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#E2E8F0] px-4 py-3">
              <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2 transition focus-within:border-[#7C3AED]/30 focus-within:shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask Prerana AI...`}
                  className="flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: color }}
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[9px] font-medium text-[#94A3B8]">
                Powered by Prerana AI — Prasynx Intelligent Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
