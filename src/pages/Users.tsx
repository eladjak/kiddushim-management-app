
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersContent } from "@/components/users/UsersContent";

const Users = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      toast({
        variant: "destructive",
        description: "אין לך הרשאות לצפות בדף זה",
      });
      navigate("/");
    }
  }, [profile, navigate, toast]);

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <UsersHeader />
        
        {profile?.role !== "admin" ? (
          <div className="text-center py-12">
            <p className="text-lg">אין לך הרשאות לצפות בדף זה</p>
          </div>
        ) : (
          <UsersContent />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Users;
