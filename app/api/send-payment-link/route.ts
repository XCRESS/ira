// app/api/send-payment-link/route.ts
import { NextResponse } from "next/server";
import { sendPaymentLinkEmail } from "@/lib/email"; // Adjust path as needed

export async function POST(req: Request) {
  try {
    const { email, link, amount, description } = await req.json();

    if (!email || !link) {
      return NextResponse.json(
        { error: "Email and link are required" },
        { status: 400 }
      );
    }

    // Send email using centralized service
    const result = await sendPaymentLinkEmail({
      recipientEmail: email,
      paymentLink: link,
      amount,
      description
    });

    if (!result.success) {
      console.error("Failed to send payment link email:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      messageId: result.messageId
    });

  } catch (error: any) {
    console.error("Error sending payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}