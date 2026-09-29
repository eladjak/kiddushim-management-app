import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// מספר הרכז שמופיע גם בעמוד הציבורי - לשאלות. (לא מספר הנרשם!)
const CONTACT_PHONE_DISPLAY = "052-542-7474";
const CONTACT_PHONE_HREF = "+972525427474";

/** מונע הזרקת HTML מקלט של משתמש לתוך גוף המייל. */
const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const EMAIL_REGEX = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

/**
 * הפונקציה הזו נקראת רק משרת אל שרת (מ-secure-registration) עם מפתח השירות.
 * בלי בדיקה כזו כל אדם באינטרנט יכול היה להשתמש בה כדי לשלוח דואר, עם טקסט
 * לבחירתו, לכל כתובת - דרך הדומיין שלנו. משווים בזמן קבוע.
 */
const isServiceCall = (req: Request): boolean => {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const given = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!key || given.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
};

interface RegistrationConfirmationRequest {
  name: string;
  email: string;
  phone: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  familySize: number;
  childrenAges?: string;
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isServiceCall(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { 
      name, 
      email, 
      phone,
      eventTitle, 
      eventDate, 
      eventLocation,
      familySize,
      childrenAges,
      comments 
    }: RegistrationConfirmationRequest = await req.json();

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create calendar event data
    const eventStart = new Date(eventDate);
    const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const calendarData = {
      title: eventTitle,
      start: eventStart.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: eventEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      location: eventLocation,
      description: `השתתפות במגדל העמק קידושי שבת\nמספר משתתפים: ${familySize}${childrenAges ? `\nגילאי ילדים: ${childrenAges}` : ''}${comments ? `\nהערות: ${comments}` : ''}`
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&location=${encodeURIComponent(calendarData.location)}&details=${encodeURIComponent(calendarData.description)}`;

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "קידושישי מגדל העמק <kidushishi@resend.dev>",
      to: [email],
      subject: `אישור הרשמה לקידושי שבת - ${String(eventTitle).replace(/[\r\n]+/g, " ")}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">ברוכים הבאים לקידושי שבת!</h1>
            </div>
            
            <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">פרטי ההרשמה שלכם</h2>
              <p><strong>שם:</strong> ${esc(name)}</p>
              <p><strong>אירוע:</strong> ${esc(eventTitle)}</p>
              <p><strong>תאריך:</strong> ${new Date(eventDate).toLocaleDateString('he-IL')}</p>
              <p><strong>מקום:</strong> ${esc(eventLocation)}</p>
              <p><strong>מספר משתתפים:</strong> ${esc(familySize)}</p>
              ${childrenAges ? `<p><strong>גילאי ילדים:</strong> ${esc(childrenAges)}</p>` : ''}
              ${comments ? `<p><strong>הערות:</strong> ${esc(comments)}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${googleCalendarUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">הוסף ליומן Google</a>
            </div>

            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>חשוב:</strong> אנא הגיעו 15 דקות לפני תחילת האירוע. מומלץ להביא שמיכה או כיסא נוח.</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>לשאלות ועדכונים צרו קשר: <a href="tel:${CONTACT_PHONE_HREF}" style="color: #2563eb;">${CONTACT_PHONE_DISPLAY}</a></p>
              <p>מיזם קידושישי בשיתוף ארגון צהר והגרעין התורני מגדל העמק</p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    console.log("Registration confirmation sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      calendarUrl: googleCalendarUrl 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in send-registration-confirmation function:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);