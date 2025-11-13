import AdminNavigation from "@/components/AdminNavigation";
import Admin from "./Admin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminNavigation />
      <Admin />
    </div>
  );
};

export default AdminLayout;
