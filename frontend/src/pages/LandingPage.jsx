import { Link, Navigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Calendar,
  Camera,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: MessageSquare,
    title: 'Q&A, voted by your peers',
    body: 'Ask in plain words, answer when you can. The most useful replies float to the top — no clutter, no noise.',
  },
  {
    icon: Users,
    title: 'Live study rooms',
    body: 'Open a video room for revision, drop in on someone else\'s. Built-in chat keeps notes flowing while you work.',
  },
  {
    icon: Calendar,
    title: 'A planner that actually fits',
    body: 'Tell it what you have to study and how much time you\'ve got. It lays out a week you can keep.',
  },
  {
    icon: Camera,
    title: 'Focus camera',
    body: 'Optional camera tools detect when your phone joins the desk. Honest study, just for you.',
  },
];

const reasons = [
  'Made for university students, not generic learners',
  'Free for your whole cohort',
  'Works on whatever device you\'re holding',
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 glass-strong">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-1.5 group">
            <span className="w-2 h-2 rounded-full bg-accent-500 group-hover:bg-accent-600 transition-colors" />
            <span className="text-[18px] font-semibold text-primary-800 tracking-tight">
              AskUni
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13.5px] text-primary-500">
            <a href="#features" className="hover:text-primary-800 transition-colors">Features</a>
            <a href="#why" className="hover:text-primary-800 transition-colors">Why us</a>
            <a href="#cta" className="hover:text-primary-800 transition-colors">Get started</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button variant="accent" size="sm">
                Sign up
                <ArrowRight size={14} strokeWidth={2.2} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(196,98,74,0.10), transparent 60%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[480px] opacity-[0.5]"
          style={{
            backgroundImage: `linear-gradient(rgba(66,62,53,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(66,62,53,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 90%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-primary-200/70 text-[12px] font-medium text-primary-600 backdrop-blur-sm">
            <Sparkles size={12} strokeWidth={2} className="text-accent-500" />
            Built for university students
          </span>

          <h1 className="mt-6 text-[44px] sm:text-[64px] font-semibold tracking-[-0.025em] text-primary-900 leading-[1.02]">
            Where your cohort
            <br className="hidden sm:block" />
            <span className="text-primary-400"> studies </span>
            together.
          </h1>

          <p className="mt-6 text-[15.5px] sm:text-[17px] text-primary-500 max-w-xl mx-auto leading-relaxed">
            AskUni is a quiet corner of the internet for asking, answering, and
            cramming with the people on your modules. No timelines, no streaks —
            just the work.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register">
              <Button variant="accent" size="lg">
                Create your account
                <ArrowRight size={15} strokeWidth={2.2} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                I already have one
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-[12.5px] text-primary-400">
            Free for students. No credit card. No nonsense.
          </p>
        </div>

        {/* Hero preview card */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="glass-strong rounded-2xl p-2 shadow-[0_24px_60px_-20px_rgba(26,24,21,0.18)]">
            <div className="rounded-xl bg-white/60 border border-primary-200/60 p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { k: '01', label: 'Active questions', value: '2,148' },
                  { k: '02', label: 'Live rooms', value: '37' },
                  { k: '03', label: 'Modules covered', value: '120+' },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg bg-white/70 border border-primary-200/60 p-4">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-primary-400">
                      {s.k} · {s.label}
                    </div>
                    <div className="mt-2 text-[28px] font-semibold tracking-tight text-primary-800 tabular-nums">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <span className="text-[12px] font-medium uppercase tracking-wider text-accent-600">
            What you get
          </span>
          <h2 className="mt-2 text-[32px] sm:text-[38px] font-semibold tracking-tight text-primary-900 leading-tight">
            Four tools, one quiet desk.
          </h2>
          <p className="mt-3 text-[14.5px] text-primary-500 leading-relaxed">
            Everything's connected — questions cite modules, sessions cite chapters,
            and the planner pulls from your week. Nothing more than you need.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group glass rounded-xl p-6 card-hover"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-500/10 text-accent-600 group-hover:bg-accent-500 group-hover:text-white transition-colors">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 text-[16.5px] font-semibold text-primary-800 tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] text-primary-500 leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="max-w-6xl mx-auto px-6 py-20">
        <div className="glass-strong rounded-2xl p-8 sm:p-12 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <span className="text-[12px] font-medium uppercase tracking-wider text-accent-600">
              Why AskUni
            </span>
            <h2 className="mt-2 text-[30px] sm:text-[36px] font-semibold tracking-tight text-primary-900 leading-tight">
              Built for the way students
              <br className="hidden sm:block" />
              actually work.
            </h2>
            <p className="mt-4 text-[14.5px] text-primary-500 leading-relaxed max-w-md">
              Most study apps were dropped by people who haven't sat an exam in a
              decade. We're building the one we wished we had — small, focused,
              and yours.
            </p>
          </div>

          <ul className="space-y-3">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-accent-500/10 text-accent-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span className="text-[14px] text-primary-700 leading-relaxed">
                  {r}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.02em] text-primary-900 leading-[1.05]">
          Pull up a chair.
        </h2>
        <p className="mt-4 text-[15px] text-primary-500 max-w-md mx-auto leading-relaxed">
          Sign up once, and you've got the whole desk — questions, rooms, planner,
          and camera. Free for students.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link to="/register">
            <Button variant="accent" size="lg">
              Get started
              <ArrowRight size={15} strokeWidth={2.2} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="lg">Sign in instead</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-200/70 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-primary-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            <span className="font-medium text-primary-600">AskUni</span>
            <span>·</span>
            <span>Made for students.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-primary-700 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-primary-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
