import Navigation from "@/components/Navigation";
import Admin from "./Admin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Admin />
    </div>
  );
};

export default AdminLayout;
