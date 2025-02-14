
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Mail, Phone, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Regex for Israeli phone numbers
const ISRAELI_PHONE_REGEX = /^(?:\+972|0)(?:[23489]|5[0-689]|7[246789])\d{7}$/;

const formSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים")
    .max(100, "הסיסמה ארוכה מדי"),
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים").optional(),
  phone: z
    .string()
    .regex(ISRAELI_PHONE_REGEX, "נא להזין מספר טלפון ישראלי תקין")
    .optional(),
});

type AuthFormProps = {
  isSignUp: boolean;
  isForgotPassword: boolean;
  setIsForgotPassword: (value: boolean) => void;
  setIsSignUp: (value: boolean) => void;
};

export const AuthForm = ({
  isSignUp,
  isForgotPassword,
  setIsForgotPassword,
  setIsSignUp,
}: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSignUp && (!values.name || !values.phone)) {
      toast({
        variant: "destructive",
        description: "נא למלא את כל השדות הנדרשים",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: window.location.origin + "/auth/reset-password",
        });
        if (error) throw error;
        toast({
          description: "נשלח אימייל לאיפוס סיסמה. נא לבדוק את תיבת הדואר.",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              phone: values.phone,
            },
            emailRedirectTo: window.location.origin + "/auth/callback",
          },
        });
        if (error) throw error;
        toast({
          description: "נשלח אימייל אימות. נא לאשר את ההרשמה.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && !isForgotPassword && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">שם מלא</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="ישראל ישראלי"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                        {...field}
                      />
                      <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">טלפון</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="tel"
                        placeholder="050-0000000"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                        {...field}
                      />
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-right block">אימייל</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    {...field}
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-right" />
            </FormItem>
          )}
        />
        {!isForgotPassword && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">סיסמה</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="password"
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      {...field}
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading 
              ? "טוען..." 
              : isForgotPassword
              ? "שלח קישור לאיפוס סיסמה"
              : isSignUp 
                ? "הרשמה" 
                : "התחברות"}
          </Button>
          {!isForgotPassword && (
            <Button
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
              className="w-full hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4 ml-2"
              />
              התחבר עם Google
            </Button>
          )}
          {!isSignUp && !isForgotPassword && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsForgotPassword(true)}
              className="w-full hover:bg-secondary/50 transition-all duration-200"
            >
              שכחת סיסמה?
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsForgotPassword(false);
            }}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            {isSignUp
              ? "כבר יש לך חשבון? התחבר"
              : "אין לך חשבון? הירשם עכשיו"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
