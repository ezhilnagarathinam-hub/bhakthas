import Navigation from "@/components/Navigation";
import MantraChanting from "./MantraChanting";

const MantraLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MantraChanting />
    </div>
  );
};

export default MantraLayout;