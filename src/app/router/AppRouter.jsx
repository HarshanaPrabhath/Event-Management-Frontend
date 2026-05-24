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
import { NotFoundPage } from "../../features/not-found/pages";
import { ClubCreatePage, ClubDetailsPage, ClubProfilePage } from "../../features/club/pages";
import { LandingPage } from "../../features/landing/pages";
import ThemeToggle from "../../shared/ui/ThemeToggle";

const hasSession = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return Boolean(token || user);
  } catch {
    return false;
  }
};

function RequireAuth({ children }) {
  return hasSession() ? children : <Navigate to="/login" replace />;
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
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="places" element={<PlacesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="my-letters" element={<MyLettersPage />} />
          <Route path="to-approve" element={<ToApprovePage />} />
          <Route path="approved-by-me" element={<ApprovedByMePage />} />
          <Route path="rejected-by-me" element={<RejectedByMePage />} />
          <Route path="club-create" element={<ClubCreatePage />} />
          <Route path="users-create" element={<AdminCreateUserPage />} />
          <Route path="my-club" element={<ClubProfilePage />} />
          <Route path="*" element={<Navigate to="events" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
