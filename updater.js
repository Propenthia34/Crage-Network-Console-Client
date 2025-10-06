const fs = require('fs-extra');
const { spawn } = require('child_process');
const path = require('path');

const source = process.argv[2];
const destination = process.argv[3];

function deepMerge(defaultConfig, userConfig) {
    const output = { ...defaultConfig }; 

    if (defaultConfig instanceof Object && userConfig instanceof Object) {
        for (const key in userConfig) {
            if (userConfig.hasOwnProperty(key)) {
                if (key in output) { 
                    if (Array.isArray(output[key]) && Array.isArray(userConfig[key])) {
                        output[key] = userConfig[key];
                    } else if (typeof output[key] === 'object' && output[key] !== null &&
                               typeof userConfig[key] === 'object' && userConfig[key] !== null &&
                               !Array.isArray(output[key]) && !Array.isArray(userConfig[key])) {
                        output[key] = deepMerge(output[key], userConfig[key]);
                    } else {
                        output[key] = userConfig[key];
                    }
                } else {
                    output[key] = userConfig[key];
                }
            }
        }
    }
    return output;
}

setTimeout(() => {
    try {
        const configPath = path.join(destination, 'configuration.json');
        let userConfigContent = null;
        if (fs.existsSync(configPath)) {
            console.log('Mevcut yapılandırma dosyası yedekleniyor...');
            userConfigContent = fs.readFileSync(configPath, 'utf8');
        }

        const accountsPath = path.join(destination, 'accounts.json');
        let userAccountsContent = null;
        if (fs.existsSync(accountsPath)) {
            console.log('Mevcut hesaplar dosyası yedekleniyor...');
            userAccountsContent = fs.readFileSync(accountsPath, 'utf8');
        }

        fs.copySync(source, destination, { overwrite: true });

        if (userConfigContent) {
            console.log('Yapılandırma dosyası geri yükleniyor ve yeni ayarlar ile birleştiriliyor...');
            const newDefaultConfigContent = fs.readFileSync(path.join(source, 'configuration.json'), 'utf8');
            const mergedConfig = deepMerge(JSON.parse(newDefaultConfigContent), JSON.parse(userConfigContent));
            fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
        }

        if (userAccountsContent) {
            console.log('Hesaplar dosyası geri yükleniyor...');
            fs.writeFileSync(accountsPath, userAccountsContent);
        }

        fs.removeSync(source);

        console.log('Guncelleme tamamlandi. Uygulama yeniden baslatiliyor...');
        const bat = spawn('cmd.exe', ['/c', 'start.bat'], { detached: true, stdio: 'ignore' });
        bat.unref();
    } catch (e) {
        console.error('Guncelleme islemi sirasinda bir hata olustu:', e);
    } finally {
        process.exit();
    }
}, 2000);

