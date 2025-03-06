
import { Navigation } from "@/components/Navigation";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";

const Reports = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <ReportsHeader />
        <ReportsTabs />
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
