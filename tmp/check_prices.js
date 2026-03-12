import yahooFinance from 'yahoo-finance2';

async function checkPrice(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    console.log(`Symbol: ${symbol}`);
    console.log(`Regular Market Price: ${quote.regularMarketPrice}`);
    console.log(`Regular Market Previous Close: ${quote.regularMarketPreviousClose}`);
    console.log(`Currency: ${quote.currency}`);
  } catch (error) {
    console.error(`Error for ${symbol}:`, error.message);
  }
}

checkPrice('RELIANCE.NS');
checkPrice('RELIANCE');
checkPrice('AAPL');
