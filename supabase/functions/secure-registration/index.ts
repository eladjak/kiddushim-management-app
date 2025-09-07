import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationData {
  name: string;
  phone: string;
  email?: string;
  family_size?: number;
  children_ages?: string;
  comments?: string;
  event_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Secure registration function called');

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log(`Registration attempt from IP: ${clientIP}`);

    // Parse request body
    const { name, phone, email, family_size, children_ages, comments, event_id }: RegistrationData = await req.json();

    // Validate required fields
    if (!name || !phone) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'שם וטלפון הם שדות חובה',
          details: 'Missing required fields: name and phone'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate phone format (Israeli phone number)
    const phoneRegex = /^05\d{8}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      console.log('Invalid phone format');
      return new Response(
        JSON.stringify({ 
          error: 'פורמט טלפון לא תקין. אנא הכנס מספר טלפון ישראלי תקין',
          details: 'Invalid phone format'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check rate limits
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for recent registrations from same IP or phone
    const { data: recentAttempts, error: rateCheckError } = await supabaseAdmin
      .from('registration_rate_limits')
      .select('*')
      .or(`ip_address.eq.${clientIP},phone_number.eq.${cleanPhone}`)
      .gte('last_attempt', oneHourAgo.toISOString());

    if (rateCheckError) {
      console.error('Rate limit check error:', rateCheckError);
    }

    // Count recent attempts
    const recentCount = recentAttempts?.length || 0;
    if (recentCount >= 3) {
      console.log('Rate limit exceeded');
      return new Response(
        JSON.stringify({ 
          error: 'חרגת מהמגבלה המותרת. אנא נסה שוב בעוד שעה',
          details: 'Rate limit exceeded'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Record this attempt
    await supabaseAdmin
      .from('registration_rate_limits')
      .insert({
        ip_address: clientIP,
        phone_number: cleanPhone,
        email: email || null,
        attempts: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });

    // Check for duplicate registrations
    const { data: existingRegistration } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('phone', cleanPhone)
      .eq('event_id', event_id || 'null');

    if (existingRegistration && existingRegistration.length > 0) {
      console.log('Duplicate registration detected');
      return new Response(
        JSON.stringify({ 
          error: 'כבר קיימת הרשמה עם מספר הטלפון הזה לאירוע זה',
          details: 'Duplicate registration'
        }),
        { 
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create registration record
    const registrationData = {
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim() || null,
      family_size: family_size || 1,
      children_ages: children_ages?.trim() || null,
      comments: comments?.trim() || null,
      event_id: event_id || null,
      registration_date: now.toISOString(),
      status: 'pending'
    };

    console.log('Creating registration record');
    const { data: registration, error: insertError } = await supabaseAdmin
      .from('event_registrations')
      .insert([registrationData])
      .select()
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'שגיאה ביצירת ההרשמה. אנא נסה שוב',
          details: insertError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Registration created successfully');

    // Try to send confirmation email (optional, don't fail if this fails)
    try {
      if (event_id) {
        await supabaseAdmin.functions.invoke('send-registration-confirmation', {
          body: {
            to_name: name,
            to_phone: cleanPhone,
            to_email: email || '',
            event_id: event_id,
            registration_id: registration.id
          }
        });
      }
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError);
      // Continue anyway - registration was successful
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'ההרשמה בוצעה בהצלחה! נשלח אליך אישור בקרוב',
        registration_id: registration.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה לא צפויה. אנא נסה שוב מאוחר יותר',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});