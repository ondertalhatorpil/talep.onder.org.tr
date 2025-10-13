const checkBesiragaPassword = (req, res, next) => {
  console.log("\n========== YENİ BİR ADMİN İSTEĞİ GELDİ ==========");
  console.log("İstek Zamanı:", new Date().toLocaleTimeString());
  
  const correctPassword = process.env.BESIRAGA_ADMIN_PASSWORD;
  const providedPassword = req.body.password || req.headers['x-admin-password'];

  console.log("==> .env DOSYASINDAN OKUNAN ŞİFRE:", `'${correctPassword}'`);
  console.log("==> KULLANICININ GÖNDERDİĞİ ŞİFRE:", `'${providedPassword}'`);

  if (providedPassword && providedPassword === correctPassword) {
    console.log("--> SONUÇ: Şifreler Eşleşti. İzin Verildi.");
    console.log("==============================================\n");
    next();
  } else {
    console.log("--> SONUÇ: Şifreler Eşleşmedi! YETKİSİZ HATASI GÖNDERİLDİ.");
    console.log("==============================================\n");
    res.status(401).json({ success: false, message: 'Yetkisiz: Geçersiz şifre' });
  }
};
module.exports = { checkBesiragaPassword };