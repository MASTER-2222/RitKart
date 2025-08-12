// Test Newly Created User from Website
// This script tests the user I just created on the website

const axios = require('axios');

// Production URLs
const BACKEND_URL = 'https://ritkart-backend.onrender.com/api';

async function testNewlyCreatedUser() {
  console.log('🧪 Testing User Created Through Website');
  console.log('='.repeat(60));

  // User created through website
  const testEmail = 'autotest-1754979953@sfdsffg.com';
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
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`   User ID: ${userId}`);
    
    // Step 2: Check if user exists in users table directly
    console.log('\n2️⃣ Checking if user exists in users table...');
    try {
      const profileResponse = await axios.get(`${BACKEND_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.data.success) {
        console.log('✅ User EXISTS in users table');
        console.log(`   Profile: ${JSON.stringify(profileResponse.data.user, null, 2)}`);
      } else {
        console.log('❌ User NOT FOUND in users table:', profileResponse.data.message);
      }
    } catch (profileError) {
      console.log('❌ Failed to get user profile:', profileError.response?.data?.message || profileError.message);
    }
    
    // Step 3: Test cart functionality
    console.log('\n3️⃣ Testing cart functionality...');
    
    // Use the same product ID
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
        console.log('✅ ADD TO CART WORKS for newly created user!');
        console.log(`   Response: ${JSON.stringify(cartResponse.data, null, 2)}`);
      } else {
        console.log('❌ ADD TO CART FAILED for newly created user:', cartResponse.data.message);
        console.log(`   Full response: ${JSON.stringify(cartResponse.data, null, 2)}`);
      }
      
    } catch (cartError) {
      console.log('❌ ADD TO CART ERROR for newly created user:', cartError.response?.data?.message || cartError.message);
      if (cartError.response?.data) {
        console.log(`   Full error response: ${JSON.stringify(cartError.response.data, null, 2)}`);
      }
    }
    
    // Step 4: Try to get cart
    console.log('\n4️⃣ Testing cart retrieval...');
    try {
      const getCartResponse = await axios.get(`${BACKEND_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getCartResponse.data.success) {
        console.log('✅ Cart retrieval works!');
        console.log(`   Cart: ${JSON.stringify(getCartResponse.data.cart, null, 2)}`);
      } else {
        console.log('❌ Cart retrieval failed:', getCartResponse.data.message);
      }
    } catch (getCartError) {
      console.log('❌ Get cart error:', getCartError.response?.data?.message || getCartError.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log(`   Full error: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Website user test completed');
}

testNewlyCreatedUser();