import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useState, useEffect } from "react";
import { FiCheck, FiStar, FiZap } from "react-icons/fi";

const Premium = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data.isPremium) {
        setIsPremium(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleBuyClick = async (membershipType) => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType },
        { withCredentials: true },
      );

      const { amount, currency, orderId, keyId, notes } = order.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "DevTinder Pro",
        description: "Upgrade to Premium Membership",
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "9999999999",
        },
        theme: {
          color: "#ccff00",
        },
        handler: verifyPremiumUser,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
    }
  };

  return isPremium ? (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] px-4">
      <div className="flex flex-col items-center justify-center p-12 max-w-lg mx-auto bg-[#121212] border border-[#ccff00]/30 shadow-[0_0_50px_rgba(204,255,0,0.1)] rounded-3xl text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 bg-[#ccff00]/10 rounded-full flex items-center justify-center mb-6 border border-[#ccff00]/20 relative z-10">
          <FiStar className="text-4xl text-[#ccff00] fill-[#ccff00]" />
        </div>
        <h1 className="font-bold text-3xl text-white tracking-tight mb-3 relative z-10">You are Pro</h1>
        <p className="text-[#a3a3a3] font-medium leading-relaxed relative z-10">
          You have full access to all premium developer features, unlimited collaborative sandboxes, and priority matchmaking.
        </p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
      
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
          Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#a855f7]">developer journey</span>
        </h1>
        <p className="text-[#a3a3a3] text-lg font-medium">
          Get more visibility, connect with top tier developers, and access exclusive platform features.
        </p>
      </div>

      <div className="flex w-full max-w-5xl flex-col lg:flex-row gap-8 items-center justify-center">
        
        {/* Silver Membership */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-10 flex flex-col items-center flex-1 w-full max-w-sm relative hover:border-white/10 transition-all shadow-xl group">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <FiZap className="text-3xl text-[#a3a3a3]" />
          </div>
          <h2 className="font-bold text-2xl text-white mb-2">Pro Base</h2>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-bold text-white">₹299</span>
            <span className="text-[#a3a3a3] text-sm">/mo</span>
          </div>
          
          <ul className="text-[#a3a3a3] text-sm font-medium space-y-4 mb-10 w-full">
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#a855f7] text-lg flex-shrink-0" /> 
              <span>Access to advanced filters</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#a855f7] text-lg flex-shrink-0" /> 
              <span>Up to 50 connections/day</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#a855f7] text-lg flex-shrink-0" /> 
              <span>Standard support</span>
            </li>
            <li className="flex items-center gap-3 opacity-50">
              <FiCheck className="text-[#a3a3a3] text-lg flex-shrink-0" /> 
              <span>Ad-supported experience</span>
            </li>
          </ul>
          
          <button
            onClick={() => handleBuyClick("silver")}
            className="w-full py-4 mt-auto rounded-xl font-bold text-[#e5e5e5] bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
          >
            Get Base
          </button>
        </div>

        {/* Gold Membership */}
        <div className="bg-[#0a0a0a] border border-[#ccff00]/30 rounded-3xl p-10 flex flex-col items-center flex-1 w-full max-w-sm relative shadow-[0_0_40px_rgba(204,255,0,0.05)] hover:shadow-[0_0_60px_rgba(204,255,0,0.1)] transition-all lg:-translate-y-4">
          <div className="absolute -top-4 bg-[#ccff00] text-[#0a0a0a] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.4)]">
            Most Popular
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/5 to-transparent rounded-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-[#ccff00]/10 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-[#ccff00]/20">
            <FiStar className="text-3xl text-[#ccff00] fill-[#ccff00]/20" />
          </div>
          
          <h2 className="font-bold text-2xl text-white mb-2 relative z-10">Pro Max</h2>
          <div className="flex items-baseline gap-1 mb-8 relative z-10">
            <span className="text-4xl font-bold text-[#ccff00]">₹799</span>
            <span className="text-[#a3a3a3] text-sm">/mo</span>
          </div>
          
          <ul className="text-[#e5e5e5] text-sm font-medium space-y-4 mb-10 w-full relative z-10">
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#ccff00] text-lg flex-shrink-0" /> 
              <span>Unlimited connections</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#ccff00] text-lg flex-shrink-0" /> 
              <span>Priority profile visibility</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#ccff00] text-lg flex-shrink-0" /> 
              <span>24/7 Priority support</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#ccff00] text-lg flex-shrink-0" /> 
              <span>100% Ad-free experience</span>
            </li>
            <li className="flex items-center gap-3">
              <FiCheck className="text-[#ccff00] text-lg flex-shrink-0" /> 
              <span>Verified Pro badge</span>
            </li>
          </ul>
          
          <button
            onClick={() => handleBuyClick("gold")}
            className="w-full py-4 mt-auto rounded-xl font-bold text-[#0a0a0a] bg-[#ccff00] hover:bg-[#bbf000] transition-colors shadow-lg shadow-[#ccff00]/10 relative z-10"
          >
            Upgrade to Max
          </button>
        </div>

      </div>
    </div>
  );
};

export default Premium;
