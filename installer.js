const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    require('./cragenetwork.js');
} else {
    const readline = require('readline');
    const { spawn } = require('child_process');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('[Kurulum] Gerekli modüller (node_modules) bulunamadı. Otomatik olarak kurulmasını ister misiniz? (e/h): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'e' || answer.toLowerCase() === 'evet') {
            console.log('[Kurulum] Modüller kuruluyor... Bu işlem biraz zaman alabilir.');
            
            const npmInstall = spawn('npm', ['install'], { stdio: 'inherit', shell: true });

            npmInstall.on('close', (code) => {
                if (code === 0) {
                    console.log('[Kurulum] Modüller başarıyla kuruldu. Lütfen uygulamayı yeniden başlatın.');
                } else {
                    console.error(`[Kurulum] Modül kurulumu sırasında bir hata oluştu (Hata kodu: ${code}). Lütfen 'npm install' komutunu manuel olarak çalıştırmayı deneyin.`);
                }
                process.exit();
            });
        } else {
            console.log('[Kurulum] Kurulum iptal edildi. Uygulama kapatılıyor.');
            process.exit();
        }
    });
}
