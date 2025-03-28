import React, { useState } from 'react';

interface MealPopupProps {
  recipeName: string;
  currentServings: number;
  onUpdateServings: (servings: number) => void;
  onUnplan: () => void;
  onClose: () => void;
}

const MealPopup: React.FC<MealPopupProps> = ({
  recipeName,
  currentServings,
  onUpdateServings,
  onUnplan,
  onClose,
}) => {
  const [servings, setServings] = useState(currentServings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{recipeName}</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servings
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center">{servings}</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onUnplan()}
            className="px-4 py-2 text-red-600 hover:text-red-800"
          >
            Unplan
          </button>
          <button
            onClick={() => {
              onUpdateServings(servings);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealPopup; 