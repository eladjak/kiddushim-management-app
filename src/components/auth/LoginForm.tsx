
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleAuthButton } from "./GoogleAuthButton";

/**
 * Schema for login form validation
 */
const loginFormSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Form component for user login
 */
export const LoginForm = ({
  setIsSignUp,
  setIsForgotPassword,
}: {
  setIsSignUp: (value: boolean) => void;
  setIsForgotPassword: (value: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize form with React Hook Form and zod validation
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  /**
   * Handle form submission for login
   */
  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    console.log('Attempting login with:', { email: values.email, rememberMe: values.rememberMe });
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log('Login successful, navigating to home');
      navigate("/");
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
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-2 focus:ring-primary"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-right">זכור אותי</FormLabel>
            </FormItem>
          )}
        />
        
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "טוען..." : "התחברות"}
          </Button>
          
          <GoogleAuthButton />
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsForgotPassword(true)}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            שכחת סיסמה?
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsSignUp(true)}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            אין לך חשבון? הירשם עכשיו
          </Button>
        </div>
      </form>
    </Form>
  );
};
