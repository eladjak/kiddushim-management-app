
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Mail, Phone, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ISRAELI_PHONE_REGEX = /^(?:\+972|0)(?:[23489]|5[0-689]|7[246789])\d{7}$/;

/**
 * Schema for sign up form validation
 */
const signUpFormSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים")
    .max(100, "הסיסמה ארוכה מדי"),
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  phone: z
    .string()
    .regex(ISRAELI_PHONE_REGEX, "נא להזין מספר טלפון ישראלי תקין"),
});

/**
 * Form component for user registration
 */
export const SignUpForm = ({
  setIsSignUp,
  onGoogleSignIn,
}: {
  setIsSignUp: (value: boolean) => void;
  onGoogleSignIn: () => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form and zod validation
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  /**
   * Handle form submission for sign up
   */
  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    console.log('Attempting sign up with:', { email: values.email, name: values.name });
    
    setIsLoading(true);
    try {
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
      
      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      console.log('Sign up successful');
      toast({
        description: "נשלח אימייל אימות. נא לאשר את ההרשמה.",
      });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "טוען..." : "הרשמה"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onGoogleSignIn}
            className="w-full hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4 ml-2"
            />
            התחבר עם Google
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsSignUp(false)}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            כבר יש לך חשבון? התחבר
          </Button>
        </div>
      </form>
    </Form>
  );
};
