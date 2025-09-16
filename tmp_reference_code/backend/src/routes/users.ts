import express from 'express';
import { User, Store } from '../models/User';
import { Log } from '../models/Log';

// Updated to use new column names: store_name, owner_name, phone_number

const router = express.Router();

// Register new user and store
router.post('/register', async (req, res) => {
  try {
    const {
      businessRegistrationNumber,
      storeName,
      ownerName,
      phoneNumber,
      email,
      storeAddress,
      naverStoreLink,
      preWork
    } = req.body;

    // Validation
    if (!businessRegistrationNumber || !storeName || !ownerName || !phoneNumber || !storeAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: businessRegistrationNumber, storeName, ownerName, phoneNumber, storeAddress' 
      });
    }

    // Check if user already exists
    let user = await User.findByPhone(phoneNumber);
    
    // If user doesn't exist, create them
    if (!user) {
      user = await User.create({
        phone: phoneNumber,
        name: ownerName,
        email: email
      });
    }

    // Create the store for this user
    const newStore = await Store.create({
      user_id: user.id!,
      business_registration_number: businessRegistrationNumber,
      store_name: storeName,
      owner_name: ownerName,
      store_address: storeAddress,
      naver_store_link: naverStoreLink,
      pre_work: preWork || false
    });

    // Log the registration
    await Log.create({
      type: 'USER_REGISTERED',
      message: `New store registered: ${storeName}`,
      store_id: newStore.id!,
      metadata: JSON.stringify({ 
        email, 
        owner_name: ownerName, 
        user_id: user.id,
        store_number: newStore.store_number 
      })
    });

    // Return store data without sensitive info
    const responseData = {
      userId: user.id,
      storeId: newStore.id,
      storeName: newStore.store_name,
      ownerName: newStore.owner_name,
      storeNumber: newStore.store_number,
      userPin: newStore.user_pin,
      preWork: newStore.pre_work,
      createdAt: newStore.created_at
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Sign in / authenticate store
router.post('/signin', async (req, res) => {
  try {
    const { storeNumber, userPin } = req.body;

    if (!storeNumber || !userPin) {
      return res.status(400).json({ error: 'Store number and user PIN are required' });
    }

    const store = await Store.authenticate(storeNumber, userPin);
    if (!store) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log the sign in
    await Log.create({
      type: 'USER_SIGNIN',
      message: `Store signed in: ${store.store_name}`,
      store_id: store.id!,
      metadata: JSON.stringify({ store_number: store.store_number })
    });

    // Return store data without sensitive info
    const responseData = {
      userId: store.user_id,
      storeId: store.id,
      storeName: store.store_name,
      ownerName: store.owner_name,
      storeNumber: store.store_number,
      userPin: store.user_pin,
      preWork: store.pre_work
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error signing in store:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Get store profile by store number
router.get('/:storeNumber', async (req, res) => {
  try {
    const { storeNumber } = req.params;
    const store = await Store.findByStoreNumber(storeNumber);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Return store data without sensitive info
    const responseData = {
      userId: store.user_id,
      storeId: store.id,
      storeName: store.store_name,
      ownerName: store.owner_name,
      storeNumber: store.store_number,
      storeAddress: store.store_address,
      naverStoreLink: store.naver_store_link,
      preWork: store.pre_work
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Get stores for a user
router.get('/user/:userId/stores', async (req, res) => {
  try {
    const { userId } = req.params;
    const stores = await Store.findByUserId(parseInt(userId));

    const responseData = stores.map(store => ({
      storeId: store.id,
      storeName: store.store_name,
      ownerName: store.owner_name,
      storeNumber: store.store_number,
      storeAddress: store.store_address,
      naverStoreLink: store.naver_store_link,
      preWork: store.pre_work,
      createdAt: store.created_at
    }));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user stores:', error);
    res.status(500).json({ error: 'Failed to fetch user stores' });
  }
});

export default router;