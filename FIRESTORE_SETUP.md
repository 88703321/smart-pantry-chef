# Firestore Setup Guide

## Quick Start

### Option 1: Automatic Setup (Recommended)

1. **Download Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select "freshkeep-3c642" project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in your project root

2. **Run Initialization Script**
   ```bash
   npm install -g firebase-tools
   node scripts/initFirestore.js
   ```

3. **Deploy Security Rules**
   ```bash
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### Option 2: Manual Setup (Firebase Console)

For each collection below, follow these steps:
1. Go to Firestore Database in Firebase Console
2. Click "Start Collection"
3. Enter Collection ID
4. Click "Auto-ID" for document
5. Add field: `_placeholder: true`
6. Click Save
7. Delete the placeholder document (collection remains)

**Collections to create:**
- [ ] users
- [ ] products
- [ ] inventory
- [ ] recipes
- [ ] recipeAi
- [ ] savedRecipes
- [ ] stores
- [ ] storeProducts

## Schema Overview

### users
```
uid (document ID)
├─ name: string
├─ email: string
├─ createdAt: timestamp
└─ updatedAt: timestamp
```

### products
```
id (auto)
├─ name: string
├─ brand: string
├─ category: string
├─ barcode: string
└─ defaultShelfLifeDays: number
```

### inventory
```
id (auto)
├─ userId: string
├─ productId: string (optional)
├─ name: string
├─ category: string
├─ quantity: number
├─ quantityUnit: string
├─ expiryDate: timestamp
├─ storage: string (fridge|freezer|pantry)
├─ reorderThreshold: number
├─ isLowStock: boolean
└─ status: string (fresh|expiringSoon|almostExpired)
```

### recipes
```
id (auto)
├─ name: string
├─ ingredients: array[string]
├─ tags: array[string]
└─ baseScore: number (optional)
```

### recipeAi
```
id (auto)
├─ recipeId: string
├─ description: string
└─ steps: array[string]
```

### savedRecipes
```
id (auto)
├─ userId: string
├─ recipeId: string
└─ savedAt: timestamp
```

### stores
```
id (auto)
├─ name: string
├─ address: string
├─ area: string
├─ latitude: number
└─ longitude: number
```

### storeProducts
```
id (auto)
├─ storeId: string
├─ productName: string
├─ price: number
├─ inStock: boolean
├─ category: string
├─ keywords: array[string]
└─ lastUpdated: timestamp
```

## Security Rules

The `firestore.rules` file includes:
- ✅ Users can only read/write their own user data
- ✅ Users can only access their own inventory items
- ✅ Users can only access their own saved recipes
- ✅ Public read access to recipes, products, and stores
- ✅ Admin-only write access to stores and storeProducts

## Testing

Your app is ready to use! Try:
1. Register a new account
2. Add inventory items
3. View recipes
4. Save favorite recipes

All data will be securely stored in Firestore under your user ID.
