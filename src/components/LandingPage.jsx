import { Link } from "react-router-dom";
import bgImage from "../assets/bg-image.png";

const howItWorksSteps = [
  {
    title: "Create a developer profile",
    description:
      "Showcase your stack, experience, and interests so other developers can discover the real you.",
  },
  {
    title: "Discover other developers",
    description:
      "Explore relevant developer profiles based on skills, goals, and collaboration preferences.",
  },
  {
    title: "Connect and collaborate",
    description:
      "Send requests, start conversations, and build meaningful professional relationships.",
  },
];

const features = [
  "Developer discovery",
  "Profile matching and connections",
  "Real-time messaging",
  "Premium profile boost",
];

const premiumBenefits = [
  "Increased profile visibility",
  "Featured developer placement",
  "Advanced discovery options",
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,_rgba(254,90,51,0.35),_transparent_35%),radial-gradient(circle_at_82%_10%,_rgba(254,1,66,0.3),_transparent_38%),linear-gradient(180deg,_#090d18_0%,_#070b14_45%,_#090d18_100%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[#fe5a33]/20 blur-3xl" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 md:px-10">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] inline-block text-transparent bg-clip-text"
          >
            DevTinder
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-[#fe5a33] via-[#fe0142] to-[#fe6d27] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(254,90,51,0.9)] transition hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:items-center md:px-10 md:pb-28 md:pt-14">
          <div>
            <p className="mb-5 inline-flex items-center rounded-full border border-[#fe5a33]/40 bg-white/5 px-4 py-1.5 text-sm font-medium text-[#ffd3c8] backdrop-blur">
              Built for builders, founders, and engineers
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Connect with Developers Who Build the Future
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              DevTinder helps developers connect, collaborate, and grow their
              professional network through high-intent discovery and meaningful
              conversations.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-[#fe5a33] via-[#fe0142] to-[#fe6d27] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-16px_rgba(254,90,51,0.95)] transition hover:scale-[1.02]"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/30 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm">
              {[
                { value: "50K+", label: "Developers" },
                { value: "200K+", label: "Connections" },
                { value: "1.2K+", label: "Teams Built" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                >
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-24px_rgba(254,1,66,0.45)] backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                Live Network Pulse
              </p>
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="mt-6 space-y-4">
              {[
                "React Engineer matched with Backend Architect",
                "AI Developer started collaborating on open-source tooling",
                "Mobile Engineer discovered 12 relevant profiles",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-[#0f1628]/80 p-4 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-slate-300">
            From profile to collaboration in three simple steps.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step, idx) => (
            <article
              key={step.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-[#fe5a33]/40 hover:bg-white/[0.06]"
            >
              <p className="text-sm font-semibold text-[#ffb8a7]">
                Step {idx + 1}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-slate-300">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0f1d]/90 py-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Features
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 font-medium text-slate-100 transition hover:border-[#fe0142]/40"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
        <div className="rounded-3xl border border-[#fe5a33]/35 bg-gradient-to-br from-[#1b0f19] via-[#1a1224] to-[#111827] p-8 text-white shadow-[0_24px_80px_-26px_rgba(254,1,66,0.65)] md:p-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Premium Features
          </h2>
          <p className="mt-4 max-w-3xl text-slate-200">
            DevTinder premium membership gives you more reach, stronger profile
            exposure, and deeper discovery tools to accelerate your growth.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {premiumBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-white/15 bg-white/10 p-5"
              >
                <p className="font-semibold">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-14 md:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            About DevTinder
          </h2>
          <p className="mt-5 max-w-4xl text-slate-300">
            DevTinder is built to help developers form meaningful professional
            connections, collaborate on ideas, and turn conversations into real
            products with people who share the same builder mindset.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#070b14]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-300 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex flex-wrap items-center gap-5">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms & Conditions
            </a>
            <a href="#" className="transition hover:text-white">
              Refund Policy
            </a>
            <a
              href="mailto:support@devtinder.app"
              className="transition hover:text-white"
            >
              Contact
            </a>
          </div>
          <a
            href="mailto:support@devtinder.app"
            className="font-semibold text-white"
          >
            support@devtinder.app
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
