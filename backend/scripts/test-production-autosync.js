// Test Production AUTOSYNC System
// This script tests if AUTOSYNC is working in production

const axios = require('axios');

// Production URLs
const BACKEND_URL = 'https://ritkart-backend.onrender.com/api';

async function testProductionAUTOSYNC() {
  console.log('🧪 Testing Production AUTOSYNC System');
  console.log('='.repeat(60));

  // Generate unique test user
  const testTime = Date.now();
  const testEmail = `autosync-test-${testTime}@sfdsffg.com`;
  const testPassword = 'Abcd@1234';
  
  console.log(`📝 Test user: ${testEmail}`);
  
  try {
    // Step 1: Register new user
    console.log('\n1️⃣ Testing user registration with AUTOSYNC...');
    const registerResponse = await axios.post(`${BACKEND_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      fullName: 'AUTOSYNC Test User',
      phone: '+1234567890'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log(`   Message: ${registerResponse.data.message}`);
      console.log(`   User ID: ${registerResponse.data.user.id}`);
      
      // Check if message mentions AUTOSYNC verification
      if (registerResponse.data.message.includes('AUTOSYNC')) {
        console.log('✅ AUTOSYNC verification mentioned in response');
      } else {
        console.log('⚠️  No AUTOSYNC verification mentioned - this may indicate old registration code');
      }
    } else {
      console.log('❌ Registration failed:', registerResponse.data.message);
      return;
    }
    
    // Step 2: Login to get token
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    // Step 3: Test cart functionality immediately
    console.log('\n3️⃣ Testing cart functionality immediately after registration...');
    
    // Use a known product ID from production
    const testProductId = '771a5018-35d3-4493-b45c-4a630cde5893';
    
    try {
      const cartResponse = await axios.post(`${BACKEND_URL}/cart/add`, {
        productId: testProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cartResponse.data.success) {
        console.log('✅ ADD TO CART WORKS! AUTOSYNC is functioning correctly!');
        console.log(`   Product added to cart: ${JSON.stringify(cartResponse.data.cartItem, null, 2)}`);
        
        // Test getting cart
        console.log('\n4️⃣ Testing get cart...');
        const getCartResponse = await axios.get(`${BACKEND_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getCartResponse.data.success) {
          console.log('✅ Cart retrieval works!');
          console.log(`   Cart items: ${getCartResponse.data.cart?.cart_items?.length || 0}`);
        } else {
          console.log('❌ Cart retrieval failed:', getCartResponse.data.message);
        }
        
      } else {
        console.log('❌ ADD TO CART FAILED:', cartResponse.data.message);
        console.log('   This indicates AUTOSYNC is not working properly in production');
      }
      
    } catch (cartError) {
      console.log('❌ ADD TO CART ERROR:', cartError.response?.data?.message || cartError.message);
      console.log('   This indicates AUTOSYNC is not working properly in production');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Production AUTOSYNC test completed');
}

testProductionAUTOSYNC();