import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import AdminPage from "./pages/AdminPage";
import ManageJobPage from "./pages/ManageJobPage"; // Import the new page
import DebugCameraPage from "./pages/DebugCameraPage"; // Import the new debug page
import SuccessPage from "./pages/SuccessPage"; // Import the new success page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apply/:jobId" element={<Apply />} />
          <Route path="/apply/success" element={<SuccessPage />} /> {/* New route for success page */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/manage-job/:jobId" element={<ManageJobPage />} /> {/* New route for ManageJobPage */}
          <Route path="/debug/camera" element={<DebugCameraPage />} /> {/* Debug route for camera */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
