import * as React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiCloudflare, SiDocker, SiGithub, SiSupabase, SiVercel } from "react-icons/si";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 230, damping: 24 };
const LIFTED_TILES = new Set([5, 14, 23, 34, 41, 53, 62, 71, 79, 88, 97, 108, 119, 131, 146, 157, 169, 184, 199, 213, 226, 241]);
const BRIGHT_TILES = new Set([17, 45, 76, 103, 138, 176, 205, 234]);
const INVOICE_BARS = [62, 44, 70, 36, 56];

const DEFAULT_COPY = {
  showcaseTitle: "One room for your entire stack",
  showcaseDescription: "From React UI to backend microservices, pair with engineers using the exact frameworks, databases, and runtimes your codebase already relies on.",
  pricingTitle: (
    <>
      Always free to pair.<br />
      Pro is just $9/mo.
    </>
  ),
  pricingDescription: "Complete access to find collaborators, post projects, and pair live for $0. Upgrade to Pro anytime for unlimited rooms and priority matching.",
  pauseTitle: (
    <>
      Build on your terms.<br />
      Pair when you want.
    </>
  ),
  activeDescription: "Got a free weekend to hack? Open a live room. Busy with your day job? Pause your pairing sessions and resume anytime.",
  pausedDescription: "Your room is on standby. Jump back in and pick up your code right where you and your co-builder left off.",
};

