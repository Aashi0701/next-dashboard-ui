import { toast } from "react-toastify";

export const payFee = async (amount: number, studentFeeId: number) => {
  const res = await fetch("/api/create-payment-order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  const order = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: "INR",
    name: "TrueSunshine School",
    description: "Fee Payment",
    order_id: order.id,

    handler: async function (response: any) {
      await fetch("/api/verify-payment", {
        method: "POST",
        body: JSON.stringify({
          ...response,
          studentFeeId,
          amount,
        }),
      });
      toast.success("Payment successful!");
    },
  };

  const Razorpay = (window as any).Razorpay;
  const rzp = new Razorpay(options);

  rzp.open();
};