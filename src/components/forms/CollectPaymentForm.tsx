"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { collectPaymentAction } from "@/lib/actions";

export enum PaymentMode {
  CASH = "CASH",
  UPI = "UPI",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
}

type FormValues = {
  studentFeeId: number;
  amount: number;
  mode: PaymentMode;          // ✅ FIXED
  referenceId?: string;
};

export default function CollectPaymentForm({
  data,
  close,
}: {
  data: {
    studentFeeId: number;
    dueAmount: number;
  };
  close: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      studentFeeId: data.studentFeeId,
      amount: data.dueAmount,
      mode: PaymentMode.CASH,   // ✅ ENUM VALUE
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.amount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (values.amount > data.dueAmount) {
      toast.error("Payment cannot exceed due amount");
      return;
    }

    startTransition(async () => {
      const res = await collectPaymentAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Payment collected successfully");
      close();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold">Collect Payment</h2>
        <p className="text-sm text-gray-500">
          Record a payment against assigned fee
        </p>
      </div>

      <div className="border-b" />

      {/* DUE INFO */}
      <div className="bg-gray-50 p-4 rounded-md text-sm">
        <p>
          <span className="font-medium">Due Amount:</span>{" "}
          <span className="text-red-600 font-semibold">
            ₹{data.dueAmount}
          </span>
        </p>
      </div>

      {/* AMOUNT */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Amount Paid</label>
        <input
          type="number"
          step="1"
          {...register("amount", { valueAsNumber: true, required: true })}
          className="w-full border rounded-md px-3 py-2"
        />
        {errors.amount && (
          <p className="text-xs text-red-500">Amount is required</p>
        )}
      </div>

      {/* PAYMENT MODE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Payment Mode</label>
        <select
          {...register("mode")}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value={PaymentMode.CASH}>Cash</option>
          <option value={PaymentMode.UPI}>UPI</option>
          <option value={PaymentMode.CARD}>Card</option>
          <option value={PaymentMode.BANK_TRANSFER}>Bank Transfer</option>
        </select>
      </div>

      {/* REFERENCE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Reference ID (optional)
        </label>
        <input
          type="text"
          {...register("referenceId")}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div className="border-b" />

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 border rounded-md text-sm"
          disabled={isPending}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
        >
          {isPending ? "Processing..." : "Collect Payment"}
        </button>
      </div>
    </form>
  );
}
