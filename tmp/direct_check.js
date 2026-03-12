const axios = require('axios');

async function getDirectPrices() {
  console.log('--- Direct API Check ---');
  
  // 1. Yahoo Finance (Simulated via node-fetch/axios if possible, or just use a known good endpoint)
  // We'll trust my previous test_api.js results for now, but let's try a different approach.
  
  // 2. NSE Nifty 50 (Batch)
  try {
    const NSE_HEADERS = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Referer": "https://www.nseindia.com/"
    };
    
    console.log('Fetching NSE Nifty 50...');
    // We need cookies for NSE, let's try a simpler one or trust the logic.
    // Actually, let's try to hit the backend's internal functions indirectly.
    
    // Better: let's look at the actual code of fetchNseNifty50 in api/index.ts
    // I noticed it uses: const price: number = s.lastPrice ?? s.open ?? 0;
  } catch(e) {
    console.log('NSE Direct fail:', e.message);
  }
}

getDirectPrices();
