import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const collections = [
  'users',
  'products',
  'recipes',
  'recipeAi',
  'savedRecipes',
  'stores',
  'storeProducts'
];

async function createCollections() {
  console.log('Creating Firestore collections...\n');
  
  for (const collectionName of collections) {
    try {
      console.log(`Creating ${collectionName}...`);
      
      // Create a temporary document
      const docRef = await db.collection(collectionName).doc('_temp').set({
        _placeholder: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Delete the temporary document
      await db.collection(collectionName).doc('_temp').delete();
      
      console.log(`✓ ${collectionName} created\n`);
    } catch (error) {
      console.error(`✗ Error creating ${collectionName}:`, error.message);
    }
  }
  
  console.log('✅ All collections created successfully!');
  process.exit(0);
}

createCollections().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
