import React, { useState, useEffect } from "react";
import { Snack } from "../../types/api.types";
import { getSnacks, createSnack } from "../../services/api";

const AddSnackForm: React.FC = () => {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [formData, setFormData] = useState<Omit<Snack, "id">>({
    name: "",
    servings: 1,
    calories_per_serving: 0,
    protein_per_serving: 0,
    carbs_per_serving: 0,
    fat_per_serving: 0,
  });

  useEffect(() => {
    const loadSnacks = async () => {
      try {
        setLoading(true);
        const snacksData = await getSnacks();
        setSnacks(snacksData);
      } catch (error) {
        console.error("Failed to load snacks", error);
      } finally {
        setLoading(false);
      }
    };

    loadSnacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSnack(formData);
      setStatus({
        type: "success",
        message: "Snack added successfully!",
      });
      // Reset form
      setFormData({
        name: "",
        servings: 1,
        calories_per_serving: 0,
        protein_per_serving: 0,
        carbs_per_serving: 0,
        fat_per_serving: 0,
      });
      // Reload snacks
      const snacksData = await getSnacks();
      setSnacks(snacksData);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.response?.data?.detail || "Failed to add snack",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading snacks...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Snack</h2>

      {status.message && (
        <div
          className={`p-3 mb-4 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Snack Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Calories per Serving</label>
          <input
            type="number"
            name="calories_per_serving"
            value={formData.calories_per_serving}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Protein per Serving (g)</label>
          <input
            type="number"
            name="protein_per_serving"
            value={formData.protein_per_serving}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Carbs per Serving (g)</label>
          <input
            type="number"
            name="carbs_per_serving"
            value={formData.carbs_per_serving}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Fat per Serving (g)</label>
          <input
            type="number"
            name="fat_per_serving"
            value={formData.fat_per_serving}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Snack
        </button>
      </form>

      {snacks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Available Snacks</h3>
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
                    Calories
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {snacks.map((snack) => (
                  <tr key={snack.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{snack.name}</td>
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
        </div>
      )}
    </div>
  );
};

export default AddSnackForm; 