'use client';

import { useState, useEffect, useRef } from 'react';
import { useCompanionStore } from '@/store/companion';
import type { Creature } from '@/data/creatures';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function CompanionChat({ creature }: { creature: Creature }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { setMood, setPageFilter, showSpeech } = useCompanionStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/buddy/history');
        if (res.ok) {
          const data = await res.json();
          setMessages(
            (data.messages ?? []).map((m: { id: number; role: string; content: string }) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          );
        }
      } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const assistantMsgId = Date.now() + 1;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setMood('thinking');

    // Add empty assistant message to stream into
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '' },
    ]);

    try {
      const res = await fetch('/api/buddy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: 'Gomen~ ada error. Coba lagi ya! 🙏' }
              : m,
          ),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'text') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.data }
                    : m,
                ),
              );
              setMood('talking');
            } else if (event.type === 'pageFilter') {
              setPageFilter(event.data);
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId && !m.content
            ? { ...m, content: 'Network error~ Coba lagi! 🙏' }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      setMood('idle');
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {!loaded && <div className="text-center text-zinc-400 py-4">Loading...</div>}
        {loaded && messages.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <div className="text-3xl">{creature.emoji}</div>
            <p className="text-zinc-500 text-xs">
              I&apos;m {creature.name}! Ask me anything about Japanese,
              or tell me what you want to study!
            </p>
          </div>
        )}
        {messages.filter((m) => m.content).map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/`(.+?)`/g, '<code class="bg-zinc-200 dark:bg-zinc-700 px-0.5 rounded text-xs">$1</code>')
                  .replace(/\n/g, '<br/>'),
              }}
            />
          </div>
        ))}
        {loading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-1 px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 p-2">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Chat with me..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
