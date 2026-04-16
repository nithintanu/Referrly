import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Footer, Header } from "./components/Layout";
import { CreateRequest } from "./pages/CreateRequest";
import { Dashboard } from "./pages/Dashboard";
import { FindReferrers } from "./pages/FindReferrers";
import { Home } from "./pages/Home";
import { IncomingRequests } from "./pages/IncomingRequests";
import { Login } from "./pages/Login";
import { MyRequests } from "./pages/MyRequests";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Rewards } from "./pages/Rewards";
import { ProtectedRoute } from "./utils/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-transparent text-slate-900">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute requiredRoles={["SEEKER"]}>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incoming-requests"
                element={
                  <ProtectedRoute requiredRoles={["REFERRER"]}>
                    <IncomingRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/find-referrers"
                element={
                  <ProtectedRoute requiredRoles={["SEEKER"]}>
                    <FindReferrers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-request"
                element={
                  <ProtectedRoute requiredRoles={["SEEKER"]}>
                    <CreateRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rewards"
                element={
                  <ProtectedRoute requiredRoles={["REFERRER"]}>
                    <Rewards />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
