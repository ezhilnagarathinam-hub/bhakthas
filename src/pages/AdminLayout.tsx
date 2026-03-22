import AdminNavigation from "@/components/AdminNavigation";
import Admin from "./Admin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-yellow-900">
      <AdminNavigation />
      <Admin className="my-[45px]" />
    </div>);

};

export default AdminLayout;