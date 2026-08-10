import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useState } from "react";
import { useEffect } from "react";

const Premium = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    const res = await axios.get(BASE_URL + "/premium/verify", {
      withCredentials: true,
    });

    if (res.data.isPremium) {
      setIsPremium(true);
    }
  };

  const handleBuyClick = async (membershipType) => {
    const order = await axios.post(
      BASE_URL + "/payment/create",
      { membershipType },
      { withCredentials: true },
    );

    //now we will get the order details in response and we can use it to open Razorpay checkout form
    // console.log(order.data);

    const { amount, currency, orderId, keyId, notes } = order.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: "DevTinder",
      description: "Upgrade to Premium Membership",
      order_id: orderId,
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.emailId,
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
      handler: verifyPremiumUser,
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return isPremium ? (
    <div className="flex flex-col items-center justify-center mt-20 gap-4 neo-card p-12 max-w-md mx-auto bg-[#ccff00]">
      <span className="text-6xl mb-2">⭐</span>
      <h1 className="font-black text-3xl text-center">You are a Premium Member!</h1>
      <p className="text-lg font-bold text-gray-800 text-center">Enjoy all the exclusive features and benefits.</p>
    </div>
  ) : (
    <div className="flex justify-center w-full px-4 pt-10">
      <div className="flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
        {/* Silver Membership */}
        <div className="neo-card p-10 flex flex-col items-center flex-1 bg-[#f4f4f5] border-4">
          <div className="w-16 h-16 bg-white border-4 border-[#0a0a0a] rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0a0a0a]">
            <span className="text-2xl font-black text-gray-500">S</span>
          </div>
          <h1 className="font-black text-3xl mb-8 text-center">Silver Membership</h1>
          <ul className="text-gray-700 font-bold space-y-4 mb-10 w-full text-center">
            <li className="flex items-center justify-center gap-2">✓ Access to basic features</li>
            <li className="flex items-center justify-center gap-2">✓ Limited profile visibility</li>
            <li className="flex items-center justify-center gap-2">✓ Standard support</li>
            <li className="flex items-center justify-center gap-2 text-gray-400">✗ Ad-supported experience</li>
          </ul>
          <button
            onClick={() => handleBuyClick("silver")}
            className="neo-btn-secondary w-full mt-auto"
          >
            Upgrade to Silver
          </button>
        </div>

        {/* Gold Membership */}
        <div className="neo-card-dark p-10 flex flex-col items-center flex-1 border-4 border-[#0a0a0a]">
          <div className="absolute top-0 right-8 bg-[#a855f7] text-white font-black px-4 py-1 rounded-b-lg border-x-2 border-b-2 border-[#0a0a0a] text-sm">
            RECOMMENDED
          </div>
          <div className="w-16 h-16 bg-[#ccff00] border-4 border-[#0a0a0a] rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0a0a0a] mt-4">
            <span className="text-2xl font-black text-[#0a0a0a]">G</span>
          </div>
          <h1 className="font-black text-3xl mb-8 text-[#ccff00] text-center">Gold Membership</h1>
          <ul className="text-gray-300 font-bold space-y-4 mb-10 w-full text-center">
            <li className="flex items-center justify-center gap-2 text-white">✓ Access to all features</li>
            <li className="flex items-center justify-center gap-2 text-white">✓ Unlimited profile visibility</li>
            <li className="flex items-center justify-center gap-2 text-white">✓ Priority support</li>
            <li className="flex items-center justify-center gap-2 text-white">✓ Ad-free experience</li>
          </ul>
          <button
            onClick={() => handleBuyClick("gold")}
            className="neo-btn-primary w-full mt-auto"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
