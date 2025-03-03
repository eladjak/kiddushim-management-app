
import { Navigation } from "@/components/Navigation";
import { ProjectPlan } from "@/components/docs/ProjectPlan";

/**
 * Documentation page showing project plan information
 * 
 * This page displays comprehensive project documentation including:
 * - Project overview and vision
 * - Timeline of events
 * - Team structure and responsibilities
 * - Budget and logistics information
 * - Work processes and procedures
 */
const Documentation = () => {
  return (
    <div className="min-h-screen bg-secondary/10">
      <Navigation />
      <main className="pt-20 pb-12">
        <ProjectPlan />
      </main>
    </div>
  );
};

export default Documentation;
