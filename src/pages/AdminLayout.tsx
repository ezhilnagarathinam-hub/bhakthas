import AdminNavigation from "@/components/AdminNavigation";
import Admin from "./Admin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-yellow-900">
      <AdminNavigation />
      <Admin />
    </div>
  );
};

export default AdminLayout;
