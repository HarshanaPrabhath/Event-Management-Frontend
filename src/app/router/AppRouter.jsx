import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import { AdminCreateUserPage, LoginPage, RegisterPage } from "../../features/auth/pages";
import {
  EventsPage,
  CalendarPage,
  MyLettersPage,
  ToApprovePage,
  ApprovedByMePage,
  RejectedByMePage,
} from "../../features/events/pages";
import { PlacesPage } from "../../features/places/pages";
import { EquipmentPage } from "../../features/equipment/pages";
import { NotFoundPage } from "../../features/not-found/pages";
import { ClubCreatePage, ClubDetailsPage, ClubProfilePage, ManageClubsPage } from "../../features/club/pages";
import { LandingPage } from "../../features/landing/pages";
import ThemeToggle from "../../shared/ui/ThemeToggle";
import { hasRole } from "../../shared/utils/roles";

const hasSession = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return Boolean(token || user);
  } catch {
    return false;
  }
};

const getStoredRoles = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.roles || [];
  } catch {
    return [];
  }
};

const isSecretary = () => hasRole(getStoredRoles(), "ROLE_SECRETARY");

function RequireAuth({ children }) {
  return hasSession() ? children : <Navigate to="/login" replace />;
}

// Only a club secretary can create/send an event request.
function RequireSecretary({ children }) {
  return isSecretary() ? children : <Navigate to="/dashboard/calendar" replace />;
}

function DashboardIndexRedirect() {
  return <Navigate to={isSecretary() ? "events" : "calendar"} replace />;
}

function RedirectIfAuth({ children }) {
  return hasSession() ? <Navigate to="/dashboard" replace /> : children;
}

function PublicThemeToggle() {
  const location = useLocation();

  if (location.pathname.startsWith("/dashboard")) {
    return null;
  }

  return <ThemeToggle className="fixed right-5 top-5 z-50 shadow-lg" />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <PublicThemeToggle />
      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={(
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          )}
        />
        <Route
          path="/register"
          element={(
            <RedirectIfAuth>
              <RegisterPage />
            </RedirectIfAuth>
          )}
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/club/:clubId" element={<ClubDetailsPage />} />

        {/* Dashboard / Main */}
        <Route
          path="/dashboard"
          element={(
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          )}
        >
          <Route index element={<DashboardIndexRedirect />} />
          <Route
            path="events"
            element={(
              <RequireSecretary>
                <EventsPage />
              </RequireSecretary>
            )}
          />
          <Route path="places" element={<PlacesPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="my-letters" element={<MyLettersPage />} />
          <Route path="to-approve" element={<ToApprovePage />} />
          <Route path="approved-by-me" element={<ApprovedByMePage />} />
          <Route path="rejected-by-me" element={<RejectedByMePage />} />
          <Route path="club-create" element={<ClubCreatePage />} />
          <Route path="manage-clubs" element={<ManageClubsPage />} />
          <Route path="users-create" element={<AdminCreateUserPage />} />
          <Route path="my-club" element={<ClubProfilePage />} />
          <Route path="*" element={<DashboardIndexRedirect />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
