// scripts/initFirestore.js
// Run this with: node scripts/initFirestore.js
// Make sure to set up Firebase Admin SDK first

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Download your service account key from Firebase Console > Project Settings > Service Accounts
try {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Using default credentials. Make sure GOOGLE_APPLICATION_CREDENTIALS is set.');
  admin.initializeApp();
}

const db = admin.firestore();

async function initializeCollections() {
  try {
    console.log('Initializing Firestore collections...\n');

    // 1. Create users collection
    console.log('Creating users collection...');
    await db.collection('users').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('users').doc('_placeholder').delete();
    console.log('✓ users collection created\n');

    // 2. Create products collection
    console.log('Creating products collection...');
    await db.collection('products').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('products').doc('_placeholder').delete();
    console.log('✓ products collection created\n');

    // 3. Create inventory collection
    console.log('Creating inventory collection...');
    await db.collection('inventory').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('inventory').doc('_placeholder').delete();
    console.log('✓ inventory collection created\n');

    // 4. Create recipes collection
    console.log('Creating recipes collection...');
    await db.collection('recipes').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('recipes').doc('_placeholder').delete();
    console.log('✓ recipes collection created\n');

    // 5. Create recipeAi collection
    console.log('Creating recipeAi collection...');
    await db.collection('recipeAi').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('recipeAi').doc('_placeholder').delete();
    console.log('✓ recipeAi collection created\n');

    // 6. Create savedRecipes collection
    console.log('Creating savedRecipes collection...');
    await db.collection('savedRecipes').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('savedRecipes').doc('_placeholder').delete();
    console.log('✓ savedRecipes collection created\n');

    // 7. Create stores collection
    console.log('Creating stores collection...');
    await db.collection('stores').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('stores').doc('_placeholder').delete();
    console.log('✓ stores collection created\n');

    // 8. Create storeProducts collection
    console.log('Creating storeProducts collection...');
    await db.collection('storeProducts').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('storeProducts').doc('_placeholder').delete();
    console.log('✓ storeProducts collection created\n');

    console.log('✅ All Firestore collections initialized successfully!');
    console.log('\nCollections created:');
    console.log('  • users');
    console.log('  • products');
    console.log('  • inventory');
    console.log('  • recipes');
    console.log('  • recipeAi');
    console.log('  • savedRecipes');
    console.log('  • stores');
    console.log('  • storeProducts');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing collections:', error);
    process.exit(1);
  }
}

initializeCollections();
