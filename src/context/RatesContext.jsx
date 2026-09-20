import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db';
import { DEFAULT_CALCULATOR_CONFIGS, COST_TIERS } from '../db/seedData';

const RatesContext = createContext(null);

export function RatesProvider({ children }) {
  const [rates, setRates] = useState(DEFAULT_CALCULATOR_CONFIGS);
  const [costTiers, setCostTiers] = useState(COST_TIERS);
  const [historyLog, setHistoryLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedRates, fetchedTiers, fetchedHistory] = await Promise.all([
        db.getRates(),
        db.getCostTiers(),
        db.getHistoryLog()
      ]);
      setRates(fetchedRates);
      setCostTiers(fetchedTiers);
      setHistoryLog(fetchedHistory);
    } catch (err) {
      console.error("Failed to load rates from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLog = async (entry) => {
    try {
      const updatedHistory = await db.addHistoryEntry(entry);
      setHistoryLog(updatedHistory);
    } catch (err) {
      console.error("Failed to add log entry:", err);
    }
  };

  const updateCalculatorConfig = async (calcId, updatedConfig, adminId = 'admin') => {
    try {
      const prevConfig = rates[calcId];
      const updatedRates = await db.updateRates(calcId, updatedConfig);
      setRates({ ...updatedRates });

      // Identify what changed for the audit log
      let changeDesc = 'Updated product rates/options';
      if (prevConfig?.customFormula !== updatedConfig.customFormula) {
        changeDesc = `Formula changed to: "${updatedConfig.customFormula || '(fabricCost + stitchingCost + packingCost) * overheadMultiplier'}"`;
      } else if (prevConfig?.name !== updatedConfig.name) {
        changeDesc = `Renamed product from "${prevConfig?.name}" to "${updatedConfig.name}"`;
      }

      await addLog({
        action: 'Rate & Config Update',
        target: updatedConfig.name || calcId,
        details: changeDesc,
        adminId,
        snapshot: { calcId, config: JSON.parse(JSON.stringify(updatedConfig)) }
      });

      return true;
    } catch (err) {
      console.error("Failed to update calculator config:", err);
      throw err;
    }
  };

  const resetFormulaToDefault = async (calcId, adminId = 'admin') => {
    if (!rates[calcId]) return;
    const standardFormula = '(fabricCost + stitchingCost + packingCost) * overheadMultiplier';
    const updated = {
      ...rates[calcId],
      customFormula: standardFormula
    };
    await updateCalculatorConfig(calcId, updated, adminId);
    await addLog({
      action: 'Formula Reset',
      target: rates[calcId].name || calcId,
      details: 'Restored standard calculation formula: (fabricCost + stitchingCost + packingCost) * overheadMultiplier',
      adminId,
      snapshot: { calcId, config: JSON.parse(JSON.stringify(updated)) }
    });
    return updated;
  };

  const rollbackFromHistory = async (historyEntry) => {
    if (!historyEntry?.snapshot) {
      throw new Error("No restorable snapshot in this history entry");
    }
    const { calcId, config } = historyEntry.snapshot;
    if (calcId && config) {
      await updateCalculatorConfig(calcId, config, 'admin');
      await addLog({
        action: 'Rollback',
        target: config.name || calcId,
        details: `Restored state from history timestamp ${new Date(historyEntry.timestamp).toLocaleTimeString()}`,
        adminId: 'admin'
      });
      return true;
    }
    throw new Error("Invalid snapshot data");
  };

  const createNewProduct = async (newProduct) => {
    try {
      const updatedRates = await db.createProduct(newProduct);
      setRates({ ...updatedRates });
      return true;
    } catch (err) {
      console.error("Failed to create product:", err);
      throw err;
    }
  };

  const removeProduct = async (productId) => {
    try {
      const updatedRates = await db.deleteProduct(productId);
      setRates({ ...updatedRates });
      return true;
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  };

  const updateTiersConfig = async (newTiers) => {
    try {
      const updated = await db.updateCostTiers(newTiers);
      setCostTiers([...updated]);
      return true;
    } catch (err) {
      console.error("Failed to update cost tiers:", err);
      throw err;
    }
  };

  const resetAllRates = async () => {
    try {
      const defaultRates = await db.resetRatesToDefault();
      setRates({ ...defaultRates });
      return true;
    } catch (err) {
      console.error("Failed to reset rates:", err);
      throw err;
    }
  };

  const value = {
    rates,
    costTiers,
    historyLog,
    loading,
    updateCalculatorConfig,
    resetFormulaToDefault,
    rollbackFromHistory,
    createNewProduct,
    removeProduct,
    updateTiersConfig,
    resetAllRates,
    reloadRates: loadData
  };

  return (
    <RatesContext.Provider value={value}>
      {children}
    </RatesContext.Provider>
  );
}

export function useRates() {
  const context = useContext(RatesContext);
  if (!context) throw new Error("useRates must be used within a RatesProvider");
  return context;
}
