import Navigation from "@/components/Navigation";
import KnowledgeHub from "./KnowledgeHub";

const KnowledgeHubLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <KnowledgeHub />
    </div>
  );
};

export default KnowledgeHubLayout;
