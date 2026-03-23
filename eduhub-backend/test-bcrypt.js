const bcrypt = require('bcryptjs');
async function main() {
  const hash = '$2a$10$McBLe7MKl.FrdkL.mPLDqOdRVtpZDfBR/yUFQ9QwJZluu8/SzeOyS';
  const password = 'password123'; // assuming this was the password
  console.log('Comparing...');
  try {
    const result = await bcrypt.compare(password, hash);
    console.log('Result:', result);
  } catch (err) {
    console.error('Error in bcrypt:', err);
  }
}
main();
