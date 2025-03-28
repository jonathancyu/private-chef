import React from "react";
import Layout from "../components/layout/Layout";
import InventoryList from "../components/inventory/InventoryList";
import CookMealForm from "../components/inventory/CookMealForm";
import AddSnackForm from "../components/inventory/AddSnackForm";

const InventoryPage: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <InventoryList />
        </div>
        <div>
          <CookMealForm />
        </div>
        <div>
          <AddSnackForm />
        </div>
      </div>
    </Layout>
  );
};

export default InventoryPage;
