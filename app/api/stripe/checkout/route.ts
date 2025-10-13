import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { stripe } from "../../../lib/stripe";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          // 🚨 IMPORTANT: Replace with your actual Price ID from the Stripe Dashboard
          price: "price_YOUR_PRO_PLAN_ID",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/dashboard?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
