import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Association from "./pages/Association";
import Servicos from "./pages/Servicos";
import NoticiasPublic from "./pages/Noticias";
import NoticiaDetalhes from "./pages/NoticiaDetalhes";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

// Admin imports
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/layout/AdminLayout";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Carrossel from "./pages/admin/midias/Carrossel";
import VideoDestaque from "./pages/admin/midias/VideoDestaque";
import Popup from "./pages/admin/midias/Popup";
import Podcasts from "./pages/admin/Podcasts";
import CardsInformativos from "./pages/admin/CardsInformativos";
import Candidatos from "./pages/admin/Candidatos";
import Indicadores from "./pages/admin/Indicadores";
import Usuarios from "./pages/admin/Usuarios";
import MeuPerfil from "./pages/admin/MeuPerfil";
import ConfiguracoesSite from "./pages/admin/ConfiguracoesSite";
import QuemSomos from "./pages/admin/QuemSomos";
import NoticiasAdmin from "./pages/admin/Noticias";
import EmailTemplates from "./pages/admin/EmailTemplates";
import TesteEmail from "./pages/admin/TesteEmail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/associacao" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Association />
                </main>
                <Footer />
                <WhatsAppButton />
              </div>
            } />
            <Route path="/servicos" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Servicos />
                </main>
                <Footer />
                <WhatsAppButton />
              </div>
            } />
            <Route path="/noticias" element={<NoticiasPublic />} />
            <Route path="/noticias/:slug" element={<NoticiaDetalhes />} />

            {/* Admin auth routes (no layout) */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />

            {/* Admin protected routes with layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Mídias */}
              <Route path="midias/carrossel" element={<Carrossel />} />
              <Route path="midias/video-destaque" element={<VideoDestaque />} />
              <Route path="midias/popup" element={<Popup />} />
              
              {/* Podcasts */}
              <Route path="podcasts" element={<Podcasts />} />
              <Route path="cards-informativos" element={<CardsInformativos />} />
              <Route path="quem-somos" element={<QuemSomos />} />
              <Route path="noticias" element={<NoticiasAdmin />} />
              <Route path="candidatos" element={<Candidatos />} />
              <Route path="indicadores" element={<Indicadores />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="configuracoes" element={<ConfiguracoesSite />} />
              <Route path="email-templates" element={<EmailTemplates />} />
              <Route path="teste-email" element={<TesteEmail />} />
              <Route path="perfil" element={<MeuPerfil />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
