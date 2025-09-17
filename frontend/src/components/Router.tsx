import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import AppLayout from "../pages/AppLayout";
import PublicLayout from "../pages/PublicLayout";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout>Home</PublicLayout>} />
        <Route path="/app/*" element={<AppLayout>App</AppLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
