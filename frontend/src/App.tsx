import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RecipesPage from "./pages/RecipesPage";
import PlanningPage from "./pages/PlanningPage";
import InventoryPage from "./pages/InventoryPage";
import EatingPage from "./pages/EatingPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/eating" element={<EatingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
