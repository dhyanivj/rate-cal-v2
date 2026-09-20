/**
 * Mathematical Calculation Engines for all 12 Rate Calculators
 * Accurately replicates the WordPress Calculated Fields Form equations.
 */

/**
 * Safe Mathematical Expression Evaluator for Admin Custom Formulas
 * Allowed operators: +, -, *, /, (, ), decimals, numbers, and scope variables.
 */
export function evaluateCustomFormula(expression, scope = {}) {
  if (!expression || typeof expression !== 'string') return null;

  try {
    // Inject defaults for all known variables to prevent missing variable errors
    const fullScope = {
      fabricCost: 0,
      stitchingCost: 0,
      stitchingTotal: 0,
      packingCost: 0,
      overheadMultiplier: 1.07,
      subtotal: 0,
      bedsheetMeter: 2.35,
      pillowMeter: 0.72,
      totalMeter: 3.07,
      pillowCount: 2,
      ...scope
    };

    // If subtotal wasn't provided, calculate default sum
    if (fullScope.subtotal === 0) {
      fullScope.subtotal = fullScope.fabricCost + fullScope.stitchingCost + fullScope.packingCost;
    }

    // Replace variable identifiers with their numerical values from scope
    // Sorted by key length descending to prevent substring collisions
    let sanitized = expression;
    const keys = Object.keys(fullScope).sort((a, b) => b.length - a.length);

    for (const key of keys) {
      const val = Number(fullScope[key] ?? 0);
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      sanitized = sanitized.replace(regex, `(${val})`);
    }

    // Safety check: ensure only valid mathematical characters remain
    if (!/^[\d\s+\-*/().%]+$/.test(sanitized)) {
      console.warn("Invalid characters in formula expression:", sanitized);
      return null;
    }

    // Evaluate using Function constructor in clean scope
    const fn = new Function(`return (${sanitized});`);
    const result = fn();
    return (typeof result === 'number' && !isNaN(result) && isFinite(result)) ? result : null;
  } catch (err) {
    console.warn("Error evaluating custom formula:", err);
    return null;
  }
}

/**
 * 1. BED-SHEET ENGINE (Colors 210, Solid 210, Colors 300, Solid 300, Solid 400, Stripe 400, Other Collections, Satiny 90, Mix & Match & Custom Products)
 */
