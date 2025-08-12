// Test Existing User Cart Functionality
// This script tests the specific user mentioned by the user

const axios = require('axios');

// Production URLs
const BACKEND_URL = 'https://ritkart-backend.onrender.com/api';

async function testExistingUser() {
  console.log('🧪 Testing Existing User Cart Functionality');
  console.log('='.repeat(60));

  // User credentials provided by user
  const testEmail = 'sfffve2@sfdsffg.com';
  const testPassword = 'Abcd@1234';
  
  console.log(`📝 Testing user: ${testEmail}`);
  
  try {
    // Step 1: Login
    console.log('\n1️⃣ Testing login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      console.log('   User may not exist or credentials are incorrect');
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`   User ID: ${userId}`);
    
    // Step 2: Test cart functionality
    console.log('\n2️⃣ Testing cart functionality...');
    
    // Use the same product ID mentioned by user
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
        console.log('✅ ADD TO CART WORKS for this user!');
        console.log(`   Response: ${JSON.stringify(cartResponse.data, null, 2)}`);
        
        // Test getting cart
        console.log('\n3️⃣ Testing get cart...');
        const getCartResponse = await axios.get(`${BACKEND_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getCartResponse.data.success) {
          console.log('✅ Cart retrieval works!');
          console.log(`   Cart items count: ${getCartResponse.data.cart?.cart_items?.length || 0}`);
          if (getCartResponse.data.cart?.cart_items?.length > 0) {
            console.log(`   Items: ${JSON.stringify(getCartResponse.data.cart.cart_items.map(item => ({
              productId: item.product_id, 
              quantity: item.quantity
            })), null, 2)}`);
          }
        } else {
          console.log('❌ Cart retrieval failed:', getCartResponse.data.message);
        }
        
      } else {
        console.log('❌ ADD TO CART FAILED for existing user:', cartResponse.data.message);
        console.log(`   Full response: ${JSON.stringify(cartResponse.data, null, 2)}`);
      }
      
    } catch (cartError) {
      console.log('❌ ADD TO CART ERROR for existing user:', cartError.response?.data?.message || cartError.message);
      if (cartError.response?.data) {
        console.log(`   Full error response: ${JSON.stringify(cartError.response.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log(`   Full error: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Existing user test completed');
}

testExistingUser();