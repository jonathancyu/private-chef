import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { MacrosSummary } from "../types/api.types";
import { getDailyMacros } from "../services/api";

const Dashboard: React.FC = () => {
  const [todayMacros, setTodayMacros] = useState<MacrosSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTodayMacros = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const data = await getDailyMacros(today);
        setTodayMacros(data);
      } catch (error) {
        console.error("Failed to load today's macros", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayMacros();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>

          {loading ? (
            <div className="text-center py-8">Loading data...</div>
          ) : !todayMacros ? (
            <div className="text-center py-8 text-gray-500">
              No meals recorded for today.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded">
                <div className="text-xs text-indigo-600 font-medium">
                  CALORIES
                </div>
                <div className="text-2xl font-bold">
                  {todayMacros.calories}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <div className="text-xs text-blue-600 font-medium">PROTEIN</div>
                <div className="text-2xl font-bold">
                  {todayMacros.protein.toFixed(1)}g
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <div className="text-xs text-green-600 font-medium">CARBS</div>
                <div className="text-2xl font-bold">
                  {todayMacros.carbs.toFixed(1)}g
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-xs text-yellow-600 font-medium">FAT</div>
                <div className="text-2xl font-bold">
                  {todayMacros.fat.toFixed(1)}g
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <a
                href="/planning"
                className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded"
              >
                <div className="font-medium text-indigo-700">Create Recipe</div>
                <div className="text-xs text-indigo-600">
                  Add a new recipe to your collection
                </div>
              </a>
              <a
                href="/inventory"
                className="block bg-blue-50 hover:bg-blue-100 p-3 rounded"
              >
                <div className="font-medium text-blue-700">
                  Update Inventory
                </div>
                <div className="text-xs text-blue-600">
                  Add ingredients to your inventory
                </div>
              </a>
              <a
                href="/eating"
                className="block bg-green-50 hover:bg-green-100 p-3 rounded"
              >
                <div className="font-medium text-green-700">Record Meal</div>
                <div className="text-xs text-green-600">
                  Track what you've eaten
                </div>
              </a>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Nutrition Breakdown</h3>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading data...</div>
            ) : !todayMacros ? (
              <div className="text-center py-8 text-gray-500">
                No meals recorded for today.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(todayMacros.meals).map(
                  ([mealType, items]) =>
                    items.length > 0 && (
                      <div key={mealType} className="border-b pb-3">
                        <div className="font-medium capitalize mb-2">
                          {mealType}
                        </div>
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} ({item.servings} servings)
                            </span>
                            <span>{item.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
