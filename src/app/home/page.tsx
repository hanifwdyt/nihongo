'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'motion/react';

// ─── Helpers ────────────────────────────────────────────────

function useTypewriter(words: string[], speed = 100, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(current.slice(0, text.length + 1));
          if (text.length + 1 === current.length) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          setText(current.slice(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, speed, pause]);

  return text;
}

function SectionReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating Kanji Background ──────────────────────────────

const FLOATING_KANJI = ['漢', '字', '語', '学', '読', '書', '話', '聞', '見', '食', '行', '来', '人', '日', '本', '大', '小', '山', '川', '花'];

// Deterministic pseudo-random based on index to avoid hydration mismatch
function seeded(i: number, offset = 0): number {
  const x = Math.sin((i + 1) * 9301 + offset * 4999) * 10000;
  return x - Math.floor(x);
}

function FloatingKanji() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {FLOATING_KANJI.map((char, i) => (
        <motion.span
          key={i}
          className="absolute text-emerald-500/[0.04] dark:text-emerald-400/[0.06] font-bold"
          style={{
            fontSize: `${seeded(i, 0) * 60 + 40}px`,
            left: `${seeded(i, 1) * 100}%`,
            top: `${seeded(i, 2) * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, seeded(i, 3) > 0.5 ? 10 : -10, 0],
          }}
          transition={{
            duration: seeded(i, 4) * 6 + 6,
            repeat: Infinity,
            delay: seeded(i, 5) * 4,
            ease: 'easeInOut',
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Kana Rain Effect ───────────────────────────────────────

const KANA_CHARS = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('');

function KanaRain() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-emerald-500/[0.07] dark:text-emerald-400/[0.08] text-lg font-light"
          style={{ left: `${(i / 20) * 100 + seeded(i, 10) * 5}%` }}
          initial={{ top: '-5%', opacity: 0 }}
          animate={{ top: '105%', opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: seeded(i, 11) * 8 + 10,
            repeat: Infinity,
            delay: seeded(i, 12) * 10,
            ease: 'linear',
          }}
        >
          {KANA_CHARS[Math.floor(seeded(i, 13) * KANA_CHARS.length)]}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Stats Counter ──────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const duration = 1500;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Interactive Kana Demo ──────────────────────────────────

const DEMO_KANA = [
  { char: 'あ', romaji: 'a', en: 'ah' },
  { char: 'い', romaji: 'i', en: 'ee' },
  { char: 'う', romaji: 'u', en: 'oo' },
  { char: 'え', romaji: 'e', en: 'eh' },
  { char: 'お', romaji: 'o', en: 'oh' },
  { char: 'か', romaji: 'ka', en: 'kah' },
  { char: 'さ', romaji: 'sa', en: 'sah' },
  { char: 'た', romaji: 'ta', en: 'tah' },
];

function KanaDemo() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-4 gap-3">
      {DEMO_KANA.map((k, i) => (
        <motion.button
          key={i}
          onHoverStart={() => setActive(i)}
          onHoverEnd={() => setActive(null)}
          onTap={() => setActive(active === i ? null : i)}
          className="relative aspect-square rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-3xl sm:text-4xl font-bold text-zinc-800 dark:text-zinc-100 cursor-pointer overflow-hidden"
          whileHover={{ scale: 1.08, borderColor: '#10b981' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            {active === i ? (
              <motion.div
                key="romaji"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <span className="text-emerald-600 text-2xl sm:text-3xl font-bold">{k.romaji}</span>
                <span className="text-xs text-zinc-400 mt-1">{k.en}</span>
              </motion.div>
            ) : (
              <motion.span
                key="kana"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
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

// ─── Feature Card ───────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay = 0,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <SectionReveal delay={delay}>
      <motion.div
        className="group relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-8 overflow-hidden h-full"
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </SectionReveal>
  );
}

// ─── Testimonial / Social Proof ─────────────────────────────

const LEARNING_PATH = [
  { step: '01', title: 'Kana', desc: 'Master Hiragana & Katakana with timed quizzes. 5 progressive levels for each.', icon: 'あ', color: 'emerald' },
  { step: '02', title: 'Kanji', desc: '107 essential N5 kanji with readings, meanings, stroke order, and example words.', icon: '漢', color: 'sky' },
  { step: '03', title: 'Vocabulary', desc: '199 N5 words organized by category. Each with example sentences and readings.', icon: '語', color: 'violet' },
  { step: '04', title: 'Reading', desc: '10 curated passages with furigana, comprehension quizzes, and difficulty levels.', icon: '読', color: 'amber' },
  { step: '05', title: 'Review', desc: 'Spaced repetition flashcards powered by FSRS algorithm. Never forget what you learned.', icon: '復', color: 'rose' },
];

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 60]);

  const typewriterText = useTypewriter(
    ['Hiragana & Katakana', 'Kanji & Vocabulary', 'Reading & Listening', 'JLPT N5 to N1'],
    80,
    2500,
  );

  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  return (
    <div className="overflow-x-hidden">
      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <FloatingKanji />

        {/* Radial gradient bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)]" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Free to use — No credit card required
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]"
          >
            <span className="text-zinc-900 dark:text-zinc-100">Learn</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Japanese
            </span>
            <br />
            <span className="text-zinc-900 dark:text-zinc-100 text-4xl sm:text-5xl lg:text-6xl font-bold">
              the way that sticks.
            </span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 font-light h-8"
          >
            Master{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {typewriterText}
            </span>
            <span className="animate-pulse">|</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Learning Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/kana"
              className="px-8 py-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 font-semibold text-lg text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              Try Kana Quiz
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {[
              { label: 'Kana Characters', value: '236+' },
              { label: 'N5 Kanji', value: '107' },
              { label: 'Vocabulary', value: '199+' },
              { label: 'Reading Passages', value: '10' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-start justify-center p-1.5"
          >
            <motion.div
              animate={{ opacity: [0, 1, 0], y: [0, 12, 12] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════ INTERACTIVE KANA DEMO ══════════ */}
      <section className="relative py-28 sm:py-36 px-6">
        <KanaRain />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionReveal>
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">Interactive Learning</span>
                <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                  Kana at your<br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">fingertips.</span>
                </h2>
                <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                  Hover or tap each character to reveal its reading. Start from basic vowels and work your way through 5 progressive levels of Hiragana and Katakana.
                </p>
                <div className="mt-8 flex items-center gap-6">
                  <div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100"><AnimatedCounter target={236} suffix="+" /></div>
                    <div className="text-sm text-zinc-500">Kana characters</div>
                  </div>
                  <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
                  <div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">5</div>
                    <div className="text-sm text-zinc-500">Progressive levels</div>
                  </div>
                  <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
                  <div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Free</div>
                    <div className="text-sm text-zinc-500">No signup needed</div>
                  </div>
                </div>
                <Link
                  href="/kana"
                  className="mt-8 inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all"
                >
                  Start Kana Quiz
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <KanaDemo />
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES GRID ══════════ */}
      <section className="py-28 sm:py-36 px-6 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <SectionReveal className="text-center mb-16">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">Everything You Need</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100">
              One app. Complete journey.
            </h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              From your first あ to reading Japanese novels. Every tool you need to master the language.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="あ"
              title="Kana Mastery"
              description="Learn all Hiragana & Katakana through timed quizzes. 5 progressive levels from basic vowels to combination characters."
              gradient="bg-gradient-to-br from-emerald-500/5 to-transparent"
              delay={0}
            />
            <FeatureCard
              icon="漢"
              title="107 N5 Kanji"
              description="Browse, study, and quiz yourself on essential JLPT N5 kanji. Complete with readings, meanings, and example words."
              gradient="bg-gradient-to-br from-sky-500/5 to-transparent"
              delay={0.1}
            />
            <FeatureCard
              icon="語"
              title="199+ Vocabulary"
              description="N5 vocabulary organized by category — greetings, numbers, food, time, and more. Each with example sentences."
              gradient="bg-gradient-to-br from-violet-500/5 to-transparent"
              delay={0.2}
            />
            <FeatureCard
              icon="読"
              title="Reading Practice"
              description="10 curated N5 passages with furigana support, comprehension questions, and difficulty ratings."
              gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
              delay={0.3}
            />
            <FeatureCard
              icon="復"
              title="SRS Flashcards"
              description="Spaced repetition powered by the FSRS algorithm. Rate your recall and the system optimizes your review schedule."
              gradient="bg-gradient-to-br from-rose-500/5 to-transparent"
              delay={0.4}
            />
            <FeatureCard
              icon="友"
              title="AI Study Buddy"
              description="Chat with Sensei, your personal AI tutor. Get quizzed, receive tips, and let the AI remember your strengths and weaknesses."
              gradient="bg-gradient-to-br from-teal-500/5 to-transparent"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ══════════ LEARNING PATH ══════════ */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionReveal className="text-center mb-20">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">Your Learning Path</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100">
              Step by step to fluency.
            </h2>
          </SectionReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-sky-500 via-violet-500 via-amber-500 to-rose-500 opacity-20" />

            <div className="space-y-12">
              {LEARNING_PATH.map((item, i) => (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="flex gap-6 sm:gap-8">
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold bg-${item.color}-100 dark:bg-${item.color}-900/20 border-2 border-${item.color}-200 dark:border-${item.color}-800/30`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        style={{
                          backgroundColor: item.color === 'emerald' ? 'rgb(209 250 229 / 0.5)' :
                            item.color === 'sky' ? 'rgb(224 242 254 / 0.5)' :
                            item.color === 'violet' ? 'rgb(237 233 254 / 0.5)' :
                            item.color === 'amber' ? 'rgb(254 243 199 / 0.5)' :
                            'rgb(255 228 230 / 0.5)',
                        }}
                      >
                        {item.icon}
                      </motion.div>
                    </div>
                    <div className="pt-1">
                      <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-1">Step {item.step}</div>
                      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                      <p className="mt-2 text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">{item.desc}</p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ AI BUDDY SECTION ══════════ */}
      <section className="py-28 sm:py-36 px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950/50 dark:to-zinc-950/0 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionReveal>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">AI-Powered</span>
              <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                Meet your personal<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Sensei.</span>
              </h2>
              <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                An AI study buddy that remembers your progress, quizzes you on weak points, and keeps you motivated with anime-style encouragement.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Remembers your strengths and weaknesses',
                  'Generates personalized quiz questions',
                  'Explains grammar with simple examples',
                  'Streaming responses, not a wall of text',
                  'Choose from 8 companion creatures',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </SectionReveal>

            {/* Chat mockup */}
            <SectionReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl shadow-emerald-500/5">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg">🐉</div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Ryuu Sensei</div>
                      <div className="text-xs text-emerald-600">Online</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <ChatBubble side="left" delay={0.3}>
                      Konnichiwa! <strong>Apa kanji ini artinya apa?</strong> 🤔
                    </ChatBubble>
                    <ChatBubble side="left" delay={0.5}>
                      <span className="text-4xl block mb-2">山</span>
                    </ChatBubble>
                    <ChatBubble side="right" delay={0.8}>
                      Mountain! Yama!
                    </ChatBubble>
                    <ChatBubble side="left" delay={1.1}>
                      <strong>Sugoi!</strong> Bener banget! On&apos;yomi: <strong>サン (san)</strong>, Kun&apos;yomi: <strong>やま (yama)</strong>. Contoh: <strong>富士山</strong> (Fujisan) = Gunung Fuji! 🎉
                    </ChatBubble>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ══════════ JLPT LEVELS ══════════ */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">JLPT Preparation</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100">
              From N5 to N1.
            </h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Content structured around JLPT levels. Start with N5 fundamentals and progress at your own pace.
            </p>
          </SectionReveal>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {[
              { level: 'N5', label: 'Beginner', content: '107 Kanji, 199 Vocab, 10 Readings', active: true },
              { level: 'N4', label: 'Elementary', content: 'Coming soon', active: false },
              { level: 'N3', label: 'Intermediate', content: 'Coming soon', active: false },
              { level: 'N2', label: 'Upper Int.', content: 'Coming soon', active: false },
              { level: 'N1', label: 'Advanced', content: 'Coming soon', active: false },
            ].map((item, i) => (
              <SectionReveal key={i} delay={i * 0.08}>
                <motion.div
                  onHoverStart={() => setHoveredLevel(i)}
                  onHoverEnd={() => setHoveredLevel(null)}
                  className={`relative w-36 sm:w-44 rounded-2xl border-2 p-6 cursor-default transition-colors ${
                    item.active
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  whileHover={{ y: -4 }}
                >
                  <div className={`text-3xl font-black ${item.active ? 'text-emerald-600' : 'text-zinc-300 dark:text-zinc-600'}`}>
                    {item.level}
                  </div>
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">{item.label}</div>
                  <AnimatePresence>
                    {hoveredLevel === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-xs text-zinc-500"
                      >
                        {item.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {item.active && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      LIVE
                    </div>
                  )}
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COMPANIONS ══════════ */}
      <section className="py-28 sm:py-36 px-6 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto text-center">
          <SectionReveal>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-widest uppercase">Choose Your Buddy</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100">
              8 unique companions.
            </h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Pick a study buddy that matches your vibe. Each has their own personality.
            </p>
          </SectionReveal>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { emoji: '🐉', name: 'Ryuu', trait: 'Wise & encouraging', color: '#10b981' },
              { emoji: '🦊', name: 'Kitsune', trait: 'Playful & mischievous', color: '#f97316' },
              { emoji: '🦝', name: 'Ponta', trait: 'Chill & funny', color: '#8b5cf6' },
              { emoji: '🦉', name: 'Fukurou', trait: 'Scholarly & precise', color: '#6366f1' },
              { emoji: '🐱', name: 'Neko', trait: 'Sassy but caring', color: '#ec4899' },
              { emoji: '🐰', name: 'Usagi', trait: 'Energetic & supportive', color: '#f472b6' },
              { emoji: '🐧', name: 'Penpen', trait: 'Calm & reliable', color: '#3b82f6' },
              { emoji: '🐼', name: 'Pan-chan', trait: 'Gentle & patient', color: '#6b7280' },
            ].map((c, i) => (
              <SectionReveal key={i} delay={i * 0.06}>
                <motion.div
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 cursor-default"
                  whileHover={{ y: -6, borderColor: c.color }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="text-4xl sm:text-5xl"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {c.emoji}
                  </motion.div>
                  <div className="mt-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">{c.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{c.trait}</div>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative py-32 sm:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-emerald-100/30 dark:via-emerald-950/20 dark:to-emerald-950/10" />
        <FloatingKanji />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <SectionReveal>
            <motion.div
              className="text-7xl sm:text-8xl font-black text-emerald-600/10 dark:text-emerald-400/10 select-none"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              日本語
            </motion.div>
            <h2 className="mt-6 text-4xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
              Ready to start your<br />Japanese journey?
            </h2>
            <p className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
              Join thousands of learners. Free forever for core features. No credit card, no catch.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group relative px-10 py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg overflow-hidden transition-all hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create Free Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/kana"
                className="px-10 py-5 rounded-2xl border-2 border-zinc-300 dark:border-zinc-600 font-bold text-lg text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 transition-colors"
              >
                Try Without Signup
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-lg">日本語</span>
            <span className="text-zinc-400 text-sm">Nihongo &mdash; by hanif.app</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/kana" className="hover:text-emerald-600 transition-colors">Kana</Link>
            <Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-emerald-600 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Chat Bubble Component ──────────────────────────────────

function ChatBubble({ children, side, delay = 0 }: { children: React.ReactNode; side: 'left' | 'right'; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          side === 'right'
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-md'
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
