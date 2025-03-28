import React, { useState, useEffect } from "react";
import { InventoryItem, Snack } from "../../types/api.types";
import { getInventory, getSnacks } from "../../services/api";

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryData, snacksData] = await Promise.all([
          getInventory(),
          getSnacks(),
        ]);

        setInventory(inventoryData);
        setSnacks(snacksData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>

      {/* Ingredients Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Ingredients</h3>
        {inventory.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No ingredients in inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.ingredient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${item.amount} ${item.ingredient.unit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.purchase_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snacks Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Snacks</h3>
        {snacks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No snacks available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calories per Serving
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {snacks.map((snack) => (
                  <tr key={snack.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {snack.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {snack.servings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {snack.calories_per_serving}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
