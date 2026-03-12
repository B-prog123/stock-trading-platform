const yf = require('yahoo-finance2').default;

async function testChart() {
  const symbol = 'RELIANCE.NS';
  const queryOptions = {
    period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    interval: '15m'
  };
  
  console.log(`Testing chart for ${symbol}...`);
  try {
    // Some versions required calling it on the object
    const result = await yf.chart(symbol, queryOptions);
    console.log('Result keys:', Object.keys(result));
    if (result.quotes) {
      console.log('Quotes length:', result.quotes.length);
    }
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('not sufficient')) {
       console.log('Detected restriction. Trying yf as constructor?');
       try {
         const yfInstance = new yf();
         const res = await yfInstance.chart(symbol, queryOptions);
         console.log('Success with new instance! Quotes:', res.quotes?.length);
       } catch (e) {
         console.log('New instance fail:', e.message);
       }
    }
  }
}

testChart();

async function testChart() {
  const symbol = 'RELIANCE.NS';
  const queryOptions = {
    period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    period2: new Date(),
    interval: '15m'
  };
  
  console.log(`Testing chart for ${symbol}...`);
  try {
    const result = await yahooFinance.chart(symbol, queryOptions);
    console.log('Result keys:', Object.keys(result));
    if (result.quotes) {
      console.log('Quotes length:', result.quotes.length);
      console.log('First quote:', result.quotes[0]);
    } else {
      console.log('No quotes in result');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  const symbol2 = 'AAPL';
  console.log(`\nTesting chart for ${symbol2}...`);
  try {
    const result = await yahooFinance.chart(symbol2, queryOptions);
    console.log('Quotes length:', result.quotes?.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testChart();
