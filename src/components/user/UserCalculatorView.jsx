import React, { useState, useMemo, useEffect } from 'react';
import { useRates } from '../../context/RatesContext';
import {
  calculateBedsheetRate,
  calculateDoharRate,
  calculateComforterRate,
  calculateFlipkartRate
} from '../../calculators/engines';
import {
  BED_SIZES_STANDARD,
  BED_SIZES_SOLID,
  BED_SIZES_SATINY90,
  BED_SIZES_MIXMATCH
} from '../../db/seedData';
import {
  Copy,
  Check,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  ShoppingBag,
  Package,
  TrendingUp
} from 'lucide-react';

export default function UserCalculatorView({ onNotify }) {
  const { rates, costTiers } = useRates();

  // Available products list from live rates
  const allProductKeys = useMemo(() => Object.keys(rates || {}), [rates]);

  // Bedsheets / Custom products list for subnav
  const bedsheetProducts = useMemo(() => {
    return allProductKeys
      .filter(key => rates[key]?.category === 'bedsheet' || (!['dohar', 'comforters', 'marketplace'].includes(rates[key]?.category)))
      .map(key => ({
        id: key,
        label: rates[key]?.name || key
      }));
  }, [allProductKeys, rates]);

  // Active Category: 'bedsheets' | 'dohar' | 'comforters' | 'marketplace'
  const [activeCategory, setActiveCategory] = useState('bedsheets');

  // Active Bedsheet / Custom product ID
  const [bedsheetId, setBedsheetId] = useState(() => bedsheetProducts[0]?.id || 'colors210');
  const [bedSizeId, setBedSizeId] = useState('90x108');
  const [bedColorId, setBedColorId] = useState('white');
  const [pillowCount, setPillowCount] = useState(2);
  const [packingId, setPackingId] = useState('ld');

  // Fallback if active bedsheet was deleted in admin
  useEffect(() => {
    if (bedsheetProducts.length > 0 && !rates[bedsheetId]) {
      setBedsheetId(bedsheetProducts[0].id);
    }
  }, [bedsheetProducts, rates, bedsheetId]);

  // Dohar state
  const [doharBrushing, setDoharBrushing] = useState('with'); // 'with' | 'without'
  const [doharFabric, setDoharFabric] = useState('allure'); // 'allure' | 'vbc'
  const [doharSize, setDoharSize] = useState('double'); // 'single' | 'double'
  const [doharPacking, setDoharPacking] = useState('std'); // 'std' | 'ld'

  // Comforters state
  const [comforterQuality, setComforterQuality] = useState('1'); // 1..12
  const [comforterGsm, setComforterGsm] = useState('200'); // 120, 150, 200, 300, 400
  const [comforterSize, setComforterSize] = useState('double'); // 'single' | 'double'
  const [comforterPacking, setComforterPacking] = useState('std'); // 'std' | 'ld'

  // Flipkart Marketplace state
  const [flipkartPurchasePrice, setFlipkartPurchasePrice] = useState(350);

  // Active Tier (applies across all calculators): default 'C2C'
  const [selectedTierId, setSelectedTierId] = useState('C2C');

  // Formula breakdown accordion state
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Selected Cost Tier Object
  const currentTier = useMemo(() => {
    return costTiers.find(t => t.id === selectedTierId) || costTiers[0] || { value: 1.0, label: 'C2C' };
  }, [costTiers, selectedTierId]);

  // Current Bedsheet Config & Sizes
  const currentBedsheetConfig = rates[bedsheetId] || rates.colors210;

  const currentBedSizes = useMemo(() => {
    if (!currentBedsheetConfig) return BED_SIZES_STANDARD;
    // If admin configured custom sizes for this product
    if (currentBedsheetConfig.customSizes && currentBedsheetConfig.customSizes.length > 0) {
      return currentBedsheetConfig.customSizes;
    }
    if (currentBedsheetConfig.sizeSet === 'solid') return BED_SIZES_SOLID;
    if (currentBedsheetConfig.sizeSet === 'satiny90') return BED_SIZES_SATINY90;
    if (currentBedsheetConfig.sizeSet === 'mixMatch') return BED_SIZES_MIXMATCH;
    return BED_SIZES_STANDARD;
  }, [currentBedsheetConfig]);

  // Calculations for Bedsheets
  const bedsheetCalculation = useMemo(() => {
    if (activeCategory !== 'bedsheets' || !currentBedsheetConfig) return null;

    const sizeObj = currentBedSizes.find(s => s.id === bedSizeId) || currentBedSizes[0];
    const colorsList = currentBedsheetConfig.colors || currentBedsheetConfig.collections || [];
    const colorObj = colorsList.find(c => c.id === bedColorId) || colorsList[0];
    const packObj = currentBedsheetConfig.packingTypes?.find(p => p.id === packingId) || currentBedsheetConfig.packingTypes?.[0];

    return calculateBedsheetRate({
      config: currentBedsheetConfig,
      sizeObj,
      colorOrCollectionObj: colorObj,
      pillowCount,
      packingObj: packObj,
      tierMultiplier: currentTier.value
    });
  }, [activeCategory, currentBedsheetConfig, currentBedSizes, bedSizeId, bedColorId, pillowCount, packingId, currentTier]);

  // Calculations for Dohar
  const doharCalculation = useMemo(() => {
    if (activeCategory !== 'dohar' || !rates.dohar) return null;
    return calculateDoharRate({
      config: rates.dohar,
      brushingChoice: doharBrushing,
      fabricChoice: doharFabric,
      sizeChoice: doharSize,
      packingChoice: doharPacking,
      tierMultiplier: currentTier.value
    });
  }, [activeCategory, rates.dohar, doharBrushing, doharFabric, doharSize, doharPacking, currentTier]);

  // Calculations for Comforters
  const comforterCalculation = useMemo(() => {
    if (activeCategory !== 'comforters' || !rates.comforters) return null;
    return calculateComforterRate({
      config: rates.comforters,
      qualityId: comforterQuality,
      gsm: comforterGsm,
      sizeChoice: comforterSize,
      packingChoice: comforterPacking,
      tierMultiplier: currentTier.value
    });
  }, [activeCategory, rates.comforters, comforterQuality, comforterGsm, comforterSize, comforterPacking, currentTier]);

  // Calculations for Flipkart
  const flipkartCalculation = useMemo(() => {
    if (activeCategory !== 'marketplace' || !rates.flipkart) return null;
    return calculateFlipkartRate({
      config: rates.flipkart,
      purchasePrice: flipkartPurchasePrice
    });
  }, [activeCategory, rates.flipkart, flipkartPurchasePrice]);

  // Unified Active Calculation for the hero card
  const activeCalc = useMemo(() => {
    if (activeCategory === 'bedsheets') return bedsheetCalculation;
    if (activeCategory === 'dohar') return doharCalculation;
    if (activeCategory === 'comforters') return comforterCalculation;
    if (activeCategory === 'marketplace') return flipkartCalculation;
    return null;
  }, [activeCategory, bedsheetCalculation, doharCalculation, comforterCalculation, flipkartCalculation]);

  // Calculate prices across all 6 tiers for the comparison matrix
  const tierComparisonPrices = useMemo(() => {
    if (activeCategory === 'marketplace') return null;

    return costTiers.map(tier => {
      let price = 0;
      if (activeCategory === 'bedsheets' && currentBedsheetConfig) {
        const sizeObj = currentBedSizes.find(s => s.id === bedSizeId) || currentBedSizes[0];
        const colorsList = currentBedsheetConfig.colors || currentBedsheetConfig.collections || [];
        const colorObj = colorsList.find(c => c.id === bedColorId) || colorsList[0];
        const packObj = currentBedsheetConfig.packingTypes?.find(p => p.id === packingId) || currentBedsheetConfig.packingTypes?.[0];
        const res = calculateBedsheetRate({
          config: currentBedsheetConfig,
          sizeObj,
          colorOrCollectionObj: colorObj,
          pillowCount,
          packingObj: packObj,
          tierMultiplier: tier.value
        });
        price = res.finalPrice;
      } else if (activeCategory === 'dohar' && rates.dohar) {
        const res = calculateDoharRate({
          config: rates.dohar,
          brushingChoice: doharBrushing,
          fabricChoice: doharFabric,
          sizeChoice: doharSize,
          packingChoice: doharPacking,
          tierMultiplier: tier.value
        });
        price = res.finalPrice;
      } else if (activeCategory === 'comforters' && rates.comforters) {
        const res = calculateComforterRate({
          config: rates.comforters,
          qualityId: comforterQuality,
          gsm: comforterGsm,
          sizeChoice: comforterSize,
          packingChoice: comforterPacking,
          tierMultiplier: tier.value
        });
        price = res.finalPrice;
      }

      return {
        ...tier,
        price
      };
    });
  }, [
    activeCategory,
    costTiers,
    currentBedsheetConfig,
    currentBedSizes,
    bedSizeId,
    bedColorId,
    pillowCount,
    packingId,
    rates.dohar,
    doharBrushing,
    doharFabric,
    doharSize,
    doharPacking,
    rates.comforters,
    comforterQuality,
    comforterGsm,
    comforterSize,
    comforterPacking
  ]);

  // Generate Quotation Summary for Copying
  const generateSpecText = () => {
    let text = `CALC//CORE QUOTATION\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;

    if (activeCategory === 'bedsheets') {
      const colorsList = currentBedsheetConfig.colors || currentBedsheetConfig.collections || [];
      const colorObj = colorsList.find(c => c.id === bedColorId) || colorsList[0];
      const sizeObj = currentBedSizes.find(s => s.id === bedSizeId) || currentBedSizes[0];
      const packObj = currentBedsheetConfig.packingTypes?.find(p => p.id === packingId) || currentBedsheetConfig.packingTypes?.[0];

      text += `Product: ${currentBedsheetConfig.name}\n`;
      text += `Option/Color: ${colorObj?.label || 'Standard'}\n`;
      text += `Bedsheet Size: ${sizeObj?.label}\n`;
      text += `Pillows: ${pillowCount} pcs (${bedsheetCalculation?.pillowMeter}m)\n`;
      text += `Total Meterage: ${bedsheetCalculation?.totalMeter}m\n`;
      text += `Packing: ${packObj?.label}\n`;
      text += `Selected Tier: ${currentTier.id} (${(currentTier.multiplier * 100).toFixed(0)}%)\n`;
      text += `--------------------------------\n`;
      text += `Final Rate: ₹ ${bedsheetCalculation?.finalPrice}/pc\n`;
    } else if (activeCategory === 'dohar') {
      text += `Product: Dohar Quilt\n`;
      text += `Fabric: ${doharFabric === 'allure' ? 'Allure' : 'Value Boutique (VBC)'}\n`;
      text += `Brushing: ${doharBrushing === 'with' ? 'With Brushing' : 'Without Brushing'}\n`;
      text += `Size: ${doharSize === 'double' ? 'Double' : 'Single'}\n`;
      text += `Packing: ${doharPacking === 'std' ? 'Standard' : 'LD'}\n`;
      text += `Tier: ${currentTier.id}\n`;
      text += `--------------------------------\n`;
      text += `Final Rate: ₹ ${doharCalculation?.finalPrice}/pc\n`;
    } else if (activeCategory === 'comforters') {
      const q = rates.comforters?.qualities?.find(item => item.id === String(comforterQuality));
      text += `Product: Comforter\n`;
      text += `Quality: ${q?.label}\n`;
      text += `Density: ${comforterGsm} GSM\n`;
      text += `Size: ${comforterSize === 'double' ? 'Double' : 'Single'}\n`;
      text += `Packing: ${comforterPacking === 'std' ? 'Standard Bag' : 'LD'}\n`;
      text += `Tier: ${currentTier.id}\n`;
      text += `--------------------------------\n`;
      text += `Final Rate: ₹ ${comforterCalculation?.finalPrice}/pc\n`;
    } else if (activeCategory === 'marketplace') {
      text += `Platform: Flipkart Marketplace\n`;
      text += `Purchase Price: ₹ ${flipkartCalculation?.purchasePrice}\n`;
      text += `Fixed Fee: ₹ ${flipkartCalculation?.fixedFee}\n`;
      text += `Shipping (Flat): ₹ ${flipkartCalculation?.shipping}\n`;
      text += `Commission (7%): ₹ ${flipkartCalculation?.commission}\n`;
      text += `Collection Fee (2%): ₹ ${flipkartCalculation?.collectionFee}\n`;
      text += `Return Safety (7%): ₹ ${flipkartCalculation?.returnSafety}\n`;
      text += `Advertisement (10%): ₹ ${flipkartCalculation?.advertisement}\n`;
      text += `--------------------------------\n`;
      text += `Selling Price (Incl. GST): ₹ ${flipkartCalculation?.sellingPriceInclGST}\n`;
      text += `Selling Price (Excl. GST): ₹ ${flipkartCalculation?.sellingPriceExclGST}\n`;
    }

    return text;
  };

  const handleCopy = () => {
    const text = generateSpecText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify?.("Quotation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Bedsheet Collections list for the subnav
  const bedsheetKeys = [
    { id: 'colors210', label: 'Colors 210' },
    { id: 'solid210', label: 'Solid 210' },
    { id: 'colors300', label: 'Colors 300' },
    { id: 'solid300', label: 'Solid 300' },
    { id: 'solid400', label: 'Solid 400' },
    { id: 'stripe400', label: 'Stripe 400' },
    { id: 'otherCollection', label: 'Other Collections' },
    { id: 'satiny90', label: 'Satiny 90"' },
    { id: 'mixMatch', label: 'Mix & Match' }
  ];

  return (
    <div className="workspace-grid">
      {/* LEFT COLUMN: Controls & Interactive Selectors */}
      <div className="panel-card">
        {/* Category Selector Scroller */}
        <div className="category-scroller">
          <button
            type="button"
            className={`category-chip ${activeCategory === 'bedsheets' ? 'active' : ''}`}
            onClick={() => setActiveCategory('bedsheets')}
          >
            <Layers size={14} />
            <span>Bedsheets & Custom ({bedsheetProducts.length})</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'dohar' ? 'active' : ''}`}
            onClick={() => setActiveCategory('dohar')}
          >
            <Sparkles size={14} />
            <span>Dohar Quilts</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'comforters' ? 'active' : ''}`}
            onClick={() => setActiveCategory('comforters')}
          >
            <Package size={14} />
            <span>Comforters</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveCategory('marketplace')}
          >
            <ShoppingBag size={14} />
            <span>Flipkart Marketplace</span>
          </button>
        </div>

        {/* 1. BED-SHEET & CUSTOM PRODUCT CONTROLS */}
        {activeCategory === 'bedsheets' && currentBedsheetConfig && (
          <div>
            {/* Dynamic Subnav for Bedsheet / Custom products */}
            <div className="calculator-subnav">
              {bedsheetProducts.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`subnav-btn ${bedsheetId === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setBedsheetId(item.id);
                    const newConfig = rates[item.id];
                    const colors = newConfig?.colors || newConfig?.collections || [];
                    if (colors[0]) setBedColorId(colors[0].id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="panel-header" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="panel-title">
                <h2>{currentBedsheetConfig.name}</h2>
                <p>{currentBedsheetConfig.subtitle}</p>
              </div>
            </div>

            {/* Color / Fabric / Collection Pills (Using Dynamic Label) */}
            <div className="control-section">
              <div className="control-label">
                <span>{currentBedsheetConfig.colorFieldLabel || 'Color / Variety'}</span>
                <span className="control-hint">Select option</span>
              </div>
              <div className="pill-grid">
                {(currentBedsheetConfig.colors || currentBedsheetConfig.collections || []).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill-item ${bedColorId === item.id ? 'active' : ''}`}
                    onClick={() => setBedColorId(item.id)}
                  >
                    <span className="pill-item-title">{item.label}</span>
                    <span className="pill-item-meta">₹ {item.rate}/meter</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bedsheet Size Pills (Using Dynamic Label) */}
            <div className="control-section">
              <div className="control-label">
                <span>{currentBedsheetConfig.sizeFieldLabel || 'Bedsheet Size'}</span>
                <span className="control-hint">Meter usage</span>
              </div>
              <div className="pill-grid">
                {currentBedSizes.map(size => (
                  <button
                    key={size.id}
                    type="button"
                    className={`pill-item ${bedSizeId === size.id ? 'active' : ''}`}
                    onClick={() => setBedSizeId(size.id)}
                  >
                    <span className="pill-item-title">{size.label}</span>
                    <span className="pill-item-meta">
                      {size.meter > 0 ? `${size.meter}m · Stitch ₹${size.stitching}` : 'None'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pillow Stepper (Using Dynamic Label) */}
            <div className="control-section">
              <div className="control-label">
                <span>{currentBedsheetConfig.pillowFieldLabel || 'Pillow Quantity'}</span>
                <span className="control-hint">0 to 12 pieces</span>
              </div>
              <div className="stepper-container">
                <div className="stepper-info">
                  <span className="stepper-title">{pillowCount} {pillowCount === 1 ? 'Unit' : 'Units'}</span>
                  <span className="stepper-subtitle">
                    {bedsheetCalculation ? `${bedsheetCalculation.pillowMeter}m cloth · ₹${bedsheetCalculation.pillowStitching} stitching` : ''}
                  </span>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setPillowCount(Math.max(0, pillowCount - 1))}
                    disabled={pillowCount <= 0}
                  >
                    -
                  </button>
                  <span className="stepper-value">{pillowCount}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setPillowCount(Math.min(12, pillowCount + 1))}
                    disabled={pillowCount >= 12}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Packing Type Pills (Using Dynamic Label) */}
            <div className="control-section">
              <div className="control-label">
                <span>{currentBedsheetConfig.packingFieldLabel || 'Packaging Type'}</span>
                <span className="control-hint">Cost per piece</span>
              </div>
              <div className="pill-grid">
                {(currentBedsheetConfig.packingTypes || []).map(pack => {
                  let costStr = 'Calc';
                  if (pack.type === 'fixed') costStr = `₹ ${pack.cost}`;
                  else if (pack.type === 'perPillow') costStr = `₹ ${(pillowCount * (pack.multiplier || 0.46)).toFixed(1)}`;
                  else if (pack.type === 'collectionStdPacking') {
                    const colorsList = currentBedsheetConfig.colors || currentBedsheetConfig.collections || [];
                    const activeCol = colorsList.find(c => c.id === bedColorId);
                    costStr = `₹ ${activeCol?.stdPackingCost || 36}`;
                  }

                  return (
                    <button
                      key={pack.id}
                      type="button"
                      className={`pill-item ${packingId === pack.id ? 'active' : ''}`}
                      onClick={() => setPackingId(pack.id)}
                    >
                      <span className="pill-item-title">{pack.label}</span>
                      <span className="pill-item-meta">{costStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. DOHAR SPECIFIC CONTROLS */}
        {activeCategory === 'dohar' && (
          <div>
            <div className="panel-header">
              <div className="panel-title">
                <h2>Dohar Layered Quilt</h2>
                <p>Pure Cotton & Flannel Brushing Calculations</p>
              </div>
            </div>

            {/* Brushing Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Brushing Choice</span>
                <span className="control-hint">Finish type</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${doharBrushing === 'with' ? 'active' : ''}`}
                  onClick={() => setDoharBrushing('with')}
                >
                  <span className="pill-item-title">With Brushing</span>
                  <span className="pill-item-meta">Flannel warm soft touch</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${doharBrushing === 'without' ? 'active' : ''}`}
                  onClick={() => setDoharBrushing('without')}
                >
                  <span className="pill-item-title">Without Brushing</span>
                  <span className="pill-item-meta">Standard flat weave</span>
                </button>
              </div>
            </div>

            {/* Fabric Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Fabric Choice</span>
                <span className="control-hint">Meters & rate</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${doharFabric === 'allure' ? 'active' : ''}`}
                  onClick={() => setDoharFabric('allure')}
                >
                  <span className="pill-item-title">Allure</span>
                  <span className="pill-item-meta">₹ {rates.dohar?.rates?.allureMeterRate || 125}/meter</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${doharFabric === 'vbc' ? 'active' : ''}`}
                  onClick={() => setDoharFabric('vbc')}
                >
                  <span className="pill-item-title">Value Boutique (VBC)</span>
                  <span className="pill-item-meta">₹ {rates.dohar?.rates?.vbcMeterRate || 218}/meter</span>
                </button>
              </div>
            </div>

            {/* Size Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Dohar Size</span>
                <span className="control-hint">Fabric consumption</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${doharSize === 'single' ? 'active' : ''}`}
                  onClick={() => setDoharSize('single')}
                >
                  <span className="pill-item-title">Single</span>
                  <span className="pill-item-meta">{doharFabric === 'allure' ? '3.29m' : '2.65m'}</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${doharSize === 'double' ? 'active' : ''}`}
                  onClick={() => setDoharSize('double')}
                >
                  <span className="pill-item-title">Double</span>
                  <span className="pill-item-meta">{doharFabric === 'allure' ? '5.23m' : '4.29m'}</span>
                </button>
              </div>
            </div>

            {/* Packing Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Packing Choice</span>
                <span className="control-hint">Protective bag</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${doharPacking === 'std' ? 'active' : ''}`}
                  onClick={() => setDoharPacking('std')}
                >
                  <span className="pill-item-title">Standard Packing</span>
                  <span className="pill-item-meta">Custom bag</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${doharPacking === 'ld' ? 'active' : ''}`}
                  onClick={() => setDoharPacking('ld')}
                >
                  <span className="pill-item-title">LD Packing</span>
                  <span className="pill-item-meta">₹ {rates.dohar?.packingRates?.ldCost || 10}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. COMFORTERS SPECIFIC CONTROLS */}
        {activeCategory === 'comforters' && rates.comforters && (
          <div>
            <div className="panel-header">
              <div className="panel-title">
                <h2>Microfiber Comforters</h2>
                <p>Calculations with GSM Density & Polyfill Core</p>
              </div>
            </div>

            {/* Fabric Quality Pills */}
            <div className="control-section">
              <div className="control-label">
                <span>Fabric Quality</span>
                <span className="control-hint">12 Outer Shell Options</span>
              </div>
              <div className="pill-grid">
                {(rates.comforters.qualities || []).map(q => (
                  <button
                    key={q.id}
                    type="button"
                    className={`pill-item ${comforterQuality === q.id ? 'active' : ''}`}
                    onClick={() => setComforterQuality(q.id)}
                  >
                    <span className="pill-item-title">{q.label}</span>
                    <span className="pill-item-meta">₹ {q.rate}/m</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GSM Pills */}
            <div className="control-section">
              <div className="control-label">
                <span>Polyfill GSM</span>
                <span className="control-hint">Thickness / Weight</span>
              </div>
              <div className="pill-grid">
                {(rates.comforters.gsmRates || []).map(g => (
                  <button
                    key={g.gsm}
                    type="button"
                    className={`pill-item ${comforterGsm === g.gsm ? 'active' : ''}`}
                    onClick={() => setComforterGsm(g.gsm)}
                  >
                    <span className="pill-item-title">{g.label}</span>
                    <span className="pill-item-meta">Rate ₹ {g.rate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Size</span>
                <span className="control-hint">Single or Double</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${comforterSize === 'single' ? 'active' : ''}`}
                  onClick={() => setComforterSize('single')}
                >
                  <span className="pill-item-title">Single</span>
                  <span className="pill-item-meta">Stitch ₹{rates.comforters.stitchingCost?.single}</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${comforterSize === 'double' ? 'active' : ''}`}
                  onClick={() => setComforterSize('double')}
                >
                  <span className="pill-item-title">Double</span>
                  <span className="pill-item-meta">Stitch ₹{rates.comforters.stitchingCost?.double}</span>
                </button>
              </div>
            </div>

            {/* Packing Choice */}
            <div className="control-section">
              <div className="control-label">
                <span>Packing</span>
                <span className="control-hint">Standard / LD</span>
              </div>
              <div className="pill-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`pill-item ${comforterPacking === 'std' ? 'active' : ''}`}
                  onClick={() => setComforterPacking('std')}
                >
                  <span className="pill-item-title">Standard Bag</span>
                  <span className="pill-item-meta">Zipper Bag</span>
                </button>
                <button
                  type="button"
                  className={`pill-item ${comforterPacking === 'ld' ? 'active' : ''}`}
                  onClick={() => setComforterPacking('ld')}
                >
                  <span className="pill-item-title">LD Packing</span>
                  <span className="pill-item-meta">₹ {rates.comforters.packingRates?.ldCost || 10}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. FLIPKART MARKETPLACE SPECIFIC CONTROLS */}
        {activeCategory === 'marketplace' && rates.flipkart && (
          <div>
            <div className="panel-header">
              <div className="panel-title">
                <h2>Flipkart Price Calculator</h2>
                <p>Reverse Selling Price calculation including platform deductions & GST</p>
              </div>
            </div>

            <div className="control-section">
              <div className="control-label">
                <span>Enter Purchase / Manufacturing Cost (₹)</span>
                <span className="control-hint">Base item cost</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                className="input-numeric-hero"
                value={flipkartPurchasePrice}
                onChange={(e) => setFlipkartPurchasePrice(Number(e.target.value) || 0)}
              />
            </div>

            {/* Instant Marketplace Fee Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)'
            }}>
              <div style={{
                background: 'var(--bg-surface-soft)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>
                  Fixed Fee Bracket
                </span>
                <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                  ₹ {flipkartCalculation?.fixedFee}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                  {flipkartPurchasePrice <= 249 ? 'Tier 1 (<= ₹249)' : flipkartPurchasePrice <= 567 ? 'Tier 2 (<= ₹567)' : 'Tier 3 (>= ₹568)'}
                </span>
              </div>

              <div style={{
                background: 'var(--bg-surface-soft)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>
                  Flat Shipping
                </span>
                <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                  ₹ {flipkartCalculation?.shipping}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                  Standard tier logistics
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Hero Calculated Output, Breakdown Visualizer & Tier Matrix */}
      <div>
        {/* HERO PRICE CARD */}
        <div className="hero-price-card">
          <div className="hero-card-header">
            <span className="hero-tag">
              {activeCategory === 'marketplace' ? 'Recommended Selling Price' : 'Wholesale Rate'}
            </span>
            {activeCategory !== 'marketplace' && (
              <span className="hero-active-tier">
                {currentTier.id} · {(currentTier.multiplier * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="hero-price-display">
            <span className="hero-currency">₹</span>
            <span className="hero-amount">
              {activeCategory === 'marketplace'
                ? flipkartCalculation?.sellingPriceInclGST?.toLocaleString()
                : activeCalc?.finalPrice?.toLocaleString() || 0}
            </span>
            <span className="hero-unit">
              {activeCategory === 'marketplace' ? 'Incl. GST' : '/ unit'}
            </span>
          </div>

          {/* Quick Specification summary text */}
          <div className="hero-spec-summary">
            {activeCategory === 'bedsheets' && (
              <span>
                {currentBedsheetConfig?.name} · {currentBedSizes.find(s => s.id === bedSizeId)?.label} · {pillowCount} Pillows
              </span>
            )}
            {activeCategory === 'dohar' && (
              <span>
                Dohar Quilt ({doharSize === 'double' ? 'Double' : 'Single'}) · {doharFabric === 'allure' ? 'Allure' : 'VBC'} · {doharBrushing === 'with' ? 'Brushed' : 'Unbrushed'}
              </span>
            )}
            {activeCategory === 'comforters' && (
              <span>
                Comforter ({comforterSize === 'double' ? 'Double' : 'Single'}) · {comforterGsm} GSM Polyfill · {rates.comforters?.qualities?.find(q => q.id === comforterQuality)?.label}
              </span>
            )}
            {activeCategory === 'marketplace' && (
              <span>
                Selling Price (Excl. GST): <strong>₹ {flipkartCalculation?.sellingPriceExclGST}</strong> · Est. Deductions ₹ {flipkartCalculation?.totalDeductions}
              </span>
            )}
          </div>

          {/* REAL-TIME COST COMPOSITION VISUALIZER (STACKED BAR) */}
          {activeCalc && activeCalc.breakdown && (
            <div className="visualizer-card">
              <div className="visualizer-label">
                <span>Cost Composition</span>
                <span>
                  Base: ₹ {activeCategory === 'marketplace' ? activeCalc.purchasePrice : activeCalc.subtotal}
                </span>
              </div>

              {/* Stacked Colored Bar */}
              <div className="stacked-bar-container">
                {(() => {
                  const total = activeCalc.breakdown.reduce((acc, item) => acc + item.value, 0) || 1;
                  return activeCalc.breakdown.map((item, idx) => {
                    const pct = Math.max(2, (item.value / total) * 100);
                    return (
                      <div
                        key={idx}
                        className="stacked-bar-segment"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.color,
                          marginRight: '2px'
                        }}
                        title={`${item.label}: ₹${item.value} (${pct.toFixed(0)}%)`}
                      />
                    );
                  });
                })()}
              </div>

              {/* Legend Grid */}
              <div className="breakdown-legend">
                {activeCalc.breakdown.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-label-wrap">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <span>{item.label}</span>
                    </div>
                    <span className="legend-value">₹ {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="action-toolbar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-sm)' }}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Spec & Quotation'}</span>
            </button>
          </div>
        </div>

        {/* TIER MARGIN MATRIX (Side-by-side comparison for C2C, PLR, GLR, SLR, BLR, WLR) */}
        {activeCategory !== 'marketplace' && tierComparisonPrices && (
          <div className="tier-matrix-section">
            <div className="tier-matrix-title">
              <span>Tier Rates Matrix</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'none', fontWeight: 500 }}>
                Click card to select tier
              </span>
            </div>

            <div className="tier-grid">
              {tierComparisonPrices.map(tier => (
                <div
                  key={tier.id}
                  className={`tier-card ${selectedTierId === tier.id ? 'active' : ''}`}
                  onClick={() => setSelectedTierId(tier.id)}
                >
                  <div className="tier-code">{tier.id}</div>
                  <div className="tier-rate-figure">₹{tier.price}</div>
                  <div className="tier-mult">{(tier.multiplier * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORMULA TRANSPARENCY ACCORDION */}
        <div style={{
          marginTop: 'var(--space-4)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} />
              <span>Exact Calculation Breakdown</span>
            </div>
            {showFormulaDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFormulaDetails && (
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-surface-soft)'
            }}>
              {activeCategory === 'bedsheets' && bedsheetCalculation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                  <div>1. Total Meter = Bedsheet ({bedsheetCalculation.bedsheetMeter}m) + Pillows ({bedsheetCalculation.pillowMeter}m) = <strong>{bedsheetCalculation.totalMeter}m</strong></div>
                  <div>2. Fabric Cost = Total Meter × Rate = <strong>₹ {bedsheetCalculation.fabricCost}</strong></div>
                  <div>3. Stitching Total = Bedsheet (₹{bedsheetCalculation.bedsheetStitching}) + Pillows (₹{bedsheetCalculation.pillowStitching}) = <strong>₹ {bedsheetCalculation.stitchingTotal}</strong></div>
                  <div>4. Packing Cost = <strong>₹ {bedsheetCalculation.packingCost}</strong></div>
                  <div>5. Subtotal = Fabric + Stitching + Packing = <strong>₹ {bedsheetCalculation.subtotal}</strong></div>
                  <div>6. Overhead (7%) = <strong>₹ {bedsheetCalculation.overheadAmount}</strong> (Formula Total: ₹{bedsheetCalculation.formulaTotal})</div>
                  <div>7. Final Cost = ROUND(Formula Total ÷ Tier Multiplier ({currentTier.value})) = <strong style={{ color: 'var(--accent-coral)' }}>₹ {bedsheetCalculation.finalPrice}</strong></div>
                </div>
              )}

              {activeCategory === 'dohar' && doharCalculation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                  <div>1. Fabric Cost = <strong>₹ {doharCalculation.fabricCost}</strong></div>
                  <div>2. Doori Cost = <strong>₹ {doharCalculation.dooriCost}</strong></div>
                  <div>3. Piping Fabric Cost = <strong>₹ {doharCalculation.pipingCost}</strong></div>
                  <div>4. Brushing Cost = <strong>₹ {doharCalculation.brushingCost}</strong></div>
                  <div>5. Stitching Cost = <strong>₹ {doharCalculation.stitchingCost}</strong></div>
                  <div>6. Packing Cost = <strong>₹ {doharCalculation.packingCost}</strong></div>
                  <div>7. Overhead (7%) = <strong>₹ {doharCalculation.overheadAmount}</strong></div>
                  <div>8. Final Price = ROUND(Total ÷ {currentTier.value}) = <strong style={{ color: 'var(--accent-coral)' }}>₹ {doharCalculation.finalPrice}</strong></div>
                </div>
              )}

              {activeCategory === 'comforters' && comforterCalculation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                  <div>1. Fabric Shell Cost = <strong>₹ {comforterCalculation.fabricCost}</strong></div>
                  <div>2. Polyfill Fiber Cost = <strong>₹ {comforterCalculation.polyfillCost}</strong></div>
                  <div>3. Non-Woven Cost = <strong>₹ {comforterCalculation.nonWovenCost}</strong></div>
                  <div>4. Stitching Cost = <strong>₹ {comforterCalculation.stitchingCost}</strong></div>
                  <div>5. Packing Bag Cost = <strong>₹ {comforterCalculation.packingCost}</strong></div>
                  <div>6. 7% Overhead Added = <strong>₹ {comforterCalculation.overheadAmount}</strong></div>
                  <div>7. Final Tier Price = ROUND(Total ÷ {currentTier.value}) = <strong style={{ color: 'var(--accent-coral)' }}>₹ {comforterCalculation.finalPrice}</strong></div>
                </div>
              )}

              {activeCategory === 'marketplace' && flipkartCalculation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                  <div>1. Fixed Fee Bracket = <strong>₹ {flipkartCalculation.fixedFee}</strong></div>
                  <div>2. Selling Price (Incl. GST) = ROUND((Purchase({flipkartCalculation.purchasePrice}) + 101 + FixedFee({flipkartCalculation.fixedFee})) ÷ 0.692) = <strong style={{ color: 'var(--accent-coral)' }}>₹ {flipkartCalculation.sellingPriceInclGST}</strong></div>
                  <div>3. Selling Price (Excl. GST) = (20 × SellingPrice) ÷ 21 = <strong>₹ {flipkartCalculation.sellingPriceExclGST}</strong></div>
                  <div>4. Commission (7%) = ₹{flipkartCalculation.commission} · Collection Fee (2%) = ₹{flipkartCalculation.collectionFee}</div>
                  <div>5. Return Safety (7%) = ₹{flipkartCalculation.returnSafety} · Ads (10%) = ₹{flipkartCalculation.advertisement}</div>
                  <div>6. Shipping Logistics = ₹{flipkartCalculation.shipping} (Flat)</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
