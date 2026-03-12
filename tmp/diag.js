const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;

const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Referer": "https://www.nseindia.com/",
};

async function testNSE() {
  console.log('--- Testing NSE Nifty 50 API ---');
  try {
    const home = await axios.get("https://www.nseindia.com", { headers: NSE_HEADERS, timeout: 5000 });
    const cookies = home.headers["set-cookie"].map(c => c.split(";")[0]).join("; ");
    
    const res = await axios.get("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050", {
      headers: { ...NSE_HEADERS, Cookie: cookies },
      timeout: 5000,
    });
    
    const reliance = res.data.data.find(s => s.symbol === 'RELIANCE');
    if (reliance) {
      console.log('NSE RELIANCE:', {
        symbol: reliance.symbol,
        lastPrice: reliance.lastPrice,
        pChange: reliance.pChange
      });
    } else {
      console.log('RELIANCE not found in NIFTY 50');
    }
  } catch (err) {
    console.log('NSE Fetch Failed:', err.message);
  }
}

async function testYahoo() {
  console.log('\n--- Testing Yahoo Finance API ---');
  try {
    const quote = await yahooFinance.quote('RELIANCE.NS');
    console.log('Yahoo RELIANCE.NS:', {
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent
    });
    
    const batch = await yahooFinance.quote(['RELIANCE.NS', 'AAPL']);
    console.log('Yahoo Batch Result Length:', batch.length);
    if (batch[0]) {
        console.log('Batch RELIANCE.NS:', batch[0].regularMarketPrice);
    }
  } catch (err) {
    console.log('Yahoo Fetch Failed:', err.message);
  }
}

async function run() {
  await testNSE();
  await testYahoo();
}

run();
