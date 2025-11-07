import { createContext, useContext, useState } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventoryData, setInventoryData] = useState(null);
  const [fileName, setFileName] = useState('');

  return (
    <InventoryContext.Provider value={{ 
      inventoryData, 
      setInventoryData,
      fileName,
      setFileName
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}