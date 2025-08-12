// RitZone - Diagnose AUTOSYNC System in Production
// ===============================================
// This checks if the AUTOSYNC system is actually working in production

const axios = require('axios');

const BACKEND_URL = 'https://ritkart-backend.onrender.com';

const diagnoseAutoSync = async () => {
  try {
    console.log('🔍 RitZone AUTOSYNC Production Diagnosis');
    console.log('=======================================');
    console.log(`📍 Testing backend: ${BACKEND_URL}`);
    console.log('');

    // Generate a unique test user
    const timestamp = Date.now();
    const testUser = {
      email: `autosync.test.${timestamp}@example.com`,
      password: 'TestPassword123!',
      fullName: 'AUTOSYNC Test User'
    };

    console.log(`🧪 Testing AUTOSYNC with new user: ${testUser.email}`);
    console.log('');

    // Step 1: Test Registration Endpoint
    console.log('📝 Step 1: Testing Registration with AUTOSYNC...');
    try {
      const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        fullName: testUser.fullName
      });

      console.log(`Status: ${registerResponse.status}`);
      console.log(`Success: ${registerResponse.data.success}`);
      console.log(`Message: ${registerResponse.data.message}`);
      
      if (registerResponse.data.message.includes('AUTOSYNC')) {
        console.log('✅ AUTOSYNC system is ACTIVE in registration');
      } else {
        console.log('❌ AUTOSYNC system NOT DETECTED in registration response');
        console.log('🚨 This indicates the old registration code is still running');
      }

      if (registerResponse.data.user) {
        console.log(`User ID: ${registerResponse.data.user.id}`);
        
        // Step 2: Test if user was created in users table
        console.log('');
        console.log('📊 Step 2: Testing if user exists in users table...');
        
        // Login to get token for database check
        const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful - user exists in auth');
          
          // Try to add to cart (this will reveal if users table record exists)
          console.log('');
          console.log('🛒 Step 3: Testing Add to Cart (Critical Test)...');
          
          try {
            const cartResponse = await axios.post(
              `${BACKEND_URL}/api/cart/add`,
              {
                productId: '771a5018-35d3-4493-b45c-4a630cde5893',
                quantity: 1
              },
              {
                headers: {
                  'Authorization': `Bearer ${loginResponse.data.token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            console.log(`Cart Add Status: ${cartResponse.status}`);
            console.log(`Cart Add Success: ${cartResponse.data.success}`);
            
            if (cartResponse.data.success) {
              console.log('✅ ADD TO CART SUCCESSFUL!');
              console.log('🎉 AUTOSYNC system is working correctly!');
            } else {
              console.log(`❌ ADD TO CART FAILED: ${cartResponse.data.message}`);
              console.log('🚨 This confirms AUTOSYNC is NOT working in production');
            }
          } catch (cartError) {
            console.log(`❌ ADD TO CART ERROR: ${cartError.response?.data?.message || cartError.message}`);
            console.log('🚨 This confirms AUTOSYNC is NOT working in production');
          }
        }
      }
    } catch (regError) {
      console.log(`❌ Registration failed: ${regError.response?.data?.message || regError.message}`);
    }

    console.log('');
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('==================');
    console.log('If registration message does NOT include "AUTOSYNC verification":');
    console.log('  → The old registration code is still running');
    console.log('  → The pull request merge did not deploy properly');
    console.log('  → Backend needs to be redeployed with new code');
    console.log('');
    console.log('If add to cart fails:');
    console.log('  → Users table record was not created automatically');
    console.log('  → AUTOSYNC system is not functioning');
    console.log('  → Every new user will have the same cart issue');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
};

// Run diagnosis
diagnoseAutoSync();