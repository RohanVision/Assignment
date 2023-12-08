function encrypt(text) {
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(text.charCodeAt(i) + 1);
  }
  return encrypted;
}

function decrypt(encryptedText) {
  let decrypted = '';
  for (let i = 0; i < encryptedText.length; i++) {
    decrypted += String.fromCharCode(encryptedText.charCodeAt(i) - 1);
  }
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
};