function ArrowCursor({
  className,
  label,
  inverted = false,
  delay = 0,
  active,
  targetLeft,
  targetTop,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={cn("absolute z-30 flex flex-col items-start pointer-events-none select-none", className)}
      animate={
        reduceMotion
          ? undefined
          : active !== undefined
          ? active
            ? { x: -3, y: -36, rotate: -1.5 }
            : { x: 0, y: 0, rotate: 0 }
          : targetLeft
          ? { left: targetLeft, top: targetTop, x: 0, y: [0, -3, 0], rotate: [0, 1.5, 0] }
          : { x: 0, y: [0, -3, 0], rotate: [0, 1.5, 0] }
      }
      transition={
        active !== undefined
          ? {
              duration: active ? 0.68 : 0.82,
              ease: active ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1],
            }
          : targetLeft
          ? {
              left: spring,
              top: spring,
              y: { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" },
            }
          : { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        width="26"
        height="30"
        viewBox="0 0 26 30"
        fill="none"
        className="h-auto w-[18px] drop-shadow-md sm:w-[22px] lg:w-[26px]"
      >
        <path
          d="M2.2 2.5 22 15.1l-9.4 2.1-4.1 9.1L2.2 2.5Z"
          className={cn(
            inverted
              ? "fill-white stroke-[#080808]"
              : "fill-[#edff00] stroke-white dark:stroke-white/70"
          )}
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          "ml-2.5 -mt-1 px-2.5 py-1 text-[12px] font-semibold tracking-[-0.04em] sm:ml-3 sm:px-3 sm:text-[14px] lg:ml-4 lg:px-4 lg:py-1.5 lg:text-[17px]",
          inverted
            ? "rounded-full bg-[#f2f2f2] text-black shadow-[0_5px_18px_rgba(0,0,0,0.28)]"
            : cn(
                "rounded-[22px] border border-white/60 bg-[#edff00] text-black",
                active
                  ? "shadow-[0_5px_18px_rgba(0,0,0,0.24),0_0_14px_rgba(237,255,0,0.18)]"
                  : "shadow-[0_5px_18px_rgba(0,0,0,0.22)]"
              )
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}

const DEFAULT_BRANDS = [
  { name: "Vercel", icon: SiVercel },
  { name: "GitHub", icon: SiGithub },
  { name: "Supabase", icon: SiSupabase },
  { name: "Cloudflare", icon: SiCloudflare },
  { name: "Docker", icon: SiDocker },
];

function BrandMark({ brand }) {
  const Icon = brand.icon;
  return <Icon className="size-[58%]" aria-hidden />;
}

function Panel({ className, children, ...props }) {
  const grainId = React.useId().replace(/:/g, "");

  return (
    <section
      {...props}
      className={cn(
        "relative isolate overflow-hidden rounded-[15px] border border-[#292929] bg-[#080808] text-[#f1f1f1]",
        "shadow-[inset_0_1px_rgba(255,255,255,0.02),0_12px_32px_rgba(0,0,0,0.22)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.025),transparent_45%)]" />
      {children}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 size-full opacity-[0.1] mix-blend-soft-light"
      >
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="11" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </section>
  );
}

function FeatureCopy({ title, children, className, action }) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 z-20 px-5 pb-5 sm:px-7 sm:pb-7", className)}>
      <h3 className="text-[16px] font-medium leading-[1.08] tracking-[-0.045em] text-[#f1f1f1] sm:text-[18px]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-[330px] text-[12px] leading-[1.35] tracking-[-0.015em] text-[#858585] sm:mt-3 sm:text-[13px]">
        {children}
      </p>
      {action && <div className="mt-3 sm:mt-3.5">{action}</div>}
    </div>
  );
}

function DesignsPanel({
  brands = DEFAULT_BRANDS,
  selectedBrand,
  defaultSelectedBrand = 1,
  autoPlay = true,
  rotationInterval = 2600,
  userLabel = "You",
  collaboratorLabel = "Alex",
  title,
  description,
  onSelectedBrandChange,
}) {
  const [internalSelected, setInternalSelected] = React.useState(defaultSelectedBrand);
  const reduceMotion = useReducedMotion();
  const isControlled = selectedBrand !== undefined;
  const selected = Math.min(Math.max(isControlled ? selectedBrand : internalSelected, 0), brands.length - 1);
  const cursorStops = brands.map((_, index) => `${15 + (70 * index) / Math.max(brands.length - 1, 1)}%`);

  const selectBrand = React.useCallback(
    (index) => {
      if (!isControlled) setInternalSelected(index);
      onSelectedBrandChange?.(index);
    },
    [isControlled, onSelectedBrandChange]
  );

  React.useEffect(() => {
    if (!autoPlay || reduceMotion || brands.length < 2) return;
    const interval = setInterval(() => {
      const next = (selected + 1) % brands.length;
      selectBrand(next);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [autoPlay, brands.length, reduceMotion, rotationInterval, selectBrand, selected]);

  return (
    <Panel className="min-h-[350px] sm:min-h-[320px] lg:col-span-12 @min-[840px]:col-span-12 @min-[840px]:min-h-[302px] @min-[840px]:row-span-1">
      {/* Mosaic Grid of 252 Checkered Tiles with Mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 grid h-[78%] grid-cols-[repeat(28,minmax(0,1fr))] grid-rows-[repeat(9,minmax(0,1fr))] gap-px overflow-hidden"
        style={{ maskImage: "linear-gradient(to bottom,black 0%,black 62%,transparent 100%)" }}
      >
        {Array.from({ length: 252 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "border border-white/[0.018] bg-[#0b0b0b]",
              LIFTED_TILES.has(index) && "bg-[#101010]",
              BRIGHT_TILES.has(index) && "bg-[#151515]"
            )}
          />
        ))}
      </div>

      {/* Moving Light Flare Across the Header */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-[8%] z-[1] hidden h-[66%] w-[24%] rounded-full bg-white/[0.022] blur-[48px] dark:block"
        animate={reduceMotion ? undefined : { x: ["-120%", "520%"] }}
        transition={{ duration: 14, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[76%] bg-[radial-gradient(ellipse_at_50%_18%,transparent_12%,rgba(8,8,8,.1)_58%,#080808_100%)]"
      />

      {/* Row of 5 Tech Brands */}
      <div className="absolute inset-x-4 top-[9%] z-10 mx-auto flex max-w-[760px] items-center gap-1.5 sm:inset-x-7 sm:top-[12%] sm:gap-2.5">
        {brands.map((brand, index) => (
          <motion.button
            type="button"
            key={brand.name}
            onClick={() => selectBrand(index)}
            aria-label={`Select ${brand.name}`}
            aria-pressed={selected === index}
            className={cn(
              "relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[9px] border sm:rounded-[10px] cursor-pointer",
              "bg-[linear-gradient(145deg,#222_0%,#1a1a1a_48%,#141414_100%)] shadow-[inset_0_1px_rgba(255,255,255,.025),0_10px_22px_rgba(0,0,0,.32)]",
              selected === index
                ? "border-[#edff00]/25 text-[#edff00] shadow-[inset_0_1px_rgba(255,255,255,.025),0_10px_24px_rgba(0,0,0,.34),0_0_18px_rgba(237,255,0,.045)]"
                : "border-white/[0.055] text-[#e8e8e8]"
            )}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: selected === index ? -3 : [0, index % 2 ? 1.5 : -1.5, 0],
                    scale: selected === index ? 1.018 : 1,
                  }
            }
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{
              y: { duration: 5 + index * 0.3, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" },
              scale: spring,
            }}
          >
            {/* Ambient Radial Lime Pulse behind active brand */}
            {selected === index && (
              <motion.span
                aria-hidden
                className="absolute inset-[12%] rounded-full bg-[#edff00]/[0.15] blur-xl"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <motion.span
              className="relative flex size-full items-center justify-center"
              animate={{ scale: selected === index ? 1.06 : 1 }}
              transition={spring}
            >
              <BrandMark brand={brand} />
            </motion.span>
          </motion.button>
        ))}
      </div>

      {/* Dynamic Animated Cursors */}
      <ArrowCursor
        label={userLabel}
        className="left-[35%] top-[40%]"
        targetLeft={cursorStops[selected]}
        targetTop="40%"
        delay={0.2}
      />
      <ArrowCursor
        label={collaboratorLabel}
        inverted
        className="left-[58%] top-[54%] sm:left-[62%] sm:top-[56%]"
        delay={0.9}
      />

      <FeatureCopy title={title}>{description}</FeatureCopy>
    </Panel>
  );
}

function InvoicePanel({
  monthlyPrice = 9,
  previousPrice = 15,
  currency = "USD",
  locale = "en-US",
  autoPlay = true,
  title,
  description,
}) {
  const reduceMotion = useReducedMotion();
  const [invoiceIndex, setInvoiceIndex] = React.useState(0);
  const formatPrice = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency, locale]
  );
  const invoices = [
    { label: "Starter", price: 0, previousPrice: null, accent: false, cadence: "/ forever" },
    { label: "Pro Plan", price: monthlyPrice, previousPrice, accent: true, cadence: "/ month" },
  ];

  React.useEffect(() => {
    if (!autoPlay || reduceMotion) return;
    const interval = setInterval(() => {
      setInvoiceIndex((current) => (current + 1) % invoices.length);
    }, 3900);
    return () => clearInterval(interval);
  }, [autoPlay, invoices.length, reduceMotion]);

  const invoice = invoices[invoiceIndex];

  return (
    <Panel className="min-h-[420px] [container-type:inline-size] sm:min-h-[360px] lg:col-span-7 @min-[840px]:col-span-7 @min-[840px]:min-h-[302px] @min-[840px]:row-span-1">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(circle,currentColor .65px,transparent .75px)",
          backgroundSize: "11px 11px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[53%]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={invoiceIndex}
            className="absolute left-[21%] top-5 h-[225px] w-[58%] overflow-hidden rounded-[10px] border border-[#343434]/80 bg-[linear-gradient(145deg,#1c1c1c_0%,#161616_48%,#101010_100%)] p-3.5 shadow-[inset_0_1px_rgba(255,255,255,.02),0_16px_36px_rgba(0,0,0,.38),0_3px_8px_rgba(0,0,0,.25)] sm:left-auto sm:right-4 sm:h-[250px] sm:w-[89%] @min-[520px]:right-7 @min-[520px]:p-5 cursor-pointer hover:border-[#edff00]/40 transition-colors"
            initial={reduceMotion ? false : { y: 270, opacity: 0, rotate: -1.25 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 285, opacity: 0, rotate: 1.1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/pricing" className="block w-full h-full" aria-label="View pricing plans">
              <div className="flex items-start justify-between text-[#a0a0a0]">
                <span className="text-[12px]">{invoice.label}</span>
                <span className="relative mt-0.5 size-4 rounded-full bg-[#9e9e9e]">
                  <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-l-full bg-[#222]" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2 whitespace-nowrap">
                <span
                  className={cn(
                    "text-[26px] font-medium tracking-[-0.055em] @min-[520px]:text-[30px]",
                    invoice.accent ? "text-[#edff00]" : "text-[#8e8e8e]"
                  )}
                >
                  {formatPrice.format(invoice.price)}
                </span>
                {invoice.previousPrice && (
                  <span className="text-[14px] text-[#767676] line-through @min-[520px]:text-[16px]">
                    {formatPrice.format(invoice.previousPrice)}
                  </span>
                )}
                {invoice.cadence && (
                  <span className="text-[12px] text-zinc-500 font-medium">
                    {invoice.cadence}
                  </span>
                )}
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="h-1 w-[42%] rounded-full bg-white/[0.07]" />
                <div className="h-1 w-[27%] rounded-full bg-white/[0.045]" />
              </div>
              <div className="mt-4 space-y-2.5">
                {INVOICE_BARS.map((width, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <motion.span
                      className="h-2.5 rounded-[3px] bg-white/[0.045]"
                      style={{ width: `${width}%` }}
                      animate={reduceMotion ? undefined : { opacity: [0.35, 0.62, 0.35] }}
                      transition={{ duration: 3.5, delay: index * 0.28, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="h-3 w-[28%] rounded-[4px] bg-white/[0.07]" />
                  </div>
                ))}
              </div>
            </Link>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_bottom,transparent,rgba(17,17,17,.55)_52%,#111_100%)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Foreground Fog Gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%] bg-[linear-gradient(to_bottom,rgba(8,8,8,0)_0%,rgba(8,8,8,0.12)_24%,rgba(8,8,8,0.48)_58%,rgba(8,8,8,0.88)_86%,#080808_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-8%] -bottom-[24%] z-10 h-[48%] rounded-[50%] bg-[#080808]/75 blur-[38px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-white/[0.025]"
      />

      <FeatureCopy
        className="sm:right-1/2 sm:pr-3"
        title={title}
        action={
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#edff00]/40 bg-[#edff00]/10 hover:bg-[#edff00]/20 text-[#edff00] text-xs font-semibold tracking-tight transition-all duration-200 group/btn shadow-[0_0_15px_rgba(237,255,0,0.1)] active:scale-95"
          >
            <span>View pricing & plans</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        }
      >
        {description}
      </FeatureCopy>
    </Panel>
  );
}

function PausePanel({
  paused: controlledPaused,
  defaultPaused = false,
  autoPlay = true,
  spotlightInterval = 4400,
  userLabel = "You",
  title,
  activeDescription,
  pausedDescription,
  onPausedChange,
}) {
  const [internalPaused, setInternalPaused] = React.useState(defaultPaused);
  const [demoLit, setDemoLit] = React.useState(true);
  const reduceMotion = useReducedMotion();
  const isControlled = controlledPaused !== undefined;
  const paused = isControlled ? controlledPaused : internalPaused;
  const arrowLit = autoPlay && demoLit && !reduceMotion;

  React.useEffect(() => {
    if (!autoPlay || reduceMotion) return;

    let offTimer;
    const illuminate = () => {
      setDemoLit(true);
      offTimer = setTimeout(() => setDemoLit(false), 1500);
    };

    const firstTimer = setTimeout(() => setDemoLit(false), 1500);
    const loopTimer = setInterval(illuminate, spotlightInterval);

    return () => {
      clearTimeout(firstTimer);
      if (offTimer) clearTimeout(offTimer);
      clearInterval(loopTimer);
    };
  }, [autoPlay, reduceMotion, spotlightInterval]);

  const toggle = () => {
    const next = !paused;
    if (!isControlled) setInternalPaused(next);
    onPausedChange?.(next);
  };

  return (
    <Panel className="min-h-[340px] sm:min-h-[320px] lg:col-span-5 @min-[840px]:col-span-5 @min-[840px]:min-h-[302px] @min-[840px]:row-span-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%,currentColor 0 .45px,transparent .7px),radial-gradient(circle at 70% 65%,currentColor 0 .45px,transparent .75px)",
          backgroundSize: "4px 4px,5px 5px",
        }}
      />
      <div className="absolute inset-x-0 top-0 flex h-[66%] items-center justify-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((ring) => (
          <motion.div
            key={ring}
            aria-hidden
            className="absolute border border-white/[0.04]"
            style={{
              width: 190 + ring * 23,
              height: 100 + ring * 16,
              borderRadius: 23 + ring * 3,
              opacity: Math.max(0.18, 0.72 - ring * 0.045),
            }}
            animate={reduceMotion ? undefined : { scale: [0.995, 1.008, 0.995] }}
            transition={{ duration: 5.2, delay: ring * 0.11, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          animate={{ scale: arrowLit ? 1.012 : 1 }}
          className={cn(
            "relative z-10 flex h-[78px] min-w-[174px] items-center justify-center overflow-hidden rounded-[20px] border px-8 text-[28px] font-semibold tracking-[-0.055em] transition-[border-color,color,box-shadow] duration-500 cursor-pointer",
            "from-[#181818] to-[#0d0d0d] bg-gradient-to-br",
            arrowLit
              ? "border-[#edff00] text-[#050505] shadow-[0_10px_24px_rgba(0,0,0,.28)]"
              : "border-white/[0.14] text-[#f1f1f1] shadow-[inset_0_1px_rgba(255,255,255,.035),0_10px_30px_rgba(0,0,0,.32)]"
          )}
          aria-pressed={paused}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 bg-[#edff00]"
            animate={{ opacity: arrowLit ? 1 : 0 }}
            transition={{ duration: arrowLit ? 0.64 : 0.76, ease: arrowLit ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1] }}
          />
          <span className="relative z-10 font-bold">{paused ? "Resume" : "Pause"}</span>
        </motion.button>
        <ArrowCursor label={userLabel} className="left-[57%] top-[70%]" delay={0.5} active={arrowLit} />
      </div>

      <FeatureCopy title={title}>{paused ? pausedDescription : activeDescription}</FeatureCopy>
    </Panel>
  );
}

export function ResearchBentoGrid({
  monthlyPrice = 9,
  previousPrice = 15,
  currency = "USD",
  locale = "en-US",
  paused,
  defaultPaused = false,
  selectedBrand,
  defaultSelectedBrand = 1,
  brands = DEFAULT_BRANDS,
  copy,
  autoPlay = true,
  brandRotationInterval = 2600,
  spotlightInterval = 4400,
  userLabel = "You",
  collaboratorLabel = "Alex",
  className,
  onPausedChange,
  onSelectedBrandChange,
  ...props
}) {
  const content = { ...DEFAULT_COPY, ...copy };

  if (brands.length === 0) {
    throw new Error("ResearchBentoGrid requires at least one brand.");
  }

  return (
    <div
      {...props}
      className={cn(
        "flex h-full w-full overflow-y-auto py-12 px-2 text-white [container-type:inline-size] sm:px-4 max-w-6xl mx-auto font-sans",
        className
      )}
    >
      <div className="m-auto grid w-full grid-cols-1 gap-4 sm:gap-5 @min-[840px]:grid-cols-12 @min-[840px]:grid-rows-2 lg:grid-cols-12">
        <DesignsPanel
          brands={brands}
          selectedBrand={selectedBrand}
          defaultSelectedBrand={defaultSelectedBrand}
          autoPlay={autoPlay}
          rotationInterval={brandRotationInterval}
          userLabel={userLabel}
          collaboratorLabel={collaboratorLabel}
          title={content.showcaseTitle}
          description={content.showcaseDescription}
          onSelectedBrandChange={onSelectedBrandChange}
        />
        <InvoicePanel
          monthlyPrice={monthlyPrice}
          previousPrice={previousPrice}
          currency={currency}
          locale={locale}
          autoPlay={autoPlay}
          title={content.pricingTitle}
          description={content.pricingDescription}
        />
        <PausePanel
          paused={paused}
          defaultPaused={defaultPaused}
          autoPlay={autoPlay}
          spotlightInterval={spotlightInterval}
          userLabel={userLabel}
          title={content.pauseTitle}
          activeDescription={content.activeDescription}
          pausedDescription={content.pausedDescription}
          onPausedChange={onPausedChange}
        />
      </div>
    </div>
  );
}

export const DeveloperServiceBento = ResearchBentoGrid;
export default ResearchBentoGrid;
