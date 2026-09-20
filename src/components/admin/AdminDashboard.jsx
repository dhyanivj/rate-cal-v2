import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../db';
import { useRates } from '../../context/RatesContext';
import { evaluateCustomFormula } from '../../calculators/engines';
import {
  Users,
  Settings,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Save,
  Copy,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Percent,
  Calculator,
  Layers,
  Code2,
  Sparkles,
  Tag,
  History,
  RotateCcw
} from 'lucide-react';

export default function AdminDashboard({ onNotify }) {
  const {
    rates,
    costTiers,
    historyLog,
    updateCalculatorConfig,
    resetFormulaToDefault,
    rollbackFromHistory,
    createNewProduct,
    removeProduct,
    updateTiersConfig,
    resetAllRates
  } = useRates();

  // Tabs: 'rates' | 'formula' | 'users' | 'tiers' | 'history'
  const [adminTab, setAdminTab] = useState('rates');

  // Selected calculator to edit
  const productIds = useMemo(() => Object.keys(rates || {}), [rates]);
  const [selectedCalcId, setSelectedCalcId] = useState(() => productIds[0] || 'colors210');
  const [editableConfig, setEditableConfig] = useState(null);

  // New Product Modal State
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    id: '',
    name: '',
    subtitle: '',
    category: 'bedsheet',
    cloneFromId: 'colors210'
  });

  // Users state
  const [userList, setUserList] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    id: '',
    name: '',
    password: '',
    role: 'user',
    status: 'active'
  });

  // Tiers editing state
  const [editableTiers, setEditableTiers] = useState([]);

  // Formula test scope state for live testing
  const [testFormulaScope, setTestFormulaScope] = useState({
    fabricCost: 350,
    stitchingCost: 42,
    packingCost: 16.5,
    overheadMultiplier: 1.07,
    totalMeter: 3.07,
    pillowCount: 2
  });

  // Handle direct reset of current product's formula back to standard
  const handleResetFormula = async () => {
    try {
      const standardFormula = '(fabricCost + stitchingCost + packingCost) * overheadMultiplier';
      setEditableConfig({
        ...editableConfig,
        customFormula: standardFormula
      });
      await resetFormulaToDefault(selectedCalcId);
      onNotify?.(`Formula for "${editableConfig?.name || selectedCalcId}" restored to standard equation`);
    } catch (err) {
      onNotify?.(`Failed to reset formula: ${err.message}`, 'error');
    }
  };

  // Handle rollback to a previous snapshot
  const handleRollback = async (entry) => {
    if (window.confirm(`Roll back configuration to snapshot from ${new Date(entry.timestamp).toLocaleTimeString()}?`)) {
      try {
        await rollbackFromHistory(entry);
        onNotify?.(`Restored configuration from history entry: ${entry.action}`);
      } catch (err) {
        onNotify?.(`Rollback failed: ${err.message}`, 'error');
      }
    }
  };

  // Load users from DB
  const refreshUsers = async () => {
    try {
      const users = await db.getUsers();
      setUserList(users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // Ensure selectedCalcId is valid
  useEffect(() => {
    if (productIds.length > 0 && !rates[selectedCalcId]) {
      setSelectedCalcId(productIds[0]);
    }
  }, [productIds, rates, selectedCalcId]);

  // Sync editableConfig when selectedCalcId changes
  useEffect(() => {
    if (rates[selectedCalcId]) {
      setEditableConfig(JSON.parse(JSON.stringify(rates[selectedCalcId])));
    }
  }, [selectedCalcId, rates]);

  // Sync editableTiers
  useEffect(() => {
    if (costTiers) {
      setEditableTiers(JSON.parse(JSON.stringify(costTiers)));
    }
  }, [costTiers]);

  // Handle Save Rates & Metadata
  const handleSaveConfig = async () => {
    try {
      await updateCalculatorConfig(selectedCalcId, editableConfig);
      onNotify?.(`Saved configuration for "${editableConfig.name || selectedCalcId}"`);
    } catch (err) {
      onNotify?.(`Error saving product: ${err.message}`, 'error');
    }
  };

  // Handle Add New Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductData.id.trim() || !newProductData.name.trim()) {
      alert("Product ID and Name are required");
      return;
    }

    const cleanId = newProductData.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (rates[cleanId]) {
      alert(`Product ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    // Clone base options from existing product
    const baseSource = rates[newProductData.cloneFromId] || rates.colors210;
    const cloned = JSON.parse(JSON.stringify(baseSource));

    const newProductConfig = {
      ...cloned,
      id: cleanId,
      name: newProductData.name.trim(),
      subtitle: newProductData.subtitle.trim() || "Custom product configuration",
      category: newProductData.category,
      customSizes: cloned.customSizes || [
        { id: "single", label: "Single (54x90)", meter: 1.18, stitching: 12 },
        { id: "double", label: "Double (90x108)", meter: 2.35, stitching: 12 },
        { id: "king", label: "King (108x108)", meter: 2.82, stitching: 12 }
      ],
      colorFieldLabel: "Color / Variety",
      sizeFieldLabel: "Size",
      pillowFieldLabel: "Pillows",
      packingFieldLabel: "Packaging Type"
    };

    try {
      await createNewProduct(newProductConfig);
      setSelectedCalcId(cleanId);
      setNewProductModalOpen(false);
      setNewProductData({ id: '', name: '', subtitle: '', category: 'bedsheet', cloneFromId: 'colors210' });
      onNotify?.(`Created new product "${newProductConfig.name}"`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (productIds.length <= 1) {
      alert("Cannot delete the only remaining product");
      return;
    }

    const prodName = editableConfig?.name || selectedCalcId;
    if (window.confirm(`Are you sure you want to permanently delete "${prodName}"? This action cannot be undone.`)) {
      try {
        await removeProduct(selectedCalcId);
        const remaining = productIds.filter(id => id !== selectedCalcId);
        setSelectedCalcId(remaining[0] || 'colors210');
        onNotify?.(`Deleted product "${prodName}"`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Handle Clone Product
  const handleCloneProduct = async () => {
    const cloneId = `${selectedCalcId}_copy_${Date.now().toString().slice(-4)}`;
    const cloned = JSON.parse(JSON.stringify(editableConfig));
    cloned.id = cloneId;
    cloned.name = `${cloned.name} (Copy)`;

    try {
      await createNewProduct(cloned);
      setSelectedCalcId(cloneId);
      onNotify?.(`Cloned product as "${cloned.name}"`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Save Tiers
  const handleSaveTiers = async () => {
    try {
      await updateTiersConfig(editableTiers);
      onNotify?.('Tier multipliers updated successfully!');
    } catch (err) {
      onNotify?.(`Error saving tiers: ${err.message}`, 'error');
    }
  };

  // Handle Reset to defaults
  const handleResetDefaults = async () => {
    if (window.confirm("Are you sure you want to reset all products, rates, and formulas to initial factory defaults?")) {
      try {
        await resetAllRates();
        onNotify?.('Restored initial 12 calculators from default database');
      } catch (err) {
        onNotify?.(`Reset failed: ${err.message}`, 'error');
      }
    }
  };

  // User CRUD handlers
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userFormData.id.trim() || !userFormData.password.trim()) {
      alert("ID/Phone and Password are required");
      return;
    }

    try {
      if (editingUserId) {
        await db.updateUser(editingUserId, userFormData);
        onNotify?.(`User "${userFormData.id}" updated successfully`);
      } else {
        await db.createUser(userFormData);
        onNotify?.(`New user "${userFormData.id}" created successfully`);
      }
      setUserModalOpen(false);
      setEditingUserId(null);
      setUserFormData({ id: '', name: '', password: '', role: 'user', status: 'active' });
      await refreshUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUserId(user.id);
    setUserFormData({
      id: user.id,
      name: user.name || '',
      password: user.password || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`Are you sure you want to delete user "${userId}"?`)) {
      try {
        await db.deleteUser(userId);
        onNotify?.(`User "${userId}" deleted`);
        await refreshUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Test Formula Evaluation
  const evaluatedFormulaTest = useMemo(() => {
    if (!editableConfig?.customFormula) {
      const { fabricCost, stitchingCost, packingCost, overheadMultiplier } = testFormulaScope;
      return (fabricCost + stitchingCost + packingCost) * overheadMultiplier;
    }
    const result = evaluateCustomFormula(editableConfig.customFormula, testFormulaScope);
    return result;
  }, [editableConfig?.customFormula, testFormulaScope]);

  const filteredUsers = userList.filter(u =>
    u.id.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase()))
  );

  return (
    <div className="admin-card">
      {/* Top Admin Navigation */}
      <div className="admin-nav">
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'rates' ? 'active' : ''}`}
          onClick={() => setAdminTab('rates')}
        >
          <Settings size={16} />
          <span>Product & Fields Editor</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'formula' ? 'active' : ''}`}
          onClick={() => setAdminTab('formula')}
        >
          <Code2 size={16} />
          <span>Formula Engine</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'history' ? 'active' : ''}`}
          onClick={() => setAdminTab('history')}
        >
          <History size={16} />
          <span>Change History Log ({historyLog?.length || 0})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
        >
          <Users size={16} />
          <span>User Management ({userList.length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'tiers' ? 'active' : ''}`}
          onClick={() => setAdminTab('tiers')}
        >
          <Percent size={16} />
          <span>Margin Tiers</span>
        </button>
      </div>

      {/* 1. PRODUCT & FIELDS EDITOR TAB */}
      {adminTab === 'rates' && editableConfig && (
        <div>
          {/* PRODUCT ACTION TOOLBAR */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            {/* Product Selector */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '700px' }}>
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Current Product
                </label>
                <select
                  className="input-field"
                  style={{ width: '100%', fontWeight: 600 }}
                  value={selectedCalcId}
                  onChange={(e) => setSelectedCalcId(e.target.value)}
                >
                  {productIds.map(id => (
                    <option key={id} value={id}>
                      {rates[id]?.name || id} ({rates[id]?.category || 'product'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Mutation Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setNewProductModalOpen(true)}
                >
                  <Plus size={14} color="var(--accent-coral)" />
                  <span>Add Product</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCloneProduct}
                  title="Duplicate this product"
                >
                  <Copy size={14} />
                  <span>Clone</span>
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteProduct}
                  title="Delete this product"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Right save / reset actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetDefaults}
                title="Restore initial values from JSON"
              >
                <RefreshCw size={14} />
                <span>Factory Reset</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveConfig}
              >
                <Save size={14} />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* PRODUCT METADATA & CUSTOM FIELD LABELS */}
          <div style={{
            background: 'var(--bg-surface-soft)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-6)'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
              Product Identity & Field Renamer
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Product Display Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editableConfig.name || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Subtitle / Specs
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editableConfig.subtitle || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Rename Field 1 (Variety/Color)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Color / Variety"
                  value={editableConfig.colorFieldLabel || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, colorFieldLabel: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Rename Field 2 (Size Label)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Bedsheet Size"
                  value={editableConfig.sizeFieldLabel || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, sizeFieldLabel: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Rename Field 3 (Pillow/Units)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Pillow Quantity"
                  value={editableConfig.pillowFieldLabel || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, pillowFieldLabel: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Rename Field 4 (Packing Label)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Packaging Type"
                  value={editableConfig.packingFieldLabel || ''}
                  onChange={(e) => setEditableConfig({ ...editableConfig, packingFieldLabel: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC CHOICES & OPTIONS CRUD */}
          {(editableConfig.category === 'bedsheet' || editableConfig.colors || editableConfig.collections) && (
            <div>
              {/* 1. Variety / Colors List CRUD */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                    {editableConfig.colorFieldLabel || 'Color / Variety Options'} ({ (editableConfig.colors || editableConfig.collections || []).length })
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const list = editableConfig.colors || editableConfig.collections || [];
                      const newItem = {
                        id: `opt_${Date.now().toString().slice(-4)}`,
                        label: `New Variety ${list.length + 1}`,
                        rate: 150
                      };
                      if (editableConfig.colors) setEditableConfig({ ...editableConfig, colors: [...list, newItem] });
                      else setEditableConfig({ ...editableConfig, collections: [...list, newItem] });
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Variety</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  {(editableConfig.colors || editableConfig.collections || []).map((col, idx) => (
                    <div
                      key={col.id || idx}
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Option #{idx + 1}</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '2px 6px' }}
                          onClick={() => {
                            const list = [...(editableConfig.colors || editableConfig.collections)];
                            list.splice(idx, 1);
                            if (editableConfig.colors) setEditableConfig({ ...editableConfig, colors: list });
                            else setEditableConfig({ ...editableConfig, collections: list });
                          }}
                          title="Remove option"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Label</label>
                        <input
                          type="text"
                          className="input-field"
                          value={col.label}
                          onChange={(e) => {
                            const list = [...(editableConfig.colors || editableConfig.collections)];
                            list[idx].label = e.target.value;
                            if (editableConfig.colors) setEditableConfig({ ...editableConfig, colors: list });
                            else setEditableConfig({ ...editableConfig, collections: list });
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fabric Rate (₹/meter)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={col.rate}
                          onChange={(e) => {
                            const list = [...(editableConfig.colors || editableConfig.collections)];
                            list[idx].rate = Number(e.target.value) || 0;
                            if (editableConfig.colors) setEditableConfig({ ...editableConfig, colors: list });
                            else setEditableConfig({ ...editableConfig, collections: list });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Custom Sizes CRUD */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                    {editableConfig.sizeFieldLabel || 'Sizes & Consumption'} ({ (editableConfig.customSizes || []).length })
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const sizes = editableConfig.customSizes || [];
                      const newSize = {
                        id: `sz_${Date.now().toString().slice(-4)}`,
                        label: `New Size ${sizes.length + 1}`,
                        meter: 2.50,
                        stitching: 12
                      };
                      setEditableConfig({ ...editableConfig, customSizes: [...sizes, newSize] });
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Custom Size</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
                  {(editableConfig.customSizes || []).map((sz, sIdx) => (
                    <div
                      key={sz.id || sIdx}
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Size #{sIdx + 1}</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '2px 6px' }}
                          onClick={() => {
                            const sizes = [...editableConfig.customSizes];
                            sizes.splice(sIdx, 1);
                            setEditableConfig({ ...editableConfig, customSizes: sizes });
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Size Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={sz.label}
                          onChange={(e) => {
                            const sizes = [...editableConfig.customSizes];
                            sizes[sIdx].label = e.target.value;
                            setEditableConfig({ ...editableConfig, customSizes: sizes });
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Meter Usage</label>
                          <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            value={sz.meter}
                            onChange={(e) => {
                              const sizes = [...editableConfig.customSizes];
                              sizes[sIdx].meter = Number(e.target.value) || 0;
                              setEditableConfig({ ...editableConfig, customSizes: sizes });
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stitching (₹)</label>
                          <input
                            type="number"
                            step="1"
                            className="input-field"
                            value={sz.stitching}
                            onChange={(e) => {
                              const sizes = [...editableConfig.customSizes];
                              sizes[sIdx].stitching = Number(e.target.value) || 0;
                              setEditableConfig({ ...editableConfig, customSizes: sizes });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Packaging Types CRUD */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                    {editableConfig.packingFieldLabel || 'Packaging Options'} ({ (editableConfig.packingTypes || []).length })
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const packs = editableConfig.packingTypes || [];
                      const newPack = {
                        id: `pack_${Date.now().toString().slice(-4)}`,
                        label: `New Pack ${packs.length + 1}`,
                        type: 'fixed',
                        cost: 25
                      };
                      setEditableConfig({ ...editableConfig, packingTypes: [...packs, newPack] });
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Packaging</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  {(editableConfig.packingTypes || []).map((pack, pIdx) => (
                    <div
                      key={pack.id || pIdx}
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Pack #{pIdx + 1}</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '2px 6px' }}
                          onClick={() => {
                            const packs = [...editableConfig.packingTypes];
                            packs.splice(pIdx, 1);
                            setEditableConfig({ ...editableConfig, packingTypes: packs });
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pack Label</label>
                        <input
                          type="text"
                          className="input-field"
                          value={pack.label}
                          onChange={(e) => {
                            const packs = [...editableConfig.packingTypes];
                            packs[pIdx].label = e.target.value;
                            setEditableConfig({ ...editableConfig, packingTypes: packs });
                          }}
                        />
                      </div>

                      {pack.type === 'fixed' && (
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fixed Cost (₹)</label>
                          <input
                            type="number"
                            step="0.5"
                            className="input-field"
                            value={pack.cost}
                            onChange={(e) => {
                              const packs = [...editableConfig.packingTypes];
                              packs[pIdx].cost = Number(e.target.value) || 0;
                              setEditableConfig({ ...editableConfig, packingTypes: packs });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DYNAMIC FORMULA ENGINE TAB */}
      {adminTab === 'formula' && editableConfig && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-editorial)' }}>
                Calculation Formula Engine ({editableConfig.name})
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Customize the mathematical equation used to calculate product base cost and selling price.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFormula}
                style={{ color: 'var(--accent-coral)' }}
                title="Restore to (fabricCost + stitchingCost + packingCost) * overheadMultiplier"
              >
                <RotateCcw size={14} />
                <span>Reset to Standard Formula</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveConfig}
              >
                <Save size={14} />
                <span>Save Formula</span>
              </button>
            </div>
          </div>

          {/* Formula Expression Input */}
          <div style={{
            background: 'var(--bg-surface-soft)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-5)'
          }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Base Cost Formula Expression
            </label>
            <textarea
              className="formula-textarea font-mono"
              rows={3}
              placeholder="(fabricCost + stitchingCost + packingCost) * overheadMultiplier"
              value={editableConfig.customFormula ?? '(fabricCost + stitchingCost + packingCost) * overheadMultiplier'}
              onChange={(e) => setEditableConfig({ ...editableConfig, customFormula: e.target.value })}
            />

            {/* Variable Tokens helper */}
            <div style={{ marginTop: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Click variable chips to insert into formula:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['fabricCost', 'stitchingCost', 'packingCost', 'overheadMultiplier', 'totalMeter', 'pillowCount'].map(token => (
                  <button
                    key={token}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '3px 8px' }}
                    onClick={() => {
                      const curr = editableConfig.customFormula || '(fabricCost + stitchingCost + packingCost) * overheadMultiplier';
                      setEditableConfig({ ...editableConfig, customFormula: `${curr} + ${token}` });
                    }}
                  >
                    +{token}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.74rem', color: 'var(--accent-coral)', fontWeight: 600 }}
                  onClick={handleResetFormula}
                >
                  <RotateCcw size={12} style={{ marginRight: '4px' }} />
                  Reset Standard Formula
                </button>
              </div>
            </div>
          </div>

          {/* LIVE FORMULA TESTER */}
          <div style={{
            background: 'var(--bg-dark)',
            color: '#FFF',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="var(--accent-coral)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Formula Sandbox Evaluator
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.8rem',
                color: evaluatedFormulaTest !== null ? '#10B981' : '#EF4444'
              }}>
                {evaluatedFormulaTest !== null ? `₹ ${evaluatedFormulaTest.toFixed(2)}` : 'Formula Syntax Error'}
              </span>
            </div>

            {/* Test Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', display: 'block', marginBottom: '3px' }}>
                  fabricCost (₹)
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)' }}
                  value={testFormulaScope.fabricCost}
                  onChange={(e) => setTestFormulaScope({ ...testFormulaScope, fabricCost: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', display: 'block', marginBottom: '3px' }}>
                  stitchingCost (₹)
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)' }}
                  value={testFormulaScope.stitchingCost}
                  onChange={(e) => setTestFormulaScope({ ...testFormulaScope, stitchingCost: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', display: 'block', marginBottom: '3px' }}>
                  packingCost (₹)
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)' }}
                  value={testFormulaScope.packingCost}
                  onChange={(e) => setTestFormulaScope({ ...testFormulaScope, packingCost: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', display: 'block', marginBottom: '3px' }}>
                  overheadMultiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)' }}
                  value={testFormulaScope.overheadMultiplier}
                  onChange={(e) => setTestFormulaScope({ ...testFormulaScope, overheadMultiplier: Number(e.target.value) || 1.07 })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', display: 'block', marginBottom: '3px' }}>
                  totalMeter (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)' }}
                  value={testFormulaScope.totalMeter}
                  onChange={(e) => setTestFormulaScope({ ...testFormulaScope, totalMeter: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT CHANGE HISTORY LOG TAB (LAST 20 CHANGES) */}
      {adminTab === 'history' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-editorial)' }}>
                Audit Change History Log
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Chronological ledger of recent product edits, formula adjustments, and rate modifications.
              </p>
            </div>
            {historyLog && historyLog.length > 0 && (
              <span style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                background: 'var(--bg-surface-soft)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)'
              }}>
                Showing {historyLog.length} recent events
              </span>
            )}
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Product / Target</th>
                  <th>Action Type</th>
                  <th>Modification Details</th>
                  <th style={{ textAlign: 'right' }}>Rollback</th>
                </tr>
              </thead>
              <tbody>
                {historyLog && historyLog.length > 0 ? (
                  historyLog.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        {entry.adminId}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.target}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: entry.action.includes('Formula') ? 'var(--accent-indigo-light)' :
                                      entry.action.includes('Reset') || entry.action.includes('Rollback') ? 'var(--accent-amber-light)' :
                                      'var(--bg-surface-soft)',
                          color: entry.action.includes('Formula') ? 'var(--accent-indigo)' :
                                 entry.action.includes('Reset') || entry.action.includes('Rollback') ? 'var(--accent-amber)' :
                                 'var(--text-secondary)'
                        }}>
                          {entry.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {entry.details}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {entry.snapshot ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            onClick={() => handleRollback(entry)}
                            title="Restore configuration from this point"
                          >
                            <RotateCcw size={12} />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No rate change history recorded yet. Edits made to formulas, rates, or products will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USER MANAGEMENT TAB */}
      {adminTab === 'users' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px', width: '100%' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search user ID or name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingUserId(null);
                setUserFormData({ id: '', name: '', password: '', role: 'user', status: 'active' });
                setUserModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Add New User</span>
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID / Phone</th>
                  <th>Display Name</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{u.id}</td>
                    <td>{u.name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>••••••••</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: u.role === 'admin' ? 'var(--accent-coral-light)' : 'var(--bg-surface-soft)',
                        color: u.role === 'admin' ? 'var(--accent-coral)' : 'var(--text-secondary)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        color: u.status === 'active' ? '#10B981' : '#EF4444'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: u.status === 'active' ? '#10B981' : '#EF4444'
                        }} />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenEditUser(u)}
                        title="Edit User"
                        style={{ marginRight: '4px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      {u.id !== 'admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MARGIN TIERS TAB */}
      {adminTab === 'tiers' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-editorial)' }}>Wholesale & Dealer Multipliers</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Final Rate = ROUND(Base Cost with OH ÷ Multiplier)
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveTiers}
            >
              <Save size={14} />
              <span>Save Multipliers</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
            {editableTiers.map((t, idx) => (
              <div
                key={t.id}
                style={{
                  background: 'var(--bg-surface-soft)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.id}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{(t.value * 100).toFixed(0)}% Price</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Tier Description</label>
                  <input
                    type="text"
                    className="input-field"
                    value={t.description}
                    onChange={(e) => {
                      const updated = [...editableTiers];
                      updated[idx].description = e.target.value;
                      setEditableTiers(updated);
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Divisor Value (e.g. 0.95)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={t.value}
                    onChange={(e) => {
                      const updated = [...editableTiers];
                      const val = Number(e.target.value) || 1.0;
                      updated[idx].value = val;
                      updated[idx].multiplier = val;
                      setEditableTiers(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PRODUCT */}
      {newProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              type="button"
              onClick={() => setNewProductModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.7rem', marginBottom: '4px' }}>
              Create New Rate Calculator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Set up a new product with custom fabric rates, dimensions, and formula.
            </p>

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  Unique Product ID (slug) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. velvet500 or bamboo_cotton"
                  value={newProductData.id}
                  onChange={(e) => setNewProductData({ ...newProductData, id: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  Product Display Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Luxury Velvet 500 TC"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subtitle / Quality Note
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 500 Thread Count Premium Satin Finish"
                  value={newProductData.subtitle}
                  onChange={(e) => setNewProductData({ ...newProductData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    className="input-field"
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                  >
                    <option value="bedsheet">Bedsheet</option>
                    <option value="dohar">Dohar Quilt</option>
                    <option value="comforters">Comforter</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                    Clone Base Structure From
                  </label>
                  <select
                    className="input-field"
                    value={newProductData.cloneFromId}
                    onChange={(e) => setNewProductData({ ...newProductData, cloneFromId: e.target.value })}
                  >
                    {productIds.map(id => (
                      <option key={id} value={id}>{rates[id]?.name || id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setNewProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER CREATE / EDIT */}
      {userModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.7rem', marginBottom: '4px' }}>
              {editingUserId ? 'Edit User Credentials' : 'Create New User'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Assign ID/phone and password for calculator access.
            </p>

            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  User ID / Phone Number *
                </label>
                <input
                  type="text"
                  className="input-field"
                  disabled={!!editingUserId}
                  value={userFormData.id}
                  onChange={(e) => setUserFormData({ ...userFormData, id: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                    Role
                  </label>
                  <select
                    className="input-field"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    disabled={editingUserId === 'admin'}
                  >
                    <option value="user">User (Calculator Only)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    disabled={editingUserId === 'admin'}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
