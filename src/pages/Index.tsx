
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { logger } from "@/utils/logger";

const Index = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        logger.info("Index page loaded", { 
          component: 'IndexPage',
          authenticated: !!user,
          dataLoading: { status: loading }
        });
      } catch (error) {
        logger.error("Error initializing index page", { error });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  logger.info("Index page rendering", {
    user: user ? 'Authenticated' : 'Not authenticated',
    rendering: 'In progress'
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return <WelcomeScreen />;
};

export default Index;
