# CALC//CORE — Textile & Marketplace Rate Engine (v2)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-crimson?style=flat-square)](#)

**CALC//CORE** is an industrial-grade pricing engine and rate calculator designed for home textile manufacturing (bedsheets, dohars, comforters) and e-commerce marketplace economics (Flipkart). 

Originally engineered from complex WordPress Calculated Fields Form equations, this standalone React + Vite application delivers microsecond recalculations, dynamic cost-tier margin evaluation, custom algebraic formula authoring, and a complete operations administration suite.

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [Calculation Engines](#calculation-engines)
  - [1. Bedsheets & Curated Collections (9 Engines)](#1-bedsheets--curated-collections-9-engines)
  - [2. Dohar Layered Quilt Engine](#2-dohar-layered-quilt-engine)
  - [3. Comforters Engine](#3-comforters-engine)
  - [4. Flipkart Marketplace Engine](#4-flipkart-marketplace-engine)
- [Cost Tier System](#cost-tier-system)
- [Admin Operations Suite](#admin-operations-suite)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Default Login Credentials](#default-login-credentials)
- [Database & Firebase Transition](#database--firebase-transition)
- [Formulas & Equation Reference](#formulas--equation-reference)

---

## Overview & Key Features

- **Blazing Fast Micro-Calculations**: Instant reactive pricing computation on fabric yardage, stitching, packing materials, and overheads.
- **Dynamic Tier Multipliers**: Instant pricing switches for C2C (Base Cost), Platinum (PLR), Gold (GLR), Silver (SLR), Bronze (BLR), and Wholesale Distributor (WLR) tiers.
- **Visual Cost Breakdown**: Real-time visual progress-bar breakdown analyzing Fabric, Stitching, Packaging, and Overhead shares.
- **Quote Clipboard Exporter**: Generates formatted, human-readable specification and quotation summaries with 1-click clipboard copy.
- **Custom Algebraic Formula Sandbox**: Admins can write custom mathematical equations per product using contextual variables (`fabricCost`, `stitchingCost`, `packingCost`, `overheadMultiplier`, `totalMeter`, `pillowCount`) with live testing and instant rollback.
- **Role-Based Access Control (RBAC)**: Secure multi-user login supporting Admin operations and restricted Dealer/User interfaces.
- **Audit Log & Version Snapshots**: Persisted audit trail tracking the last 20 configuration and formula changes with one-click snapshot restoration.
- **Offline-First Storage Adapter**: Persistent `localStorage` database with a clean asynchronous Promise interface, ready for a drop-in Firebase Firestore migration.
- **Mobile-Responsive Ergonomics**: Custom editorial dark-mode aesthetic with desktop navigation and dedicated mobile bottom-dock controls.

---

## Calculation Engines

The system features 12 standard product calculators alongside support for dynamically created custom textile products.

### 1. Bedsheets & Curated Collections (9 Engines)

Covers plain, yarn-dyed stripe, sateen, and mix-and-match fabric configurations with variable pillow counts and dimensional meter rules:

1. **Colors 210 TC (Stripe)** — Yarn-dyed 210 thread count stripe sheeting.
2. **Solids 210 TC (Plain)** — Pure cotton 210 thread count solid plain weave.
3. **Colors 300 TC (Stripe)** — Luxury satin stripe 300 thread count.
4. **Solids 300 TC (Plain)** — Premium plain 300 thread count weave.
5. **Solids Superfinest 400 TC** — High-density satin 400 thread count solid.
6. **Colors Superfinest 400 TC (Stripe)** — 400 thread count Dobby stripe.
7. **Specialty Collections (108")** — Curated designer sheeting (Satiny 108, Grandeur 108, Esteem, Creature, Value Boutique Collection, Structure, Sapphire).
8. **Satiny 90" & Allure** — Compact width sheeting series (60×90, 90×100, 90×108).
9. **Mix & Match Series** — Dual-fabric configurations with distinct bed and pillow materials (Harmony, Heritage, Gravitas, Gloster).

**Available Bed Dimensions Supported:**
- 54 × 90 (Single)
- 54 × 90 Pair
- 90 × 108 (Queen)
- 100 × 108
- 108 × 108 (King)
- 120 × 108 (Super King)
- 90 × 112, 100 × 112, 108 × 112, 120 × 112 (Solid Sizing Series)

---

### 2. Dohar Layered Quilt Engine

Calculates layered quilts factoring fabric quality, dori piping, brushing layers, and multi-stage stitching:
- **Fabric Qualities**: Allure (Double: 5.23m / Single: 3.29m) vs. VBC (Double: 4.29m / Single: 2.65m).
- **Brushing Treatments**: With or without middle brushing layer (Double: 4.2m / Single: 2.6m).
- **Dori Piping & Cord**: Standard dori weight (Double: 0.08 kg / Single: 0.062 kg) + solid piping fabric yardage (Double: 0.17m / Single: 0.13m).
- **Multi-Stage Stitching Breakdown**: Distinct cost allocations for quilting, stitching, layering, cutting, and overhead.
- **Packaging Options**: Low Density (LD) vs. Standard Brushing Protective Packaging.

---

### 3. Comforters Engine

Handles microfiber and cotton GSM polyfill duvets and comforters:
- **Qualities (12 Grades)**: Allure, VBC, Solid 210TC (White/Dyed), Solid Finest 300TC (White/Dyed), Colors 210TC (White/Dyed), Colors Finest 300TC (White/Dyed), Colors Super Finest 400TC (White), Solid Super Finest 400TC (White).
- **Polyfill GSM Rates**: 120 GSM, 150 GSM, 200 GSM, 300 GSM, 400 GSM.
- **Auxiliary Materials**: Non-woven under-layer yardage (Double: 8.4m / Single: 4.7m).
- **GSM-Sensitive Packaging**: Automatically selects packing rates based on GSM threshold (Low GSM ≤ 200 vs. High GSM ≥ 300).

---

### 4. Flipkart Marketplace Engine

Performs marketplace reverse-pricing and net margin reconciliation based on Flipkart India's seller commission structures:
- **Reverse Price Derivation**:
  $$\text{Selling Price (Incl. GST)} = \text{ROUND}\left(\frac{\text{Purchase Price} + 101 + \text{Fixed Fee}}{0.692}\right)$$
- **GST Reconciliation**:
  $$\text{Selling Price (Excl. GST)} = \frac{20}{21} \times \text{Selling Price (Incl. GST)}$$
- **Fee Brackets & Deductions**:
  - **Fixed Fee**: Slab-based (₹13 for price ≤ ₹249, ₹24 for ≤ ₹567, ₹47 for > ₹567).
  - **Shipping**: Flat ₹91 allocation.
  - **Commission**: 7% of Selling Price (Incl. GST).
  - **Payment Collection Fee**: 2% of Selling Price (Incl. GST).
  - **Ad Spend Budget**: 10% of base Purchase Price.
  - **Return Safety Reserve**: 7% of Selling Price (Incl. GST).
  - **Net Seller Margin**: Visual breakdown of exact take-home profit after all market deductions.

---

## Cost Tier System

The application dynamically divides final prices by the selected dealer tier multiplier:

| Tier Code | Label | Multiplier | Description |
| :--- | :--- | :---: | :--- |
| **C2C** | Direct Cost | `1.00` | Base Direct Cost (Standard manufacturing rate) |
| **PLR** | Platinum Dealer | `0.97` | Platinum Partner Tier (97% denominator) |
| **GLR** | Gold Tier | `0.95` | Gold Partner Tier (95% denominator) |
| **SLR** | Silver Tier | `0.93` | Silver Partner Tier (93% denominator) |
| **BLR** | Bronze Tier | `0.90` | Bronze Partner Tier (90% denominator) |
| **WLR** | Wholesale Distributor | `0.85` | High-Volume Wholesale Distributor (85% denominator) |

> Multipliers and tier definitions can be altered, removed, or added directly through the Admin Dashboard.

---

## Admin Operations Suite

Accessible exclusively by users with the `admin` role:

1. **Rates Configuration Tab**:
   - Edit fabric rates per color/collection.
   - Adjust pillow meter allocation and stitching charges per unit.
   - Modify overhead multiplier (default 1.07 for 7% buffer).
   - Configure packaging specifications and rates.
2. **Formula Studio**:
   - Enter custom mathematical string expressions per product.
   - Safe isolated sandbox execution using safe mathematical tokenization.
   - Real-time scope simulation sandbox with editable input variables.
   - One-click restore to standard equation: `(fabricCost + stitchingCost + packingCost) * overheadMultiplier`.
3. **Product Manager**:
   - Create brand new product calculators on the fly by cloning existing templates.
   - Remove decommissioned product lines.
4. **User & Dealer Management**:
   - Register new user accounts or phone number logins.
   - Toggle account statuses (`active` vs. `suspended`).
   - Assign roles (`admin` vs. `user`).
   - Reset user passwords.
5. **Tier Manager**:
   - Modify tier IDs, labels, and percentage multipliers.
6. **Audit & Snapshot Rollback**:
   - Chronological log of changes with timestamp and admin ID.
   - Full configuration snapshot stored per mutation with 1-click restoration.

---

## Architecture & Tech Stack

```
   +-------------------------------------------------------------+
   |                        CALC//CORE                           |
   |                                                             |
   |  [ AuthContext ]               [ RatesContext ]             |
   |  Session & RBAC                Products, Rates & Tiers      |
   +---------------+-------------------------------+-------------+
                   |                               |
                   v                               v
   +---------------+---------------+---------------+-------------+
   |   UserCalculatorView.jsx      |     AdminDashboard.jsx      |
   |   - Bedsheets Selector        |     - Rates Configuration   |
   |   - Dohar / Comforter / MKP   |     - Formula Studio        |
   |   - Tier Switcher             |     - User Management       |
   |   - Visual Breakdown Bars     |     - Tier Management       |
   |   - Spec Quote Copier         |     - Audit History Log     |
   +---------------+---------------+---------------+-------------+
                   |                               |
                   +---------------+---------------+
                                   |
                                   v
                   +-------------------------------+
                   |     Calculation Engines       |
                   |     (src/calculators/engines) |
                   +---------------+---------------+
                                   |
                                   v
                   +-------------------------------+
                   |     Storage Adapter (DB)      |
                   |   localStorage / Firebase     |
                   +-------------------------------+
```

- **Core**: React 18 (Functional Components, Hooks, Context API)
- **Bundler / Tooling**: Vite 5
- **Icons**: Lucide React
- **Styles**: Custom Vanilla CSS Design System with CSS Tokens (`tokens.css`, `app.css`)
- **Typography**: JetBrains Mono, Plus Jakarta Sans, Instrument Serif

---

## Project Directory Structure

```
so-rc-v2/
├── index.html                  # HTML entry point with fonts & metadata
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite configuration with React plugin
├── src/
│   ├── App.jsx                 # Root application controller & mode switcher
│   ├── main.jsx                # Application bootstrap
│   ├── calculators/
│   │   └── engines.js          # Mathematical calculation logic & formula evaluator
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx    # Complete admin operational suite
│   │   ├── auth/
│   │   │   └── LoginView.jsx         # Authentication screen (ID/Phone + Password)
│   │   ├── common/
│   │   │   ├── Header.jsx            # Top application bar & session details
│   │   │   ├── MobileNav.jsx         # Mobile bottom navigation bar
│   │   │   └── Toast.jsx             # Floating notification component
│   │   └── user/
│   │       └── UserCalculatorView.jsx # End-user interactive calculator
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication and session state
│   │   └── RatesContext.jsx    # Shared rates, tiers, and mutation state
│   ├── db/
│   │   ├── firebaseAdapter.js  # Firebase Firestore & Auth bridge stub
│   │   ├── index.js            # Active database export
│   │   ├── seedData.js         # Seed database configurations for all products
│   │   └── storageAdapter.js   # LocalStorage async CRUD adapter
│   └── styles/
│       ├── app.css             # Main application layout and component styling
│       └── tokens.css          # Design tokens (colors, typography, spacing)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` or `yarn`

### Installation

1. Clone or navigate to the repository:
   ```bash
   git clone https://github.com/dhyanivj/rate-cal-v2.git
   cd rate-cal-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the displayed local address (typically `http://localhost:5173`).

### Building for Production

To create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## Default Login Credentials

The application ships with initialized seed accounts in `src/db/seedData.js`:

| Role | User ID / Phone | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin` | Full Operations Dashboard, Formula Studio & Rates Editing |
| **Dealer / User** | `user101` | `user123` | Calculator View & Tier Selection |
| **Phone Login** | `9876543210` | `password` | Calculator View & Tier Selection |

> **Note**: Passwords can be changed and new accounts created via the **Users** tab inside the Admin Dashboard.

---

## Database & Firebase Transition

The application utilizes an abstracted **Storage Adapter Pattern** (`src/db/storageAdapter.js`). All interactions with users, rates, tiers, and logs return standard asynchronous Promises.

### Upgrading from LocalStorage to Firebase

When you are ready to connect to a cloud Firebase Firestore instance:

1. Install Firebase SDK:
   ```bash
   npm install firebase
   ```
2. Open [`src/db/firebaseAdapter.js`](src/db/firebaseAdapter.js) and paste your Firebase project credentials:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
3. Update [`src/db/index.js`](src/db/index.js) to export the initialized `FirebaseAdapter` instead of `db`:
   ```javascript
   export { firebaseDb as db } from './firebaseAdapter';
   ```

---

## Formulas & Equation Reference

### Standard Bedsheet Formula
$$\text{Fabric Cost} = (\text{Bedsheet Meters} + \text{Pillow Meters}) \times \text{Fabric Rate}$$
$$\text{Stitching Cost} = \text{Bedsheet Stitching} + (\text{Pillow Count} \times \text{Pillow Stitching Rate})$$
$$\text{Subtotal} = \text{Fabric Cost} + \text{Stitching Cost} + \text{Packing Cost}$$
$$\text{Base Formula Total} = \text{Subtotal} \times \text{Overhead Multiplier (1.07)}$$
$$\text{Final Dealer Price} = \text{ROUND}\left(\frac{\text{Base Formula Total}}{\text{Tier Multiplier}}\right)$$

### Custom Formula Scope Variables
When writing custom expressions in the Admin Formula Studio, the following variables are automatically injected:

| Variable | Definition |
| :--- | :--- |
| `fabricCost` | Total fabric cost (bedsheet meters + pillow meters multiplied by fabric rate) |
| `stitchingCost` / `stitchingTotal` | Total stitching charges (bedsheet + pillow count) |
| `packingCost` | Selected packaging charge (fixed or per-pillow) |
| `subtotal` | Sum of fabric, stitching, and packaging costs |
| `overheadMultiplier` | Configured overhead multiplier (e.g., `1.07`) |
| `bedsheetMeter` | Yardage requirement for the chosen bed size |
| `pillowMeter` | Yardage requirement for pillow covers |
| `totalMeter` | Total yardage (`bedsheetMeter + pillowMeter`) |
| `pillowCount` | Number of pillow covers selected |

---

## License

Private and proprietary. Developed for Sleeping Owls internal manufacturing and dealer quotation operations.
