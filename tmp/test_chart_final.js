const YahooFinance = require('yahoo-finance2').default;

async function run() {
  const yf = new YahooFinance();
  const symbol = 'RELIANCE.NS';
  console.log('Testing with instance of YahooFinance...');
  try {
    const result = await yf.chart(symbol, {
      period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      interval: '15m'
    });
    console.log('Success! Quotes:', result.quotes?.length);
    if (result.quotes?.length > 0) {
      console.log('Sample quote:', JSON.stringify(result.quotes[0]));
    }
  } catch (err) {
    console.error('Error with instance:', err.message);
  }
}

run();
