import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  MapPin,
  PlusCircle,
  CalendarDays,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Building2,
  UserPlus,
} from "lucide-react";

import { logoutUser } from "../api/endpoints";
import ThemeToggle from "./ThemeToggle";
import { hasRole } from "../utils/roles";

const readStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readStoredUser());

  const roles = user?.roles || [];
  const isAdmin = hasRole(roles, "ROLE_ADMIN");
  const isSecretary = hasRole(roles, "ROLE_SECRETARY");
  const isApprover = !["ROLE_SECRETARY", "ROLE_ADMIN", "ROLE_USER"].some((role) =>
    hasRole(roles, role)
  );

  const sections = useMemo(() => {
    const baseSections = [
      {
        title: "Public",
        items: [
          {
            name: "Landing",
            path: "/",
            icon: <House size={18} />,
            end: true,
          },
        ],
      },
      {
        title: "Workspace",
        items: [
          {
            name: "Create Event",
            path: "/dashboard/events",
            icon: <PlusCircle size={18} />,
          },
          {
            name: "Letter Box",
            path: "/dashboard/my-letters",
            icon: <Mail size={18} />,
          },
          {
            name: "Schedule",
            path: "/dashboard/calendar",
            icon: <CalendarDays size={18} />,
          },
          {
            name: "Facility Resources",
            path: "/dashboard/places",
            icon: <MapPin size={18} />,
          },
        ],
      },
    ];

    if (isApprover) {
      baseSections.push({
        title: "Review & Approvals",
        items: [
          {
            name: "To Be Approved",
            path: "/dashboard/to-approve",
            icon: <Clock size={18} />,
          },
          {
            name: "Approved By Me",
            path: "/dashboard/approved-by-me",
            icon: <CheckCircle2 size={18} />,
          },
          {
            name: "Rejected By Me",
            path: "/dashboard/rejected-by-me",
            icon: <XCircle size={18} />,
          },
        ],
      });
    }

    const managementItems = [
      ...(isSecretary
        ? [
            {
              name: "My Club",
              path: "/dashboard/my-club",
              icon: <Building2 size={18} />,
            },
          ]
        : []),
      ...(isAdmin
        ? [
            {
              name: "Club Create",
              path: "/dashboard/club-create",
              icon: <Building2 size={18} />,
            },
            {
              name: "Create User",
              path: "/dashboard/users-create",
              icon: <UserPlus size={18} />,
            },
          ]
        : []),
    ];

    if (managementItems.length > 0) {
      baseSections.push({
        title: "Management",
        items: managementItems,
      });
    }

    return baseSections;
  }, [isAdmin, isApprover, isSecretary]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <div className="w-72 theme-bg-page min-h-screen flex flex-col border-r theme-border">
      <div className="p-8 mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black theme-text tracking-tight uppercase italic">
            Event<span className="theme-text-primary">Flow</span>
          </h2>
          <p className="text-[10px] theme-text-muted font-bold tracking-[0.2em] uppercase mt-1">
            Management System
          </p>
        </div>

        <ThemeToggle />
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <SidebarSection key={section.title} title={section.title} items={section.items} />
        ))}
      </nav>

      <div className="p-4 border-t theme-border mt-auto theme-bg-surface">
        <div className="flex items-center gap-3 p-3 rounded-2xl theme-bg-surface-muted border theme-border">
          <div className="w-10 h-10 rounded-xl theme-gradient-primary flex items-center justify-center theme-text font-bold shadow-lg">
            {user?.username?.charAt(0) || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="theme-text text-sm font-bold truncate">
              {user?.username || "Guest User"}
            </p>
            <p className="theme-text-muted text-[10px] font-medium truncate uppercase tracking-tighter">
              {user?.regNumber || "ID Unknown"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 theme-text-muted theme-hover-text-danger transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const SidebarSection = ({ title, items }) => (
  <div className="space-y-2">
    <p className="px-4 text-[10px] font-black theme-text-soft uppercase tracking-widest">{title}</p>
    <div className="space-y-1">
      {items.map((item) => (
        <SidebarLink key={item.path} item={item} />
      ))}
    </div>
  </div>
);

const SidebarLink = ({ item }) => (
  <NavLink
    to={item.path}
    end={item.end}
    className={({ isActive }) =>
      `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? "theme-bg-tint theme-text-primary border theme-border-primary"
          : "theme-text-muted theme-hover-bg theme-hover-text"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <span
            className={`${
              isActive ? "theme-text-primary" : "theme-text-muted theme-group-hover-text"
            } transition-colors`}
          >
            {item.icon}
          </span>
          <span className="text-sm font-bold tracking-tight">{item.name}</span>
        </div>

        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full theme-bg-accent theme-shadow-glow" />
        )}
      </>
    )}
  </NavLink>
);

export default Sidebar;
