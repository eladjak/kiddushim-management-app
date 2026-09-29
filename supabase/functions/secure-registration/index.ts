import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationData {
  name: string;
  phone: string;
  email?: string;
  family_size: number;
  children_ages?: string;
  comments?: string;
  event_id?: string;
  /** הסכמה מפורשת למדיניות הפרטיות - חובה */
  consent?: boolean;
  consent_version?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

interface RateLimit {
  ip_address: string;
  phone_number?: string;
  email?: string;
  attempts: number;
  blocked_until?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const registrationData: RegistrationData = await req.json();
    
    // Get client IP for rate limiting. The header is client-controlled, so it is
    // reduced to the first address and stripped to IP characters only - it is later
    // placed inside a PostgREST filter and must not be able to inject filter syntax.
    const rawIP = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown')
      .split(',')[0]
      .trim();
    const clientIP = /^[0-9a-fA-F:.]{1,45}$/.test(rawIP) ? rawIP : 'unknown';

    // Validate required fields
    if (!registrationData.name || !registrationData.phone) {
      return new Response(
        JSON.stringify({ error: 'שם וטלפון הם שדות חובה' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (registrationData.consent !== true) {
      return json({ error: 'יש לאשר את מדיניות הפרטיות כדי להירשם' }, 400);
    }

    if (
      typeof registrationData.name !== 'string' ||
      registrationData.name.trim().length < 2 ||
      registrationData.name.length > 100 ||
      typeof registrationData.phone !== 'string' ||
      (registrationData.email && (
        typeof registrationData.email !== 'string' ||
        registrationData.email.length > 200 ||
        !EMAIL_REGEX.test(registrationData.email.trim())
      )) ||
      (registrationData.children_ages && String(registrationData.children_ages).length > 100) ||
      (registrationData.comments && String(registrationData.comments).length > 500) ||
      (registrationData.event_id && !UUID_REGEX.test(String(registrationData.event_id)))
    ) {
      return json({ error: 'אחד מהשדות אינו תקין. נא לבדוק את הפרטים ולנסות שוב' }, 400);
    }

    // Validate phone number format (Israeli format)
    const phoneRegex = /^0[5-9]\d{8}$|^\+972[5-9]\d{8}$/;
    if (!phoneRegex.test(registrationData.phone.replace(/[-\s]/g, ''))) {
      return new Response(
        JSON.stringify({ error: 'נא להזין מספר טלפון תקין' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalized once; the same value is stored, rate-limited and de-duplicated on
    const normalizedPhone = registrationData.phone.replace(/[-\s]/g, '');

    // Check rate limiting
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for recent attempts from same IP or phone
    const { data: recentAttempts } = await supabase
      .from('registration_rate_limits')
      .select('*')
      .or(`ip_address.eq.${clientIP},phone_number.eq.${normalizedPhone}`)
      .gte('last_attempt', oneHourAgo.toISOString());

    if (recentAttempts && recentAttempts.length > 0) {
      const latestAttempt = recentAttempts[0];
      
      // If blocked, check if block period has expired
      if (latestAttempt.blocked_until && new Date(latestAttempt.blocked_until) > now) {
        const minutesLeft = Math.ceil((new Date(latestAttempt.blocked_until).getTime() - now.getTime()) / (1000 * 60));
        return new Response(
          JSON.stringify({ 
            error: `יותר מדי ניסיונות הרשמה. נסה שוב בעוד ${minutesLeft} דקות` 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Count attempts in last hour
      const attempts = recentAttempts.reduce((sum, attempt) => sum + attempt.attempts, 0);
      
      if (attempts >= 5) {
        // Block for 1 hour
        const blockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
        
        await supabase
          .from('registration_rate_limits')
          .upsert({
            ip_address: clientIP,
            phone_number: normalizedPhone,
            email: registrationData.email,
            attempts: attempts + 1,
            first_attempt: latestAttempt.first_attempt,
            last_attempt: now.toISOString(),
            blocked_until: blockedUntil.toISOString()
          });

        return new Response(
          JSON.stringify({ 
            error: 'יותר מדי ניסיונות הרשמה. נסה שוב בעוד שעה' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Record this attempt
    await supabase
      .from('registration_rate_limits')
      .upsert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        email: registrationData.email,
        attempts: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });

    // Check for duplicate registration (same phone, same event - or both without an event)
    let duplicateQuery = supabase
      .from('event_registrations')
      .select('id')
      .eq('phone', normalizedPhone);
    duplicateQuery = registrationData.event_id
      ? duplicateQuery.eq('event_id', registrationData.event_id)
      : duplicateQuery.is('event_id', null);
    const { data: existingRegistration } = await duplicateQuery.limit(1).maybeSingle();

    if (existingRegistration) {
      return new Response(
        JSON.stringify({ 
          error: 'כבר נרשמת לאירוע זה. אם יש צורך בשינוי פרטים, נא ליצור קשר' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the registration
    const registrationRecord = {
      name: registrationData.name.trim(),
      phone: normalizedPhone,
      email: registrationData.email?.trim() || null,
      family_size: Math.max(1, Math.min(20, registrationData.family_size || 1)),
      children_ages: registrationData.children_ages?.trim() || null,
      comments: registrationData.comments?.trim() || null,
      event_id: registrationData.event_id || null,
      status: 'pending',
      registration_date: new Date().toISOString(),
      // Consent is stored with the record: when, and to which wording.
      // Requires columns consent_at / consent_version (see the live-readiness migration).
      consent_at: new Date().toISOString(),
      consent_version: String(registrationData.consent_version || 'unknown').slice(0, 32)
    };

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([registrationRecord])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'שגיאה בשמירת ההרשמה. נסה שוב' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Registration created successfully:', data.id);

    // Send confirmation email (best effort - registration must not fail because of it).
    // Only when the person left an email; the mail function accepts only calls that
    // carry the service-role key, which supabase.functions.invoke sends from this client.
    if (registrationRecord.email) {
      try {
        const { data: eventData } = registrationData.event_id
          ? await supabase
              .from('events')
              .select('title, date, location_name')
              .eq('id', registrationData.event_id)
              .maybeSingle()
          : { data: null };

        await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            name: registrationRecord.name,
            email: registrationRecord.email,
            phone: registrationRecord.phone,
            eventTitle: eventData?.title || 'קידושישי מגדל העמק',
            eventDate: eventData?.date || new Date().toISOString(),
            eventLocation: eventData?.location_name || 'מגדל העמק (המיקום יפורסם בהמשך)',
            familySize: registrationRecord.family_size,
            childrenAges: registrationRecord.children_ages || undefined,
            comments: registrationRecord.comments || undefined,
          }
        });
      } catch (confirmationError) {
        console.error('Confirmation sending failed:', confirmationError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'ההרשמה התקבלה בהצלחה!',
        registration_id: data.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'שגיאה לא צפויה. נסה שוב מאוחר יותר' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});