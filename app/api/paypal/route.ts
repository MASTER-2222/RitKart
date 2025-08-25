import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

interface PaymentData {
  name: string;
  email: string;
  amount: string;
  orderID: string;
  shippingAddress: any;
  billingAddress: any;
  cart_items: any[];
}

// PayPal API URL - using LIVE PayPal API since CLIENT_ID and CLIENT_SECRET are LIVE credentials
const PAYPAL_API_URL = 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  try {
    // Fetch PayPal credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId) {
      throw new Error('PayPal Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) not found in environment variables');
    }
    
    if (!clientSecret) {
      throw new Error('PayPal Client Secret (PAYPAL_CLIENT_SECRET) not found in environment variables');
    }

    console.log('✅ PayPal credentials loaded from environment variables');
    console.log(`🔑 Client ID: ${clientId.substring(0, 10)}...`);
    console.log(`🔐 Client Secret: ${clientSecret.substring(0, 10)}...`);

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

async function capturePayPalOrder(orderID: string, accessToken: string) {
  try {
    console.log(`Capturing PayPal order ${orderID}`);
    
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PayPal capture failed: ${response.status} - ${errorText}`);
      throw new Error(`PayPal capture failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('PayPal capture response:', data);
    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const data: PaymentData = await request.json();
    console.log('Received PayPal payment data:', data);

    // Validate the payment data
    if (!data.name || !data.email || !data.amount || !data.orderID) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    console.log('Got PayPal access token');

    // Capture the PayPal payment
    const captureData = await capturePayPalOrder(data.orderID, accessToken);

    // Check if capture was successful
    if (captureData.status !== 'COMPLETED') {
      console.log(`Invalid PayPal capture status: ${captureData.status}`);
      return NextResponse.json(
        { error: `PayPal payment capture failed with status: ${captureData.status}` },
        { status: 400 }
      );
    }

    // Extract transaction details
    const transaction = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const transactionId = transaction?.id || captureData.id;
    const paidAmount = transaction?.amount?.value || data.amount;

    // Return successful response - the order creation will be handled by the frontend
    // after receiving this success response
    return NextResponse.json(
      {
        success: true,
        message: 'PayPal payment captured successfully',
        data: {
          name: data.name,
          email: data.email,
          amount: paidAmount,
          orderID: data.orderID,
          captureID: captureData.id,
          transactionId: transactionId,
          captureStatus: captureData.status,
          paymentMethod: 'paypal'
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('PayPal payment processing error:', error);
    return NextResponse.json(
      { 
        error: 'PayPal payment processing failed',
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'PayPal Payment API endpoint',
      environment: process.env.NODE_ENV,
      paypalUrl: PAYPAL_API_URL
    },
    { status: 200 }
  );
}