import { Outlet } from "react-router-dom";
import Sidebar from "../../shared/ui/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto theme-bg-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
