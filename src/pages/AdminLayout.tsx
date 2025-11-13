import AdminNavigation from "@/components/AdminNavigation";
import Admin from "./Admin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-admin">
      <AdminNavigation />
      <Admin />
    </div>
  );
};

export default AdminLayout;
