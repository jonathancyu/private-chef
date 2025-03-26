import React, { useState, useEffect } from "react";
import { MacrosSummary } from "../../types/api.types";
import { getDailyMacros } from "../../services/api";

interface MacrosCardProps {
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MacrosCard: React.FC<MacrosCardProps> = ({
  title,
  calories,
  protein,
  carbs,
  fat,
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-500">Calories</div>
          <div className="font-medium">{calories}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-500">Protein</div>
          <div className="font-medium">{protein.toFixed(1)}g</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-500">Carbs</div>
          <div className="font-medium">{carbs.toFixed(1)}g</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-500">Fat</div>
          <div className="font-medium">{fat.toFixed(1)}g</div>
        </div>
      </div>
    </div>
  );
};

interface MealDetailProps {
  title: string;
  items: Array<{
    type: string;
    name: string;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

const MealDetail: React.FC<MealDetailProps> = ({ title, items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <div className="font-medium">{item.name}</div>
              <div className="text-gray-600">{item.servings} serving(s)</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.calories} cal | {item.protein.toFixed(1)}g protein |{" "}
              {item.carbs.toFixed(1)}g carbs | {item.fat.toFixed(1)}g fat
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyMacros: React.FC = () => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [macros, setMacros] = useState<MacrosSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchMacros = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDailyMacros(date);
        setMacros(data);
      } catch (error) {
        console.error("Failed to fetch macros", error);
        setError("Failed to load data for the selected date");
      } finally {
        setLoading(false);
      }
    };

    fetchMacros();
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daily Nutrition Summary</h2>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="p-2 border rounded"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading nutrition data...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !macros ? (
        <div className="text-center py-8 text-gray-500">No data available</div>
      ) : (
        <div>
          <MacrosCard
            title="Daily Totals"
            calories={macros.total_calories}
            protein={macros.total_protein}
            carbs={macros.total_carbs}
            fat={macros.total_fat}
          />

          <MealDetail title="Breakfast" items={macros.meals.breakfast} />
          <MealDetail title="Lunch" items={macros.meals.lunch} />
          <MealDetail title="Dinner" items={macros.meals.dinner} />
          <MealDetail title="Snacks" items={macros.meals.snack} />
        </div>
      )}
    </div>
  );
};

export default DailyMacros;
