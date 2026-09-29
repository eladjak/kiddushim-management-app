import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRole } from "@/types/auth";

// ---- mocks -----------------------------------------------------------------
type AuthState = {
  user: { id: string } | null;
  profile: { role: AppRole | null } | null;
  isLoading: boolean;
};
let authState: AuthState;
vi.mock("@/context/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("@/components/Navigation", () => ({ Navigation: () => null }));

const fromCalls: string[] = [];
const chain = (rows: unknown[]) => {
  const q: Record<string, unknown> = {};
  q.select = () => q;
  q.eq = () => q;
  q.order = () => q;
  q.then = (resolve: (v: unknown) => unknown) => resolve({ data: rows, error: null });
  return q;
};
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      fromCalls.push(table);
      if (table === "events") return chain([{ id: "e1", title: "קידושישי בדיקה", date: "2026-10-09T17:00:00Z" }]);
      if (table === "event_registrations")
        return chain([
          { id: "r1", name: "דנה כהן", phone: "0501234567", status: "pending", consent_at: "2026-09-29T08:00:00Z" },
        ]);
      return chain([]);
    },
  },
}));

import Registrants from "@/pages/Registrants";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const renderAt = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/registrants"]}>
        <Routes>
          <Route
            path="/registrants"
            element={
              <ProtectedRoute requiredRoles={["admin", "coordinator"]}>
                <Registrants />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div>AUTH_PAGE</div>} />
          <Route path="/" element={<div>HOME_PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const as = (role: AppRole | null): AuthState => ({ user: { id: "u1" }, profile: { role }, isLoading: false });
const registrantQueries = () => fromCalls.filter((t) => t === "event_registrations");

beforeEach(() => {
  fromCalls.length = 0;
});

describe("/registrants access gate", () => {
  it("coordinator sees the registrants list", async () => {
    authState = as("coordinator");
    renderAt();
    expect((await screen.findAllByText("דנה כהן")).length).toBeGreaterThan(0);
    expect(registrantQueries().length).toBeGreaterThan(0);
  });

  it("admin sees the registrants list", async () => {
    authState = as("admin");
    renderAt();
    expect((await screen.findAllByText("דנה כהן")).length).toBeGreaterThan(0);
  });

  it("youth_volunteer is redirected away and never queries registrants", async () => {
    authState = as("youth_volunteer");
    renderAt();
    expect(await screen.findByText("HOME_PAGE")).toBeInTheDocument();
    expect(screen.queryByText("דנה כהן")).not.toBeInTheDocument();
    expect(registrantQueries()).toHaveLength(0);
  });

  it("anonymous user is sent to /auth and never queries registrants", async () => {
    authState = { user: null, profile: null, isLoading: false };
    renderAt();
    expect(await screen.findByText("AUTH_PAGE")).toBeInTheDocument();
    expect(screen.queryByText("דנה כהן")).not.toBeInTheDocument();
    expect(registrantQueries()).toHaveLength(0);
  });

  it("fails closed when the profile has no role (ProtectedRoute alone would let it through)", async () => {
    authState = as(null);
    renderAt();
    expect(await screen.findByRole("alert")).toHaveTextContent("אין לך הרשאה");
    await waitFor(() => expect(screen.queryByText("דנה כהן")).not.toBeInTheDocument());
    expect(registrantQueries()).toHaveLength(0);
  });

  it.each<AppRole>(["service_girl", "volunteer"])("%s never sees registrants", async (role) => {
    authState = as(role);
    renderAt();
    await screen.findByText("HOME_PAGE");
    expect(registrantQueries()).toHaveLength(0);
  });
});
