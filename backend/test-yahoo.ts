import yahooFinance from 'yahoo-finance2';
console.log('yahooFinance object:', Object.keys(yahooFinance || {}));
try {
  yahooFinance.suppressNotices(['yahooSurvey']);
  console.log('suppressNotices successful');
} catch (e) {
  console.error('suppressNotices error:', e);
}
