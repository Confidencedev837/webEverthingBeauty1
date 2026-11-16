// Supabase Edge Function: dispatch-whatsapp
// Dispatches automated WhatsApp messages via Meta WhatsApp Cloud API (v21.0)
// Free tier: 1,000 service conversations per month

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DispatchPayload {
  recipientPhone: string;
  message: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "234" + digits.slice(1);
  }
  if (digits.startsWith("234")) {
    return digits;
  }
  return digits;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipientPhone, message, templateName, templateLanguage = "en", templateComponents } = (await req.json()) as DispatchPayload;

    if (!recipientPhone) {
      return new Response(JSON.stringify({ error: "Missing recipientPhone" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanPhone = normalizePhone(recipientPhone);
    const metaToken = Deno.env.get("META_WHATSAPP_TOKEN");
    const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID");

    if (!metaToken || !phoneNumberId) {
      console.warn("META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID not set in Edge Function secrets.");
      return new Response(
        JSON.stringify({
          success: false,
          warning: "Meta WhatsApp credentials not yet configured in Supabase environment secrets.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Meta Cloud API request body
    // If an approved template is specified, send template message; otherwise send text
    let bodyData: any;

    if (templateName) {
      bodyData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: templateComponents || [],
        },
      };
    } else {
      bodyData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      };
    }

    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      console.error("Meta WhatsApp Cloud API error:", metaData);
      return new Response(JSON.stringify({ success: false, error: metaData }), {
        status: metaRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: metaData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("dispatch-whatsapp error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
