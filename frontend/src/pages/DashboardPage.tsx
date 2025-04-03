import React from "react";
import { Link } from "react-router-dom";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/recipes"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Recipes</h2>
          <p className="text-gray-600">Manage your recipes and meal planning</p>
        </Link>

        <Link
          to="/inventory"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Inventory</h2>
          <p className="text-gray-600">Track your food inventory and ingredients</p>
        </Link>

        <Link
          to="/meals"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Meals</h2>
          <p className="text-gray-600">Plan and track your meals</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage; 