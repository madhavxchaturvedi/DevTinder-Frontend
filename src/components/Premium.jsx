import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Premium = () => {
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
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="flex justify-center">
      <div className="flex w-4/5 flex-col gap-8 lg:flex-row">
        <div className="card bg-base-300 rounded-box h-[350px] grow place-items-center">
          <h1 className="font-bold text-3xl my-8">Silver Membership</h1>
          <ul>
            <li>-Access to basic features</li>
            <li>-Limited profile visibility</li>
            <li>-Standard support</li>
            <li>-Ad-supported experience</li>
          </ul>
          <button
            onClick={() => handleBuyClick("silver")}
            className="btn btn-primary mt-6"
          >
            Upgrade to Silver
          </button>
        </div>
        <div className="divider lg:divider-horizontal">OR</div>
        <div className="card bg-base-300 rounded-box h-[350px] grow place-items-center">
          <h1 className="font-bold text-3xl my-8">Gold Membership</h1>
          <ul>
            <li>-Access to all features</li>
            <li>-Unlimited profile visibility</li>
            <li>-Priority support</li>
            <li>-Ad-free experience</li>
          </ul>
          <button
            onClick={() => handleBuyClick("gold")}
            className="btn btn-primary mt-6"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
