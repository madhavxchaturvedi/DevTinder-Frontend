import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import {
  Check,
  X,
  Sparkles,
  Crown,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const Premium = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isPremium, setIsPremium] = useState(Boolean(user?.isPremium));
  const [membershipType, setMembershipType] = useState(user?.membershipType || null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!user);

  useEffect(() => {
    if (user?.isPremium) {
      setIsPremium(true);
      setMembershipType(user?.membershipType || "pro");
    }
    verifyPremiumUser();
  }, [user]);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data?.isPremium) {
        setIsPremium(true);
        setMembershipType(res.data?.membershipType || "pro");
      }
    } catch (err) {
      console.error("Error verifying premium:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBuyClick = async (type = "silver") => {
    setIsProcessing(true);
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, currency, orderId, keyId, notes } = order.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "OctoPair Pro",
        description: "Upgrade to Developer Pro Membership",
        order_id: orderId,
        prefill: {
          name: `${notes?.firstName || ""} ${notes?.lastName || ""}`.trim(),
          email: notes?.emailId || "",
          contact: "9999999999",
        },
        theme: {
          color: "#ccff00",
        },
        handler: async () => {
          toast.success("Payment successful! Welcome to OctoPair Pro.");
          setIsPremium(true);
          setMembershipType("pro");

          try {
            const profileRes = await axios.get(BASE_URL + "/profile/view", {
              withCredentials: true,
            });
            if (profileRes.data?.data) {
              dispatch(addUser(profileRes.data.data));
            } else if (profileRes.data) {
              dispatch(addUser(profileRes.data));
            }
          } catch (profileErr) {
            console.error("Failed to sync profile after payment:", profileErr);
          }

          verifyPremiumUser();
          setIsProcessing(false);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          toast.error(response?.error?.description || "Payment failed.");
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        toast.info("Payment gateway initialized (demo mode)");
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to initialize payment.");
      console.error("Payment error:", err);
      setIsProcessing(false);
    }
  };

  if (isVerifying && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-100px)] px-4">
        <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin mb-3" />
        <p className="text-xs font-mono text-[#52525b] uppercase tracking-wider">
          Checking membership status...
        </p>
      </div>
    );
  }

  // Active Pro Member Screen
  if (isPremium) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100dvh-100px)] px-4 py-12">
        <div className="glass-card border border-[#b266ff]/30 shadow-[0_0_40px_rgba(178,102,255,0.2)] rounded-xl p-8 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b266ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-xl bg-[#b266ff]/15 border border-[#b266ff]/30 flex items-center justify-center mx-auto mb-5 text-[#b266ff] shadow-[0_0_20px_rgba(178,102,255,0.2)]">
            <Crown className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/30 mb-3">
            <Sparkles className="w-3 h-3 text-[#b266ff]" />
            ACTIVE PRO MEMBER
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f0] mb-2">
            You&apos;re on OctoPair {membershipType === "gold" ? "Pro Max" : "Pro"}
          </h2>
          <p className="text-xs text-[#52525b] leading-relaxed mb-6">
            Your membership is fully active. You have full access to unlimited connection requests, priority matchmaking, verified badges, and collaborative workspaces.
          </p>

          <div className="space-y-2.5 text-left mb-6">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center gap-2.5 text-xs text-[#f0f0f0]">
              <ShieldCheck className="w-4 h-4 text-[#ccff00] shrink-0" />
              <span>Verified Developer Status Active</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center gap-2.5 text-xs text-[#f0f0f0]">
              <Sparkles className="w-4 h-4 text-[#b266ff] shrink-0" />
              <span>Priority Matchmaking Algorithm Enabled</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center gap-2.5 text-xs text-[#f0f0f0]">
              <Zap className="w-4 h-4 text-[#ccff00] shrink-0" />
              <span>Unlimited Collaborative Sandboxes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-mono tracking-wider uppercase bg-[#ccff00] text-black hover:bg-[#d9ff33] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all cursor-pointer"
            >
              Back to Feed
            </button>
            <button
              onClick={() => navigate("/sandbox")}
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-mono tracking-wider uppercase border border-white/10 text-[#a0a0a0] hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              Open Sandbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2-Tier Pricing Page (Free vs Pro)
  const isAnnual = billingCycle === "annual";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-4 py-12 max-w-6xl mx-auto">
      {/* Centered Section Header */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <span className="inline-block rounded-md px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20 mb-3">
          OctoPair Memberships
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#f0f0f0] mb-3">
          Upgrade Your Dev Journey
        </h1>
        <p className="text-sm text-[#a0a0a0] max-w-xl mx-auto leading-relaxed">
          Level up your reach, unlock unlimited concurrent project rooms, and pair directly with top builders.
        </p>
      </div>

      {/* Monthly / Annual Toggle Pill */}
      <div className="mb-10 inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`px-5 py-2 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
            !isAnnual
              ? "bg-white/10 text-white font-bold shadow-sm"
              : "text-[#a0a0a0] hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle("annual")}
          className={`px-5 py-2 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            isAnnual
              ? "bg-white/10 text-white font-bold shadow-sm"
              : "text-[#a0a0a0] hover:text-white"
          }`}
        >
          <span>Annual</span>
          <span className="bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Save 17%
          </span>
        </button>
      </div>

      {/* 2-Tier Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl w-full mx-auto items-stretch">
        {/* Tier 1: Free Tier */}
        <div className="glass-card hover:border-white/[0.12] transition-all p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52525b]">
                Community
              </span>
              <h3 className="text-xl font-bold text-[#f0f0f0] tracking-tight mt-1">
                Free
              </h3>
              <p className="text-xs text-[#a0a0a0] mt-1.5 leading-relaxed">
                Essential networking, feed access, and your first collaborative project room.
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[36px] font-bold text-[#f0f0f0] tracking-tight">
                $0
              </span>
              <span className="text-xs font-mono text-[#a0a0a0]">/ forever (Rs. 0)</span>
            </div>

            <div className="h-px bg-white/[0.07] my-6" />

            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a0a0a0] mb-4">
              Included Features
            </p>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-semibold text-white">1 active project room</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span>Public developer profile & portfolio</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span>Browse feeds, code snippets & project cards</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span>Connections, direct chat & project join requests</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span>Instant Debug SOS alerts & ZIP code export</span>
              </li>

              {/* Excluded Features with X */}
              <li className="flex items-start gap-2.5 text-[#52525b]">
                <X className="w-4 h-4 text-[#52525b] shrink-0 mt-0.5" />
                <span>Unlimited concurrent active project rooms</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#52525b]">
                <X className="w-4 h-4 text-[#52525b] shrink-0 mt-0.5" />
                <span>Priority algorithmic placement in feed & discover</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#52525b]">
                <X className="w-4 h-4 text-[#52525b] shrink-0 mt-0.5" />
                <span>Verified Pro developer badge</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.05]">
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-lg text-xs font-bold font-mono tracking-wider uppercase border border-white/10 text-[#52525b] bg-white/[0.02] cursor-default"
            >
              Current Plan (Free)
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Tier (Highlighted) */}
        <div className="glass-card border border-[#b266ff]/30 shadow-[0_0_40px_rgba(178,102,255,0.2)] rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b266ff]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/30 w-fit mb-3">
              <Sparkles className="w-3 h-3 text-[#b266ff]" />
              Most Popular
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#f0f0f0] tracking-tight">
                Developer Pro
              </h3>
              <p className="text-xs text-[#a0a0a0] mt-1.5 leading-relaxed">
                Full power for ambitious builders shipping products and running multiple projects.
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[36px] font-bold text-[#f0f0f0] tracking-tight">
                {isAnnual ? "$90" : "$9"}
              </span>
              <span className="text-xs font-mono text-[#a0a0a0]">
                {isAnnual ? "/ year" : "/ month"}
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#ccff00] h-5 mb-4">
              {isAnnual ? "Billed annually ($7.50/mo - Save 17% | Rs. 7500/yr)" : "Billed monthly - Cancel anytime ($9 USD | Rs. 700/mo)"}
            </div>

            <div className="h-px bg-white/[0.07] my-4" />

            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b266ff] mb-4">
              Everything in Free, Plus:
            </p>

            <ul className="space-y-3 text-xs mb-8">
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-bold text-white underline decoration-[#ccff00]/60 underline-offset-2">
                  Unlimited active project rooms
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-medium">Priority algorithmic placement in feed & discover</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-medium">Verified Pro badge on profile & cards</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-medium">Instant priority Debug SOS alerts & assistance</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-medium">Direct priority messaging with top builders</span>
              </li>
              <li className="flex items-start gap-2.5 text-[#f0f0f0]">
                <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                <span className="font-medium">Unlimited collaborative IDE workspaces & sandboxes</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.05] relative z-10">
            <button
              onClick={() => handleBuyClick(isAnnual ? "pro_annual" : "pro")}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-bold font-mono tracking-wider uppercase bg-[#ccff00] text-black hover:bg-[#d9ff33] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Upgrade to Pro
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mx-auto mt-12 text-center">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-xs font-bold text-[#f0f0f0] mb-1">Cancel Anytime</div>
          <p className="text-[11px] text-[#52525b]">Monthly billing with no lock-in contract</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-xs font-bold text-[#f0f0f0] mb-1">Razorpay Secure</div>
          <p className="text-[11px] text-[#52525b]">Encrypted checkout with UPI, Cards & NetBanking</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-xs font-bold text-[#f0f0f0] mb-1">Instant Activation</div>
          <p className="text-[11px] text-[#52525b]">Pro privileges unlock immediately after payment</p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
