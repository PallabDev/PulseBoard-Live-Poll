// Removed unused React import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { DashboardLayout } from './components/shared/layout/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { PollBuilder } from './pages/builder/PollBuilder';
import { PublicPoll } from './pages/public/PublicPoll';
import { LiveAnalytics } from './pages/analytics/LiveAnalytics';
import { ParticipantSummary } from './pages/analytics/ParticipantSummary';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Toaster } from '@/components/ui/sonner';
import Home from '@/pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/join/:shareCode" element={<PublicPoll />} />
          <Route path="/analytics/:analyticsCode" element={<LiveAnalytics />} />
          <Route path="/analytics/:analyticsCode/summary" element={<ParticipantSummary />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="create" element={<PollBuilder />} />
            <Route path="edit/:pollId" element={<PollBuilder />} />
          </Route>

          {/* Home Page */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <Toaster theme="dark" />
    </AuthProvider>
  );
}

export default App;
