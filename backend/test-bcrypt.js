const bcrypt = require('bcrypt');

async function hashPassword() {
  try {
    const password = 'user123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test et
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verification:', isValid);
  } catch (error) {
    console.error('Error:', error);
  }
}

hashPassword();