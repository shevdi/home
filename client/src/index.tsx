import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { BrowserRouter, Routes, Route } from "react-router";
import { ProjectsPage, WelcomePage } from "./pages";
import { Header } from "./components/Header";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <App>
      <BrowserRouter>
        <Routes>
          <Route element={<Header />}>
            <Route index element={<WelcomePage />} />
            <Route path="home">
              <Route index element={<div>homeage</div>} />
            </Route>
            <Route path="projects">
              <Route index element={<ProjectsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </App>
  );
}
