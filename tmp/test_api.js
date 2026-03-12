const axios = require('axios');

async function testApiPrices() {
  console.log('--- Testing Local API /api/prices ---');
  try {
    const res = await axios.get('http://localhost:4000/api/prices?symbols=RELIANCE,TCS,AAPL,RELIANCE.NS', {
      timeout: 5000
    });
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('Error: Local server on port 4000 is NOT running.');
    } else {
      console.log('API call failed:', err.message);
    }
  }
}

testApiPrices();
