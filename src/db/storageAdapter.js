/**
 * Storage Adapter - LocalStorage Dummy DB with async promise interface
 * Ready for drop-in Firebase Firestore replacement.
 */

import { DEFAULT_USERS, DEFAULT_CALCULATOR_CONFIGS, COST_TIERS } from './seedData';

const STORAGE_KEYS = {
  USERS: 'so_rc_users_v2',
  RATES: 'so_rc_calculator_rates_v2',
  TIERS: 'so_rc_cost_tiers_v2',
  SESSION: 'so_rc_auth_session_v2',
  HISTORY: 'so_rc_change_history_v2'
};

class StorageAdapter {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RATES)) {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(DEFAULT_CALCULATOR_CONFIGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIERS)) {
      localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(COST_TIERS));
    }
  }

  // --- Users CRUD ---
  async getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  async getUserById(id) {
    const users = await this.getUsers();
    return users.find(u => u.id.toLowerCase() === id.trim().toLowerCase()) || null;
  }

  async createUser(userData) {
    const users = await this.getUsers();
    if (users.some(u => u.id.toLowerCase() === userData.id.trim().toLowerCase())) {
      throw new Error(`User ID or Phone "${userData.id}" already exists`);
    }
    const newUser = {
      ...userData,
      id: userData.id.trim(),
      role: userData.role || 'user',
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async updateUser(id, updates) {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id.toLowerCase() === id.trim().toLowerCase());
    if (index === -1) throw new Error("User not found");
    
    // Prevent removing admin role from primary admin
    if (id.toLowerCase() === 'admin' && updates.role && updates.role !== 'admin') {
      throw new Error("Primary admin role cannot be altered");
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }

  async deleteUser(id) {
    if (id.toLowerCase() === 'admin') {
      throw new Error("Cannot delete primary admin account");
    }
    const users = await this.getUsers();
    const filtered = users.filter(u => u.id.toLowerCase() !== id.trim().toLowerCase());
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
  }

  // --- Rates & Configurations ---
  async getRates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RATES);
      return data ? JSON.parse(data) : DEFAULT_CALCULATOR_CONFIGS;
    } catch {
      return DEFAULT_CALCULATOR_CONFIGS;
    }
  }

  async updateRates(calculatorId, updatedConfig) {
    const rates = await this.getRates();
    rates[calculatorId] = updatedConfig;
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    return rates;
  }

  async createProduct(newProduct) {
    const rates = await this.getRates();
    if (rates[newProduct.id]) {
      throw new Error(`Product with ID "${newProduct.id}" already exists`);
    }
    rates[newProduct.id] = newProduct;
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    return rates;
  }

  async deleteProduct(productId) {
    const rates = await this.getRates();
    if (!rates[productId]) {
      throw new Error(`Product "${productId}" not found`);
    }
    // Prevent deleting all products - must have at least one
    if (Object.keys(rates).length <= 1) {
      throw new Error("Cannot delete the only remaining product");
    }
    delete rates[productId];
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    return rates;
  }

  async resetRatesToDefault() {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(DEFAULT_CALCULATOR_CONFIGS));
    return DEFAULT_CALCULATOR_CONFIGS;
  }

  // --- Change History Log (Last 20 changes) ---
  async getHistoryLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async addHistoryEntry(entry) {
    try {
      const history = await this.getHistoryLog();
      const newEntry = {
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        action: entry.action || 'Rate Update',
        target: entry.target || 'General',
        details: entry.details || '',
        adminId: entry.adminId || 'admin',
        snapshot: entry.snapshot || null
      };
      // Keep up to 20 recent history entries
      const updated = [newEntry, ...history].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error("Failed to add history entry:", err);
      return [];
    }
  }

  async clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    return [];
  }

  // --- Cost Tiers ---
  async getCostTiers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIERS);
      return data ? JSON.parse(data) : COST_TIERS;
    } catch {
      return COST_TIERS;
    }
  }

  async updateCostTiers(tiers) {
    localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(tiers));
    return tiers;
  }

  // --- Auth & Session ---
  async authenticate(id, password) {
    const users = await this.getUsers();
    const user = users.find(u => 
      u.id.toLowerCase() === id.trim().toLowerCase() && 
      u.password === password.trim()
    );

    if (!user) {
      throw new Error("Invalid User ID/Number or Password");
    }

    if (user.status === 'suspended') {
      throw new Error("This account is currently inactive. Contact Admin.");
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      role: user.role,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    return sessionData;
  }

  getCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export const db = new StorageAdapter();
