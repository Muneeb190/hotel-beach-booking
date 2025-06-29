
// @ts-ignore: Ignore type checking for Deno standard library import
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore: Ignore type checking for Deno standard library import
import Stripe from "https://deno.land/x/stripe@v0.24.0/mod.ts";
// @ts-ignore: Deno is a global in Deno runtime, but TypeScript may not recognize it without this
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "usd", customerEmail, bookingDetails } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: `Booking: ${bookingDetails.apartmentName}`,
              description: `${bookingDetails.checkIn} to ${bookingDetails.checkOut} - ${bookingDetails.guests} guests`
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/booking?canceled=true`,
      metadata: {
        bookingDetails: JSON.stringify(bookingDetails)
      }
    });

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
