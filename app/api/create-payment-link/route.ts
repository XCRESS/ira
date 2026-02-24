// /app/api/create-payment-link/route.ts

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const link = await razorpay.paymentLink.create({
    amount: 5000000,
    currency: "INR",
    description: "Consultation Fee",
    customer: {
      name: "Customer",
      email: "test@gmail.com",
    },
  });

  return NextResponse.json({ link: link.short_url });
}