export function calculateBedsheetRate({
  config,
  sizeObj,
  colorOrCollectionObj,
  pillowCount = 0,
  packingObj,
  tierMultiplier = 1.0
}) {
  const bedsheetMeter = sizeObj ? Number(sizeObj.meter || 0) : 0;
  const bedsheetStitching = sizeObj ? Number(sizeObj.stitching || 0) : 0;

  const pillowMeterPerUnit = Number(config.pillowMeterPerUnit || 0.36);
  const pillowStitchingPerUnit = Number(config.pillowStitchingPerUnit || 15);
  const pillowCountNum = Number(pillowCount || 0);

  const pillowMeter = pillowCountNum * pillowMeterPerUnit;
  const pillowStitching = pillowCountNum * pillowStitchingPerUnit;

  let fabricCost = 0;
  // If Mix & Match, pillow fabric has its own rate
  if (config.id === 'mixMatch' && colorOrCollectionObj?.pillowRate) {
    const bedFabricRate = Number(colorOrCollectionObj.rate || 0);
    const pillowFabricRate = Number(colorOrCollectionObj.pillowRate || 0);
    fabricCost = (bedsheetMeter * bedFabricRate) + (pillowMeter * pillowFabricRate);
  } else {
    const fabricRate = Number(colorOrCollectionObj?.rate || 0);
    fabricCost = (bedsheetMeter + pillowMeter) * fabricRate;
  }

  const stitchingTotal = bedsheetStitching + pillowStitching;

  // Packing cost calculation
  let packingCost = 0;
  if (packingObj) {
    if (packingObj.type === 'fixed') {
      packingCost = Number(packingObj.cost || 0);
    } else if (packingObj.type === 'perPillow') {
      packingCost = pillowCountNum * Number(packingObj.multiplier || 0.46);
    } else if (packingObj.type === 'collectionStdPacking') {
      packingCost = Number(colorOrCollectionObj?.stdPackingCost || 36);
    }
  }

  const subtotal = fabricCost + stitchingTotal + packingCost;
  const overheadMultiplier = Number(config.overheadMultiplier || 1.07);

  // Dynamic Custom Formula Evaluation (if admin specified one)
  let formulaTotal;
  if (config.customFormula && config.customFormula.trim()) {
    const scope = {
      fabricCost,
      stitchingTotal,
      stitchingCost: stitchingTotal,
      packingCost,
      overheadMultiplier,
      subtotal,
      bedsheetMeter,
      pillowMeter,
      totalMeter: bedsheetMeter + pillowMeter,
      pillowCount: pillowCountNum
    };
    const customResult = evaluateCustomFormula(config.customFormula, scope);
    formulaTotal = customResult !== null ? customResult : (subtotal * overheadMultiplier);
  } else {
    formulaTotal = subtotal * overheadMultiplier;
  }

  const finalPrice = Math.round(formulaTotal / (Number(tierMultiplier) || 1.0));

  return {
    bedsheetMeter: Number(bedsheetMeter.toFixed(3)),
    pillowMeter: Number(pillowMeter.toFixed(3)),
    totalMeter: Number((bedsheetMeter + pillowMeter).toFixed(3)),
    bedsheetStitching,
    pillowStitching: Number(pillowStitching.toFixed(2)),
    stitchingTotal: Number(stitchingTotal.toFixed(2)),
    fabricCost: Number(fabricCost.toFixed(2)),
    packingCost: Number(packingCost.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    overheadAmount: Number((formulaTotal - subtotal).toFixed(2)),
    formulaTotal: Number(formulaTotal.toFixed(2)),
    finalPrice,
    breakdown: [
      { label: 'Fabric Cost', value: Number(fabricCost.toFixed(2)), color: 'var(--accent-sage)' },
      { label: 'Stitching Cost', value: Number(stitchingTotal.toFixed(2)), color: 'var(--accent-coral)' },
      { label: 'Packing', value: Number(packingCost.toFixed(2)), color: 'var(--accent-indigo)' },
      { label: '7% Overhead', value: Number((formulaTotal - subtotal).toFixed(2)), color: 'var(--accent-amber)' }
    ]
  };
}

/**
 * 2. DOHAR ENGINE
 */
export function calculateDoharRate({
  config,
  brushingChoice = 'with', // 'with' or 'without'
  fabricChoice = 'allure', // 'allure' or 'vbc'
  sizeChoice = 'single',    // 'single' or 'double'
  packingChoice = 'std',    // 'std' or 'ld'
  tierMultiplier = 1.0
}) {
  const rates = config.rates || {};
  const isWithBrushing = brushingChoice === 'with';
  const isDouble = sizeChoice === 'double';
  const isAllure = fabricChoice === 'allure';

  // Fabric rate
  const fabricRate = isAllure ? Number(rates.allureMeterRate || 125) : Number(rates.vbcMeterRate || 218);
  // Fabric meter usage
  let fabricMeters = 0;
  if (isAllure) {
    fabricMeters = isDouble ? 5.23 : 3.29;
  } else {
    fabricMeters = isDouble ? 4.29 : 2.65;
  }
  const fabricCost = fabricMeters * fabricRate;

  // Dori Cost (KG Rate 140)
  const dooriRate = Number(rates.dooriKgRate || 140);
  const dooriKg = isDouble ? 0.08 : 0.062;
  const dooriCost = dooriKg * dooriRate;

  // Piping Fabric Cost (Solid Piping Rate 235)
  const pipingRate = Number(rates.pipingMeterSolid || 235);
  const pipingMeters = isDouble ? 0.17 : 0.13;
  const pipingCost = pipingMeters * pipingRate;

  // Brushing Cost (Rate 56.5)
  const brushingRate = Number(rates.brushingMeterRate || 56.5);
  let brushingCost = 0;
  if (isWithBrushing) {
    const brushingMeters = isDouble ? 4.2 : 2.6;
    brushingCost = brushingMeters * brushingRate;
  }

  // Stitching Cost
  let stitchingCost = 0;
  const breakdowns = config.stitchingBreakdowns || {};
  if (isDouble && isWithBrushing) {
    stitchingCost = breakdowns.doubleWithBrushing?.total || 240;
  } else if (isDouble && !isWithBrushing) {
    stitchingCost = breakdowns.doubleWithoutBrushing?.total || 180;
  } else if (!isDouble && isWithBrushing) {
    stitchingCost = breakdowns.singleWithBrushing?.total || 210;
  } else {
    stitchingCost = breakdowns.singleWithoutBrushing?.total || 160;
  }

  // Packing Cost
  let packingCost = 0;
  const packingRates = config.packingRates || {};
  if (packingChoice === 'ld') {
    packingCost = Number(packingRates.ldCost || 10);
  } else {
    if (isDouble && isWithBrushing) packingCost = Number(packingRates.stdDoubleWithBrushing || 132);
    else if (isDouble && !isWithBrushing) packingCost = Number(packingRates.stdDoubleWithoutBrushing || 35);
    else if (!isDouble && isWithBrushing) packingCost = Number(packingRates.stdSingleWithBrushing || 115);
    else packingCost = Number(packingRates.stdSingleWithoutBrushing || 35);
  }

  const subtotal = fabricCost + dooriCost + pipingCost + brushingCost + stitchingCost + packingCost;
  const overheadMultiplier = Number(config.overheadMultiplier || 1.07);
  const formulaTotal = subtotal * overheadMultiplier;
  const finalPrice = Math.round(formulaTotal / (Number(tierMultiplier) || 1.0));

  return {
    fabricCost: Number(fabricCost.toFixed(2)),
    dooriCost: Number(dooriCost.toFixed(2)),
    pipingCost: Number(pipingCost.toFixed(2)),
    brushingCost: Number(brushingCost.toFixed(2)),
    stitchingCost: Number(stitchingCost.toFixed(2)),
    packingCost: Number(packingCost.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    overheadAmount: Number((formulaTotal - subtotal).toFixed(2)),
    formulaTotal: Number(formulaTotal.toFixed(2)),
    finalPrice,
    breakdown: [
      { label: 'Fabric Cost', value: Number(fabricCost.toFixed(2)), color: 'var(--accent-sage)' },
      { label: 'Dori & Piping', value: Number((dooriCost + pipingCost).toFixed(2)), color: 'var(--accent-cyan)' },
      { label: 'Brushing', value: Number(brushingCost.toFixed(2)), color: 'var(--accent-indigo)' },
      { label: 'Stitching', value: Number(stitchingCost.toFixed(2)), color: 'var(--accent-coral)' },
      { label: 'Packing & OH', value: Number((packingCost + (formulaTotal - subtotal)).toFixed(2)), color: 'var(--accent-amber)' }
    ]
  };
}

/**
 * 3. COMFORTERS ENGINE
 */
export function calculateComforterRate({
  config,
  qualityId = '1',
  gsm = '120',
  sizeChoice = 'single', // 'single' or 'double'
  packingChoice = 'std',  // 'std' or 'ld'
  tierMultiplier = 1.0
}) {
  const isDouble = sizeChoice === 'double';
  const quality = config.qualities?.find(q => q.id === String(qualityId)) || config.qualities?.[0];
  const gsmObj = config.gsmRates?.find(g => g.gsm === String(gsm)) || config.gsmRates?.[0];

  // Fabric meter usage
  let fabricMeters = 0;
  if (quality?.isAllure) {
    fabricMeters = isDouble ? 5.23 : 3.29;
  } else {
    fabricMeters = isDouble ? 4.29 : 2.65;
  }
  const fabricCost = fabricMeters * Number(quality?.rate || 0);

  // Polyfill cost
  const polyfillRate = Number(gsmObj?.rate || 47);
  const polyfillCost = polyfillRate * (isDouble ? 2.61 : 1.65);

  // Non Woven cost
  const nonWovenRate = Number(config.nonWovenRate || 5.25);
  const nonWovenCost = nonWovenRate * (isDouble ? 8.4 : 4.7);

  // Stitching cost
  const stitchingCost = isDouble ? Number(config.stitchingCost?.double || 240) : Number(config.stitchingCost?.single || 210);

  // Packing cost
  let packingCost = 0;
  const pRates = config.packingRates || {};
  if (packingChoice === 'ld') {
    packingCost = Number(pRates.ldCost || 10);
  } else {
    const isHighGsm = Number(gsm) >= 300;
    if (isDouble) {
      packingCost = isHighGsm ? Number(pRates.doubleStdHighGsm || 180) : Number(pRates.doubleStdLowGsm || 118);
    } else {
      packingCost = isHighGsm ? Number(pRates.singleStdHighGsm || 118) : Number(pRates.singleStdLowGsm || 72);
    }
  }

  const subtotal = fabricCost + polyfillCost + nonWovenCost + stitchingCost + packingCost;
  const overheadMultiplier = Number(config.overheadMultiplier || 1.07);
  const formulaTotal = subtotal * overheadMultiplier;
  const finalPrice = Math.round(formulaTotal / (Number(tierMultiplier) || 1.0));

  return {
    fabricCost: Number(fabricCost.toFixed(2)),
    polyfillCost: Number(polyfillCost.toFixed(2)),
    nonWovenCost: Number(nonWovenCost.toFixed(2)),
    stitchingCost: Number(stitchingCost.toFixed(2)),
    packingCost: Number(packingCost.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    overheadAmount: Number((formulaTotal - subtotal).toFixed(2)),
    formulaTotal: Number(formulaTotal.toFixed(2)),
    finalPrice,
    breakdown: [
      { label: 'Fabric Cost', value: Number(fabricCost.toFixed(2)), color: 'var(--accent-sage)' },
      { label: 'Polyfill (GSM)', value: Number(polyfillCost.toFixed(2)), color: 'var(--accent-coral)' },
      { label: 'Non-Woven', value: Number(nonWovenCost.toFixed(2)), color: 'var(--accent-indigo)' },
      { label: 'Stitching', value: Number(stitchingCost.toFixed(2)), color: 'var(--accent-cyan)' },
      { label: 'Packing & OH', value: Number((packingCost + (formulaTotal - subtotal)).toFixed(2)), color: 'var(--accent-amber)' }
    ]
  };
}

/**
 * 4. FLIPKART MARKETPLACE ENGINE
 */
export function calculateFlipkartRate({
  config,
  purchasePrice = 0
}) {
  const price = Math.max(0, Number(purchasePrice) || 0);

  // Fixed Fee Bracket
  let fixedFee = 0;
  for (const bracket of (config.fixedFeeBrackets || [])) {
    if (price <= bracket.maxPrice) {
      fixedFee = bracket.fee;
      break;
    }
  }

  // Selling Price (Incl. GST) = ROUND((Purchase + 101 + FixedFee) / 0.692)
  const constantOffset = Number(config.constantOffset || 101);
  const divisor = Number(config.divisorMultiplier || 0.692);
  const sellingPriceInclGST = price > 0 ? Math.round((price + constantOffset + fixedFee) / divisor) : 0;

  // Selling Price (Excl. GST) = (20 * SellingPriceInclGST) / 21
  const sellingPriceExclGST = Number(((20 * sellingPriceInclGST) / 21).toFixed(2));

  // Secondary calculated metrics
  const returnSafety = Number((Number(config.returnSafetyPercent || 0.07) * sellingPriceInclGST).toFixed(2));
  const advertisement = Number((Number(config.advertisementPercent || 0.10) * price).toFixed(2));
  const shipping = Number(config.shippingFlat || 91);
  const collectionFee = Number((Number(config.collectionFeePercent || 0.02) * sellingPriceInclGST).toFixed(2));
  const commission = Number((Number(config.commissionPercent || 0.07) * sellingPriceInclGST).toFixed(2));

  const totalDeductions = fixedFee + returnSafety + advertisement + shipping + collectionFee + commission;
  const netEarnings = price > 0 ? Number((sellingPriceInclGST - totalDeductions - price).toFixed(2)) : 0;

  return {
    purchasePrice: price,
    fixedFee,
    returnSafety,
    advertisement,
    shipping,
    collectionFee,
    commission,
    sellingPriceInclGST,
    sellingPriceExclGST,
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netEarnings,
    breakdown: [
      { label: 'Purchase Cost', value: price, color: 'var(--accent-sage)' },
      { label: 'Shipping (Flat)', value: shipping, color: 'var(--accent-indigo)' },
      { label: 'Commission & Fees', value: Number((commission + collectionFee + fixedFee).toFixed(2)), color: 'var(--accent-coral)' },
      { label: 'Ads & Returns', value: Number((advertisement + returnSafety).toFixed(2)), color: 'var(--accent-amber)' }
    ]
  };
}
