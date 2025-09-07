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
}

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
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log('Registration attempt from IP:', clientIP);

    // Validate required fields
    if (!registrationData.name || !registrationData.phone) {
      return new Response(
        JSON.stringify({ error: 'שם וטלפון הם שדות חובה' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number format (Israeli format)
    const phoneRegex = /^0[5-9]\d{8}$|^\+972[5-9]\d{8}$/;
    if (!phoneRegex.test(registrationData.phone.replace(/[-\s]/g, ''))) {
      return new Response(
        JSON.stringify({ error: 'נא להזין מספר טלפון תקין' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limiting
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for recent attempts from same IP or phone
    const { data: recentAttempts } = await supabase
      .from('registration_rate_limits')
      .select('*')
      .or(`ip_address.eq.${clientIP},phone_number.eq.${registrationData.phone}`)
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
            phone_number: registrationData.phone,
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
        phone_number: registrationData.phone,
        email: registrationData.email,
        attempts: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });

    // Check for duplicate registration
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('phone', registrationData.phone)
      .eq('event_id', registrationData.event_id || '')
      .single();

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
      phone: registrationData.phone.replace(/[-\s]/g, ''),
      email: registrationData.email?.trim() || null,
      family_size: Math.max(1, Math.min(20, registrationData.family_size || 1)),
      children_ages: registrationData.children_ages?.trim() || null,
      comments: registrationData.comments?.trim() || null,
      event_id: registrationData.event_id || null,
      status: 'pending',
      registration_date: new Date().toISOString()
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

    // Send confirmation (existing edge function)
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('title, date, location_name')
        .eq('id', registrationData.event_id || '')
        .single();

      await supabase.functions.invoke('send-registration-confirmation', {
        body: {
          name: registrationRecord.name,
          phone: registrationRecord.phone,
          event: eventData || { title: 'אירוע קידושישי', date: 'בקרוב', location_name: 'מגדל העמק' }
        }
      });
    } catch (confirmationError) {
      console.error('Confirmation sending failed:', confirmationError);
      // Don't fail the registration if confirmation fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'הרשמה התקבלה בהצלחה! נשלח אישור בהודעת וואטסאפ',
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