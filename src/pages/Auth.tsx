
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
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
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-right">
          <CardTitle>{isSignUp ? "הרשמה" : "התחברות"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "צור חשבון חדש כדי להתחיל"
              : "התחבר כדי לנהל את האירועים שלך"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">אימייל</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isSignUp ? "הרשמה" : "התחברות"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full"
                >
                  {isSignUp
                    ? "כבר יש לך חשבון? התחבר"
                    : "אין לך חשבון? הירשם עכשיו"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
