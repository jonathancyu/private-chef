import React, { useState, useEffect } from "react";
import { InventoryItem } from "../../types/api.types";
import { getInventory, addToInventory } from "../../services/api";
import { getIngredients } from "../../services/api";

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [ingredients, setIngredients] = useState<
    { id: number; name: string; unit: string }[]
  >([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryData, ingredientsData] = await Promise.all([
          getInventory(),
          getIngredients(),
        ]);

        setInventory(inventoryData);
        setIngredients(
          ingredientsData.map((i) => ({
            id: i.id,
            name: i.name,
            unit: i.unit,
          })),
        );

        if (ingredientsData.length > 0) {
          setSelectedIngredientId(ingredientsData[0].id);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddIngredient = async () => {
    if (!selectedIngredientId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const newItem = await addToInventory({
        ingredient_id: selectedIngredientId,
        amount,
        purchase_date: today,
      });

      // Update the local inventory state
      const existingItemIndex = inventory.findIndex(
        (item) => item.ingredient_id === newItem.ingredient_id,
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedInventory = [...inventory];
        updatedInventory[existingItemIndex] = newItem;
        setInventory(updatedInventory);
      } else {
        // Add new item
        setInventory([...inventory, newItem]);
      }

      // Reset form
      setAmount(1);
    } catch (error) {
      console.error("Failed to add to inventory", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>

      <div className="mb-6 flex items-end space-x-4">
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Ingredient</label>
          <select
            value={selectedIngredientId}
            onChange={(e) => setSelectedIngredientId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="block text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="0.1"
            step="0.1"
          />
        </div>
        <div>
          <button
            onClick={handleAddIngredient}
            disabled={ingredients.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add to Inventory
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
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
  );
};

export default InventoryList;
