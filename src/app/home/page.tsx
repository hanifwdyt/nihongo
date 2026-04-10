'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'motion/react';

// ─── Helpers ────────────────────────────────────────────────

function seeded(i: number, offset = 0): number {
  const x = Math.sin((i + 1) * 9301 + offset * 4999) * 10000;
  return x - Math.floor(x);
}

function RevealText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={inView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode; className?: string; delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const initial = direction === 'up' ? { opacity: 0, y: 30 }
    : direction === 'left' ? { opacity: 0, x: -40 }
    : direction === 'right' ? { opacity: 0, x: 40 }
    : { opacity: 0 };
  const animate = direction === 'up' ? { opacity: 1, y: 0 }
    : direction === 'left' ? { opacity: 1, x: 0 }
    : direction === 'right' ? { opacity: 1, x: 0 }
    : { opacity: 1 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const steps = 90;
    const inc = end / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Kana Demo ──────────────────────────────────────────────

const DEMO_KANA = [
  { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' },
  { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' },
  { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' },
  { char: 'さ', romaji: 'sa' }, { char: 'た', romaji: 'ta' },
  { char: 'な', romaji: 'na' }, { char: 'は', romaji: 'ha' },
  { char: 'ま', romaji: 'ma' }, { char: 'や', romaji: 'ya' },
];

function KanaDemo() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {DEMO_KANA.map((k, i) => (
        <motion.button
          key={i}
          onHoverStart={() => setActive(i)}
          onHoverEnd={() => setActive(null)}
          onTap={() => setActive(active === i ? null : i)}
          className="relative aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center cursor-pointer transition-shadow duration-200"
          style={{ boxShadow: active === i ? '0 0 0 2px var(--accent)' : '0 0 0 1px var(--border)' }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {active === i ? (
              <motion.span
                key="r"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="font-display italic text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400"
              >
                {k.romaji}
              </motion.span>
            ) : (
              <motion.span
                key="k"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="font-jp text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-200"
              >
                {k.char}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Chat Bubble ────────────────────────────────────────────

function ChatBubble({ children, side, delay = 0 }: { children: React.ReactNode; side: 'left' | 'right'; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
        side === 'right'
          ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
          : 'bg-zinc-800 dark:bg-zinc-700 text-zinc-100 rounded-2xl rounded-bl-sm'
      }`}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const kanji1Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const kanji2Y = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ 1. HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-[95svh] flex items-end sm:items-center overflow-hidden texture-washi">
        {/* Ink gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(0,0,0,0.025),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(255,255,255,0.02),transparent)]" />

        {/* Deliberate kanji watermarks */}
        {mounted && (
          <>
            <motion.span style={{ y: kanji1Y }} className="absolute top-[8%] right-[5%] font-jp text-[12rem] sm:text-[18rem] font-black text-zinc-900/[0.02] dark:text-zinc-100/[0.03] select-none pointer-events-none leading-none" aria-hidden>日</motion.span>
            <motion.span style={{ y: kanji2Y }} className="absolute bottom-[5%] left-[-2%] font-jp text-[10rem] sm:text-[14rem] font-black text-zinc-900/[0.015] dark:text-zinc-100/[0.025] select-none pointer-events-none leading-none" aria-hidden>本</motion.span>
          </>
        )}

        {/* Vertical accent text */}
        {mounted && (
          <div className="hidden lg:block absolute right-[6vw] top-1/2 -translate-y-1/2 writing-vertical font-jp text-4xl xl:text-5xl tracking-[0.3em] text-zinc-900/[0.04] dark:text-zinc-100/[0.05] select-none pointer-events-none" aria-hidden>
            日本語を学ぶ
          </div>
        )}

        {/* Content — left-aligned */}
        <motion.div style={{ y: heroY }} className="relative z-10 pl-[6vw] sm:pl-[10vw] pr-6 pb-20 sm:pb-0 pt-32 sm:pt-0 max-w-3xl">
          <RevealText>
            <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.9] tracking-tight text-zinc-900 dark:text-zinc-100">
              Learn
            </h1>
          </RevealText>
          <RevealText delay={0.15}>
            <p className="font-display italic text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              Japanese
            </p>
          </RevealText>
          <RevealText delay={0.3}>
            <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-light text-zinc-400 dark:text-zinc-500 mt-2 max-w-md">
              the way that sticks.
            </p>
          </RevealText>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/register"
              className="group px-7 py-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm transition-all hover:shadow-xl hover:shadow-zinc-900/10 dark:hover:shadow-zinc-100/10"
            >
              <span className="flex items-center gap-2">
                Start Learning
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </Link>
            <Link
              href="/kana"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
            >
              or try kana quiz free <span className="text-xs">→</span>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-5 text-xs text-zinc-400"
          >
            Free forever. No credit card.
          </motion.p>
        </motion.div>
      </section>

      {/* ══════════ 2. STATS BAR ══════════ */}
      <section className="relative">
        <motion.div
          initial={{ clipPath: 'inset(0 50% 0 50%)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-zinc-900 dark:bg-zinc-100 py-6"
        >
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            {[
              { n: 236, s: '+', label: 'Kana' },
              { n: 107, s: '', label: 'Kanji' },
              { n: 199, s: '+', label: 'Vocabulary' },
              { n: 10, s: '', label: 'Readings' },
            ].map((stat, i, arr) => (
              <div key={i} className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-display italic text-2xl sm:text-3xl text-emerald-400 dark:text-emerald-700 tabular-nums">
                    <AnimatedCounter target={stat.n} suffix={stat.s} />
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500 mt-0.5">{stat.label}</div>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-zinc-700 dark:bg-zinc-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════ 3. KANA DEMO ══════════ */}
      <section className="relative ink-wash pt-28 sm:pt-40 pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-20 items-center">
            <FadeIn direction="left">
              <p className="font-display italic text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 leading-snug">
                Touch a character,
              </p>
              <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 leading-snug mt-1">
                see it come alive.
              </p>
              <p className="mt-6 text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm text-[15px]">
                Learn all Hiragana and Katakana through interactive flip cards and timed quizzes. Five progressive levels from basic vowels to combination characters.
              </p>
              <div className="mt-10 flex items-end gap-10">
                <div>
                  <div className="font-display italic text-5xl text-zinc-200 dark:text-zinc-700"><AnimatedCounter target={236} suffix="+" /></div>
                  <div className="text-xs text-zinc-400 mt-1">characters</div>
                </div>
                <div>
                  <div className="font-display italic text-5xl text-zinc-200 dark:text-zinc-700">5</div>
                  <div className="text-xs text-zinc-400 mt-1">levels each</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <KanaDemo />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════ 4. FEATURES — MAGAZINE SPREAD ══════════ */}
      <section className="pt-16 sm:pt-24 pb-24 sm:pb-36 px-6">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">

          {/* A: Hero Feature — Kana + Kanji */}
          <FadeIn direction="left">
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
              <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-8 sm:p-12 min-h-[280px] flex flex-col justify-end">
                {/* Kana grid fragment as decoration */}
                <div className="absolute top-6 right-6 grid grid-cols-3 gap-3 opacity-[0.06] dark:opacity-[0.08] pointer-events-none select-none" aria-hidden>
                  {['あ','い','う','か','き','く','さ','し','す'].map((c,i) => (
                    <span key={i} className="font-jp text-4xl sm:text-5xl font-bold">{c}</span>
                  ))}
                </div>
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">Foundation</p>
                  <h3 className="font-display italic text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">Kana Mastery</h3>
                  <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm max-w-md leading-relaxed">
                    Hiragana and Katakana — the building blocks of Japanese. Timed quizzes, type-answer challenges, and progressive difficulty.
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-800 p-8 sm:p-10 flex flex-col justify-between min-h-[200px]">
                <span className="font-display italic text-7xl sm:text-8xl text-zinc-800 dark:text-zinc-700 select-none leading-none">107</span>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">N5 Kanji</h3>
                  <p className="text-zinc-400 text-sm mt-1">Readings, meanings, stroke order, and example words.</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* B: Vocab + Reading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 sm:p-10 min-h-[280px] flex flex-col justify-end">
                <span className="absolute top-4 right-6 font-display italic text-[7rem] text-zinc-100 dark:text-zinc-800/60 select-none leading-none pointer-events-none" aria-hidden>199</span>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Vocabulary</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">
                    N5 words organized by category — greetings, numbers, food, time. Each with readings and example sentences.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 sm:p-10 min-h-[280px] flex flex-col justify-between">
                <div className="font-jp text-lg leading-[2.2] text-zinc-300 dark:text-zinc-600 select-none" aria-hidden>
                  <ruby>私<rt className="text-zinc-400 dark:text-zinc-500">わたし</rt></ruby>は
                  <ruby>学生<rt className="text-zinc-400 dark:text-zinc-500">がくせい</rt></ruby>です。
                  <ruby>日本語<rt className="text-zinc-400 dark:text-zinc-500">にほんご</rt></ruby>を
                  <ruby>勉強<rt className="text-zinc-400 dark:text-zinc-500">べんきょう</rt></ruby>しています。
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Reading Practice</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">
                    10 curated passages with furigana support, comprehension questions, and difficulty ratings.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* C: SRS + AI Buddy */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-6">
            <FadeIn direction="left" delay={0.05}>
              <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-8 sm:p-10 min-h-[220px] flex flex-col justify-end">
                {/* Stacked cards decoration */}
                <div className="absolute top-8 right-8 pointer-events-none select-none" aria-hidden>
                  <div className="w-20 h-28 rounded-lg bg-zinc-200 dark:bg-zinc-700 transform rotate-6 absolute top-0 right-0" />
                  <div className="w-20 h-28 rounded-lg bg-zinc-150 dark:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 transform -rotate-3 absolute top-1 right-1" />
                  <div className="w-20 h-28 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm relative flex items-center justify-center">
                    <span className="font-jp text-2xl font-bold text-zinc-400">山</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">SRS Flashcards</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">
                    Spaced repetition powered by FSRS. The algorithm optimizes your review schedule — you never forget.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/30 dark:border-emerald-800/20 p-8 sm:p-10 min-h-[220px] flex flex-col justify-end">
                {/* Chat bubble decoration */}
                <div className="absolute top-6 right-6 max-w-[200px] pointer-events-none select-none" aria-hidden>
                  <div className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-xl rounded-br-sm opacity-80">
                    Sugoi! 山 = mountain. On&apos;yomi: サン
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">AI Study Buddy</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">
                    Chat with Sensei — your personal AI tutor. Get quizzed, receive tips, and track your weaknesses automatically.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════ 5. LEARNING PATH — HORIZONTAL SCROLL ══════════ */}
      <section className="bg-zinc-50/80 dark:bg-zinc-950/50 pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="font-display italic text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">Your path</p>
            <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">to fluency.</p>
          </FadeIn>
        </div>

        <div className="mt-10 sm:mt-14 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory px-6 pb-4 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="w-[max(0px,calc((100vw-72rem)/2))] flex-shrink-0" />
          {[
            { step: '01', title: 'Kana', desc: 'Master Hiragana & Katakana with timed quizzes across 5 levels.', color: '#059669' },
            { step: '02', title: 'Kanji', desc: '107 essential N5 kanji — readings, meanings, and example words.', color: '#0284c7' },
            { step: '03', title: 'Vocabulary', desc: '199 words organized by category with example sentences.', color: '#7c3aed' },
            { step: '04', title: 'Reading', desc: '10 curated passages with furigana and comprehension quizzes.', color: '#d97706' },
            { step: '05', title: 'Review', desc: 'SRS flashcards powered by FSRS. Optimal spacing, zero forgetting.', color: '#e11d48' },
          ].map((item, i) => (
            <FadeIn key={i} direction="right" delay={i * 0.1}>
              <div className="snap-start min-w-[260px] sm:min-w-[300px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-7 flex flex-col">
                <div className="h-1 w-10 rounded-full mb-5" style={{ backgroundColor: item.color }} />
                <span className="font-display italic text-6xl text-zinc-100 dark:text-zinc-800 select-none leading-none">{item.step}</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed flex-1">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
          <div className="w-6 flex-shrink-0" />
        </div>
      </section>

      {/* ══════════ 6. AI SENSEI — DARK CINEMATIC ══════════ */}
      <section className="relative bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
        {/* Watermark */}
        {mounted && (
          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 font-jp text-[14rem] sm:text-[20rem] font-black text-zinc-100/[0.015] dark:text-zinc-100/[0.02] select-none pointer-events-none leading-none" aria-hidden>
            先生
          </div>
        )}
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_50%,rgba(16,185,129,0.04),transparent)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 sm:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-center">
            <FadeIn direction="left">
              <p className="font-light text-xl text-zinc-500">Meet your</p>
              <h2 className="font-display italic text-5xl sm:text-6xl text-white mt-1">Sensei.</h2>
              <p className="mt-6 text-zinc-400 leading-relaxed text-[15px] max-w-sm">
                An AI study companion that remembers your progress, quizzes you on weak points, and keeps you motivated.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  'Remembers your strengths and weaknesses',
                  'Generates personalized quiz questions',
                  'Explains grammar with simple examples',
                  'Streams responses in real-time',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="text-sm text-zinc-400 flex items-center gap-2.5"
                  >
                    <span className="text-emerald-500 text-xs">—</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-8 text-xs text-zinc-600">
                Choose from 8 companions:{' '}
                <span className="inline-flex gap-1 ml-1">🐉 🦊 🦝 🦉 🐱 🐰 🐧 🐼</span>
              </p>
            </FadeIn>

            <FadeIn direction="right" delay={0.15}>
              <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-800 shadow-2xl shadow-black/30 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-800 dark:border-zinc-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-jp text-sm font-bold text-zinc-300">Ryuu Sensei</span>
                </div>
                <div className="p-5 space-y-3">
                  <ChatBubble side="left" delay={0.4}>
                    Let&apos;s practice! What does this kanji mean?
                  </ChatBubble>
                  <ChatBubble side="left" delay={0.7}>
                    <span className="font-jp text-3xl font-bold block text-center py-1">山</span>
                  </ChatBubble>
                  <ChatBubble side="right" delay={1.0}>
                    Mountain! やま (yama)
                  </ChatBubble>
                  <ChatBubble side="left" delay={1.4}>
                    <strong>Perfect!</strong> On&apos;yomi: サン, Kun&apos;yomi: やま. Example: <strong>富士山</strong> (Fujisan) = Mt. Fuji
                  </ChatBubble>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════ 7. FINAL CTA ══════════ */}
      <section className="relative texture-washi pt-32 sm:pt-44 pb-36 sm:pb-52 px-6">
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <FadeIn direction="none">
            <h2 className="font-display italic text-[clamp(4rem,12vw,9rem)] leading-[0.85] text-zinc-900 dark:text-zinc-100">
              Begin.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-4 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-light">
              Your Japanese journey starts with one character.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group px-8 py-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold transition-all hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Create Free Account
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              </Link>
              <Link
                href="/kana"
                className="px-8 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                Try Without Signup
              </Link>
            </div>
            <p className="mt-5 text-xs text-zinc-400">Free forever. No credit card.</p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
