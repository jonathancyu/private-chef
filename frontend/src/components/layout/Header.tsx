import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-indigo-700" : "";
  };

  return (
    <header className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Meal Planner</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className={`px-3 py-2 rounded ${isActive("/")}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes"
                  className={`px-3 py-2 rounded ${isActive("/recipes")}`}
                >
                  Recipes
                </Link>
              </li>
              <li>
                <Link
                  to="/planning"
                  className={`px-3 py-2 rounded ${isActive("/planning")}`}
                >
                  Planning
                </Link>
              </li>
              <li>
                <Link
                  to="/inventory"
                  className={`px-3 py-2 rounded ${isActive("/inventory")}`}
                >
                  Inventory
                </Link>
              </li>
              <li>
                <Link
                  to="/eating"
                  className={`px-3 py-2 rounded ${isActive("/eating")}`}
                >
                  Eating
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
