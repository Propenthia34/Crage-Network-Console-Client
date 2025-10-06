const originalConsoleLog = console.log;
console.log = function(...args) {
  if (typeof args[0] === 'string' && (args[0].includes('Chunk size is') || args[0].includes('1cb3ea404e31a6b5000000403c857c4b9e31a800000000000000000000000000000000000000000000000000000000000000000000000000'))) {
    return;
  }
  originalConsoleLog.apply(console, args);
};

const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear } = require('mineflayer-pathfinder').goals;
const readline = require("readline");
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const _chalk = require("chalk");
const chalk = _chalk && _chalk.default ? _chalk.default : _chalk;

const DEFAULT_CONFIG = {
    _comment_Sunucu: "Botun bağlanacağı Minecraft sunucusunun sürüm bilgisi.",
    Sunucu: {
        Surum: "1.21.4"
    },

    _comment_Ozellikler: "Botun çeşitli özelliklerini açıp kapatabileceğiniz ve ayarlayabileceğiniz bölüm.",
    Ozellikler: {
        _comment_SohbetLog: "True ise, tüm sohbeti 'sohbet-gecmisi' klasörüne kaydeder.",
        SohbetLog: true,
        _comment_GelistirilmisAntiAFK: "Botun AFK olarak algılanmasını engellemek için rastgele hareketler yapmasını sağlar.",
        GelistirilmisAntiAFK: {
            Etkin: true,
            _comment_Aralik: "Milisaniye cinsinden ne kadar sürede bir hareket yapılacağı (120000 = 2 dakika).",
            Aralik: 120000
        },
        _comment_OtomatikBeslenme: "Bot acıktığında otomatik olarak yemek yemesini sağlar.",
        OtomatikBeslenme: {
            Etkin: true,
            _comment_AclikSeviyesi: "Açlık seviyesi bu değerin altına düştüğünde bot yemek yer (Max: 20).",
            AclikSeviyesi: 16
        },
        _comment_OtomatikCevaplayici: "Sohbette botun adı geçtiğinde otomatik olarak mesaj atar.",
        OtomatikCevaplayici: {
            Etkin: true,
            Mesaj: "Merhaba, ben bir botum. Sahibim şu an burada değil."
        },
        _comment_KomutSistemi: "Sahip kullanıcısının bota oyun içinden komut vermesini sağlar.",
        KomutSistemi: {
            Etkin: true,
            _comment_OnEk: "Komutların başına gelecek olan karakter (örneğin: !gel).",
            OnEk: "!"
        },
        _comment_Guvenlik: "Botun canını ve pozisyonunu kontrol eden güvenlik özellikleri.",
        Guvenlik: {
            DusukCanUyarisi: {
                Etkin: true,
                _comment_CanSeviyesi: "Botun canı bu değerin altına düştüğünde sahibine özel mesaj atar (Max: 20).",
                CanSeviyesi: 10
            },
            BoslukKorumasi: {
                Etkin: true,
                _comment_Yukseklik: "Bot bu Y seviyesinin altına düşerse sunucudan atılır.",
                Yukseklik: 0
            }
        },
        _comment_OtoKomut: "Bota, sunucuya her katıldığında veya periyodik olarak otomatik komutlar yazdırma.",
        OtoKomut: {
            _comment_GirisKomutlari: "Sunucuya girildiğinde bir defaya mahsus, sırayla çalıştırılacak komutlar.",
            GirisKomutlari: {
                Etkin: true,
                Komutlar: ["/server survival"]
            },
            _comment_TekrarliKomutlar: "Belirtilen aralıkla sürekli tekrarlanacak komut.",
            TekrarliKomutlar: {
                Etkin: true,
                _comment_Aralik: "Milisaniye cinsinden tekrarlama aralığı (30000 = 30 saniye).",
                Aralik: 30000,
                Komut: "/survival"
            }
        },
        _comment_YenidenBaglanma: "Sunucuyla bağlantı koptuğunda yeniden bağlanma ayarları.",
        YenidenBaglanma: {
            _comment_Gecikme: "Milisaniye cinsinden varsayılan yeniden bağlanma gecikmesi (5000 = 5 saniye).",
            "Gecikme": 5000,
            _comment_HizliGirisGecikmesi: "Sunucu 'çok hızlı giriş' hatası verdiğinde beklenecek süre (30000 = 30 saniye).",
            "HizliGirisGecikmesi": 30000
        },
        _comment_OtoMesaj: "Belirtilen aralıklarla, sırayla bir mesaj listesi gönderir. Sohbet botu gibi kullanılabilir.",
        OtoMesaj: {
            Etkin: false,
            _comment_Aralik: "Milisaniye cinsinden her mesaj arasındaki bekleme süresi (10000 = 10 saniye).",
            Aralik: 10000,
            _comment_Mesajlar: "Sırayla gönderilecek mesajların listesi.",
            Mesajlar: [
                "1. otomatik mesaj",
                "2. otomatik mesaj",
                "3. otomatik mesaj"
            ]
        },
        _comment_Guncelleme: "Otomatik güncelleme ayarları. ",
        Guncelleme: {
            Etkin: true,
            RepoURL: "Propenthia34/Crage-Network-Console-Client"
        }
    }
};

let config;
let currentAccount = null;

const CONFIG_FILE = path.join(__dirname, 'configuration.json');
try {
    const fileContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    const loadedConfig = JSON.parse(fileContent);
    
    // Perform deep merge: user's loaded config overrides default config
    config = deepMerge(DEFAULT_CONFIG, loadedConfig);
    
    // Write the merged config back to file to update with new/missing settings
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    console.log(chalk.yellow('[Config] Yapılandırma dosyası başarıyla yüklendi ve güncellendi.'));
} catch (e) {
    console.error(chalk.red('[Config] HATA: configuration.json okunamadı veya bozuk. Lütfen dosyayı kontrol edin.'));
    process.exit(1);
}

const LOG_DIR = path.join(__dirname, 'sohbet-gecmisi');

function logChatMessage(message) { 
    if (!config.Ozellikler.SohbetLog) return;
    try {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const botName = currentAccount.kullaniciAdi; // Use current account's name
        const logFileName = path.join(LOG_DIR, `${dateString}-${botName}.txt`);
        const logMessage = `[${today.toTimeString().split(' ')[0]}] ${message}\n`;
        fs.appendFileSync(logFileName, logMessage);
    } catch (e) {
        console.error(chalk.red('[Logger] Sohbet mesajı kaydedilirken bir hata oluştu:', e));
    }
}

function deepMerge(defaultConfig, userConfig) {
    const output = { ...defaultConfig }; // Başlangıçta tüm default config'i kopyala

    if (defaultConfig instanceof Object && userConfig instanceof Object) {
        for (const key in userConfig) {
            if (userConfig.hasOwnProperty(key)) {
                if (key in output) { // Eğer output'ta (yani default config'de) bu anahtar varsa
                    if (Array.isArray(output[key]) && Array.isArray(userConfig[key])) {
                        // Her ikisi de dizi ise, kullanıcının dizisiyle değiştir
                        output[key] = userConfig[key];
                    } else if (typeof output[key] === 'object' && output[key] !== null &&
                               typeof userConfig[key] === 'object' && userConfig[key] !== null &&
                               !Array.isArray(output[key]) && !Array.isArray(userConfig[key])) {
                        // Her ikisi de nesne ise (ve dizi değilse), derin birleştirme yap
                        output[key] = deepMerge(output[key], userConfig[key]);
                    } else {
                        // Türler farklıysa veya biri nesne değilse, kullanıcının değeri default'u geçersiz kılar
                        output[key] = userConfig[key];
                    }
                } else {
                    // Eğer anahtar output'ta (default config'de) yoksa, userConfig'den ekle
                    output[key] = userConfig[key];
                }
            }
        }
    }
    return output;
}

const VERSION_FILE = path.join(__dirname, 'version.json');

async function getLocalVersion() {
    if (!fs.existsSync(VERSION_FILE)) {
        return null;
    }
    const data = fs.readFileSync(VERSION_FILE, 'utf8');
    return JSON.parse(data).commit;
}

async function getRemoteVersion() {
    if (!config.Ozellikler.Guncelleme || !config.Ozellikler.Guncelleme.Etkin) return null;
    const GITHUB_API_URL = `https://api.github.com/repos/${config.Ozellikler.Guncelleme.RepoURL}/commits/main`;
    try {
        const response = await axios.get(GITHUB_API_URL, {
            headers: { 'User-Agent': 'CrageNetwork-Bot-Updater' }
        });
        return response.data.sha;
    } catch (error) {
        console.error(chalk.red('[AutoUpdate] Uzak sürüm bilgisi alınamadı:', error.message));
        return null;
    }
}

async function downloadAndExtractUpdate() {
    if (!config.Ozellikler.Guncelleme || !config.Ozellikler.Guncelleme.Etkin) return null;
    const GITHUB_ZIP_URL = `https://github.com/${config.Ozellikler.Guncelleme.RepoURL}/archive/refs/heads/main.zip`;
    try {
        console.log(chalk.yellow('[AutoUpdate] Güncelleme indiriliyor...'));
        const response = await axios.get(GITHUB_ZIP_URL, { responseType: 'arraybuffer' });
        const zip = new AdmZip(response.data);
        const tempDir = path.join(__dirname, 'temp_update');
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
        fs.mkdirSync(tempDir, { recursive: true });

        zip.extractAllTo(tempDir, true);
        console.log(chalk.green('[AutoUpdate] Güncelleme indirildi ve çıkarıldı.'));

        const extractedEntries = fs.readdirSync(tempDir);
        const sourceDir = path.join(tempDir, extractedEntries[0]);

        return sourceDir;
    } catch (error) {
        console.error(chalk.red('[AutoUpdate] Güncelleme indirme hatası:', error.message));
        return null;
    }
}

async function checkForUpdates() {
    if (!config.Ozellikler.Guncelleme) {
        console.log(chalk.red('[AutoUpdate] HATA: configuration.json dosyanızda "Guncelleme" bölümü eksik. Lütfen en son sürümdeki yapılandırma dosyasını kullanın. Güncelleme özelliği devre dışı bırakıldı.'));
        return;
    }
    if (!config.Ozellikler.Guncelleme.Etkin) {
        console.log(chalk.yellow('[AutoUpdate] Güncelleme sistemi yapılandırmadan devre dışı bırakılmış.'));
        return;
    }
    console.log(chalk.blue('[AutoUpdate] Güncellemeler kontrol ediliyor...'));
    const localVersion = await getLocalVersion();
    const remoteVersion = await getRemoteVersion();

    if (!remoteVersion) return;

    if (!localVersion || localVersion !== remoteVersion) {
        if (!localVersion) {
            console.log(chalk.yellow('[AutoUpdate] Yerel sürüm dosyası bulunamadı. En son sürüme güncelleniyor...'));
        } else {
            console.log(chalk.green('[AutoUpdate] Yeni bir sürüm bulundu! Güncelleniyor...'));
        }
        
        const updateSourceDir = await downloadAndExtractUpdate();

        if (updateSourceDir) {
            const newVersionFile = path.join(updateSourceDir, 'version.json');
            fs.writeFileSync(newVersionFile, JSON.stringify({ commit: remoteVersion }));
            console.log(chalk.blue('[AutoUpdate] İndirilen güncelleme için sürüm bilgisi güncellendi.'));

            console.log(chalk.yellow('[AutoUpdate] Güncelleyici başlatılıyor. Uygulama yeniden başlayacak...'));
            const updaterPath = path.join(__dirname, 'updater.js');
            const appDir = __dirname;

            const updater = spawn('node', [updaterPath, updateSourceDir, appDir], {
                detached: true,
                stdio: 'ignore'
            });
            updater.unref();
            process.exit();
        }
    } else {
        console.log(chalk.green('[AutoUpdate] Uygulama güncel.'));
    }
}

// --- Bot Logic ---
let antiAfkInterval = null;
let survivalInterval = null;
let healthCheckInterval = null;
let safetyCheckInterval = null;
let autoMessageInterval = null;
let autoMessageIndex = 0;
let mcData = null;
let reconnectTimer = null;
let reconnectDelay = 5000; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const yellow = typeof chalk?.yellow === "function" ? chalk.yellow : (s) => s;
rl.setPrompt(yellow("> "));

rl.on("line", (input) => {
  if (global.bot && input.trim().length > 0) {
    try {
      global.bot.chat(input.trim());
    } catch(e) {
      console.log(chalk.red("Mesaj gönderilirken bir hata oluştu:", e));
    }
  }
  rl.prompt(true);
});

function sendAutoMessage() {
    const settings = config.Ozellikler.OtoMesaj;
    if (!settings.Etkin || settings.Mesajlar.length === 0) return;

    const messageToSend = settings.Mesajlar[autoMessageIndex];
    bot.chat(messageToSend);
    
    autoMessageIndex = (autoMessageIndex + 1) % settings.Mesajlar.length;
}

function performAdvancedAntiAfk() {
    if (!bot || !bot.entity) return;

    const actions = [
        () => { // Look around
            console.log(chalk.gray('[AntiAFK] Etrafa bakınılıyor...'));
            const yaw = Math.random() * Math.PI * 2 - Math.PI;
            const pitch = Math.random() * (Math.PI / 2) - (Math.PI / 4);
            bot.look(yaw, pitch, true);
        },
        () => { // Swing arm
            console.log(chalk.gray('[AntiAFK] Kol sallanıyor...'));
            bot.swingArm();
        },
        () => { // Jump
            console.log(chalk.gray('[AntiAFK] Zıplanıyor...'));
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
        },
        () => { // Move a bit
            if (!bot.pathfinder) return;
            const currentPos = bot.entity.position;
            const goalX = currentPos.x + (Math.random() * 4 - 2);
            const goalZ = currentPos.z + (Math.random() * 4 - 2);
            console.log(chalk.gray(`[AntiAFK] Yakın bir pozisyona hareket ediliyor...`));
            bot.pathfinder.setGoal(new GoalNear(goalX, currentPos.y, goalZ, 1));
        }
    ];

    try {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        randomAction();
        rl.prompt(true);
    } catch (e) {
        console.error(chalk.red('[AntiAFK] Hata:', e.message));
    }
}

const KNOWN_FOODS = [
    'apple', 'mushroom_stew', 'bread', 'porkchop', 'cooked_porkchop', 'golden_apple', 'enchanted_golden_apple', 
    'cod', 'salmon', 'tropical_fish', 'pufferfish', 'cooked_cod', 'cooked_salmon', 'cookie', 'melon_slice', 
    'dried_kelp', 'beef', 'cooked_beef', 'chicken', 'cooked_chicken', 'rotten_flesh', 'spider_eye', 'carrot', 
    'potato', 'baked_potato', 'poisonous_potato', 'golden_carrot', 'pumpkin_pie', 'rabbit', 'cooked_rabbit', 
    'rabbit_stew', 'mutton', 'cooked_mutton', 'chorus_fruit', 'beetroot', 'beetroot_soup', 'suspicious_stew', 
    'sweet_berries', 'glow_berries', 'honey_bottle'
];

async function checkHealthAndEat() {
    if (!config.Ozellikler.OtomatikBeslenme.Etkin || !bot || !bot.entity || bot.food === 20) return;

    if (bot.food < config.Ozellikler.OtomatikBeslenme.AclikSeviyesi) {
        // Last resort: Find food using a hardcoded list of names because server data is unreliable.
        const food = bot.inventory.items().find(item => KNOWN_FOODS.includes(item.name));

        if (food) {
            try {
                console.log(chalk.yellow(`[AutoEat] Açlık seviyesi düşük (${bot.food}), ${food.displayName} yeniliyor...`));
                await bot.equip(food, 'hand');
                await bot.consume();
            } catch (e) {
                console.error(chalk.red(`[AutoEat] Yemek yeme sırasında hata: ${e.message}`));
            }
        } else {
            if (!global.warnedNoFood) {
                const owner = currentAccount.sahip;
                const warningMessage = "UYARI: Açlığım kritik seviyede ve envanterimde yiyecek yok!";
                console.log(chalk.red(`[AutoEat] ${warningMessage}`));
                bot.chat(`/msg ${owner} ${warningMessage}`);
                global.warnedNoFood = true;
            }
        }
    }
}

// --- Command System Functions ---

function handleComeCommand(username) {
    const player = bot.players[username];
    if (!player || !player.entity) {
        bot.chat("Seni göremiyorum.");
        return;
    }
    const target = player.entity;
    const { x, y, z } = target.position;
    bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
    bot.chat("Geliyorum...");
}

function handleInventoryCommand(username) {
    const items = bot.inventory.items().map(item => `${item.name} x${item.count}`).join(', ');
    if (items) {
        const chunks = items.match(/.{1,200}/g) || [];
        if (chunks.length > 0) {
            bot.chat(`/msg ${username} Envanterim:`);
            chunks.forEach(chunk => bot.chat(`/msg ${username} - ${chunk}`));
        } else {
            bot.chat(`/msg ${username} Envanterim boş.`);
        }
    } else {
        bot.chat(`/msg ${username} Envanterim boş.`);
    }
}

async function handleDropCommand(args, username) {
    const itemName = args[0];
    if (!itemName) {
        bot.chat(`/msg ${username} Kullanım: !at <eşya_adı> [miktar]`);
        return;
    }
    const amount = args[1] ? parseInt(args[1], 10) : null;

    const itemToDrop = bot.inventory.items().find(item => item.name.includes(itemName));
    if (!itemToDrop) {
        bot.chat(`/msg ${username} Envanterde '${itemName}' bulunamadı.`);
        return;
    }

    try {
        await bot.toss(itemToDrop.type, null, amount);
        bot.chat(`/msg ${username} ${amount || 'Tüm'} ${itemToDrop.name} atıldı.`);
    } catch (e) {
        bot.chat(`/msg ${username} Eşya atılırken hata: ${e.message}`);
    }
}

function handleMessageCommand(args) {
    const targetUser = args.shift();
    const messageToSend = args.join(' ');
    if (!targetUser || !messageToSend) {
        bot.chat(`/msg ${currentAccount.sahip} Kullanım: !mesaj <kullanıcı> <mesaj>`);
        return;
    }
    bot.chat(`/msg ${targetUser} ${messageToSend}`);
}



async function handleDigCommand(username) {
    try {
        const block = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (!block) {
            bot.chat(`/msg ${username} Altımda kazılacak bir blok yok.`);
            return;
        }

        if (!bot.canDigBlock(block)) {
            bot.chat(`/msg ${username} Bu bloğu kazamam.`);
            return;
        }

        bot.chat(`/msg ${username} ${block.displayName} kazılıyor...`);
        await bot.dig(block);
        bot.chat(`/msg ${username} Blok kazıldı.`);
    } catch (e) {
        bot.chat(`/msg ${username} Kazma hatası: ${e.message}`);
    }
}

function handleCommand(command, args, username) {
    switch (command) {
        case 'envanter':
            handleInventoryCommand(username);
            break;
        case 'at':
            handleDropCommand(args, username);
            break;
        case 'mesaj':
            handleMessageCommand(args);
            break;
        case 'kaz':
            handleDigCommand(username);
            break;
        default:
            bot.chat(`/msg ${username} Bilinmeyen komut: ${command}`);
    }
}

function checkSafety() {
    if (!bot || !bot.entity) return;

    // 1. Low Health Alert
    if (config.Ozellikler.Guvenlik.DusukCanUyarisi.Etkin) {
        if (bot.health < config.Ozellikler.Guvenlik.DusukCanUyarisi.CanSeviyesi) {
            if (!global.lowHealthWarned) {
                const owner = currentAccount.sahip;
                bot.chat(`/msg ${owner} UYARI: Canım azalıyor! Mevcut can: ${Math.round(bot.health)}`);
                global.lowHealthWarned = true;
            }
        } else {
            global.lowHealthWarned = false;
        }
    }

    // 2. Void Protection
    if (config.Ozellikler.Guvenlik.BoslukKorumasi.Etkin) {
        if (bot.entity.position.y < config.Ozellikler.Guvenlik.BoslukKorumasi.Yukseklik) {
            console.log(chalk.red('[Guvenlik] Boşluğa düşme tehlikesi! Sunucudan ayrılıyor...'));
            bot.quit('Void protection');
        }
    }
}

function startBot() {
  console.log(chalk.green(`'${currentAccount.hesapAdi}' adlı bot Crage Network'e bağlanıyor...`));

  const encodedHost = 'cGxheS5jcmFnZW5ldHdvcmsuY29t';
  const decodedHost = Buffer.from(encodedHost, 'base64').toString('ascii');

  const bot = mineflayer.createBot({
    host: decodedHost,
    port: 25565,
    username: currentAccount.kullaniciAdi,
    password: currentAccount.sifre,   
    auth: "offline",
    version: config.Sunucu.Surum,
    keepAlive: true,
    checkTimeoutInterval: 60 * 1000,
    viewDistance: "tiny",
  });

  global.bot = bot;

  bot.loadPlugin(pathfinder);

  mcData = require('minecraft-data')(bot.version);

  bot.on("resourcePack", () => {
    try {
      bot.acceptResourcePack();
      console.log("[RP] Resource pack kabul edildi.");
    } catch (e) {
      console.log("[RP] Resource pack kabul hatası:", e?.message || e);
    }
  });

  bot.on("kicked", (reason) => {
    const reasonText = reason.toString();
    console.log(chalk.red("[KICKED] Sunucudan atıldınız. Sebep: " + reasonText));
    
    if (reasonText.includes('logging in too fast')) {
        reconnectDelay = config.Ozellikler.YenidenBaglanma.HizliGirisGecikmesi;
        console.log(chalk.yellow(`Çok hızlı giriş denemesi. Yeniden bağlanma süresi ${reconnectDelay / 1000} saniyeye ayarlandı.`));
    }
  });

  bot.on("spawn", () => {
    reconnectDelay = config.Ozellikler.YenidenBaglanma.Gecikme;
    console.log(chalk.green("Bot sunucuya spawn oldu. Giriş yapılıyor..."));

    const defaultMove = new Movements(bot, mcData);
    defaultMove.allowSprinting = false;
    bot.pathfinder.setMovements(defaultMove);
    
    global.warnedNoFood = false;
    global.lowHealthWarned = false;
    autoMessageIndex = 0; 

    setTimeout(() => {
      try { bot.chat(`/login ${currentAccount.sifre}`); } catch {}
    }, 1500);

    if (config.Ozellikler.OtoKomut.GirisKomutlari.Etkin) {
        let commandDelay = 3000; 
        config.Ozellikler.OtoKomut.GirisKomutlari.Komutlar.forEach(command => {
            setTimeout(() => {
                try { 
                    console.log(chalk.blue(`[OtoKomut] Giriş komutu çalıştırılıyor: ${command}`));
                    bot.chat(command); 
                } catch {}
            }, commandDelay);
            commandDelay += 2500;
        });
    }

    setTimeout(() => {
        console.log(chalk.yellow("Otomatik sistemler ve aralıklar başlatılıyor..."));
        rl.prompt(true);

        if (survivalInterval) clearInterval(survivalInterval);
        if (config.Ozellikler.OtoKomut.TekrarliKomutlar.Etkin) {
            const repeatingCommand = config.Ozellikler.OtoKomut.TekrarliKomutlar.Komut;
            const repeatingInterval = config.Ozellikler.OtoKomut.TekrarliKomutlar.Aralik;
            console.log(chalk.blue(`[OtoKomut] Tekrarlı komut (${repeatingCommand}) ${repeatingInterval / 1000} saniyede bir çalışacak.`));
            survivalInterval = setInterval(() => {
                try { if(global.bot) global.bot.chat(repeatingCommand); } catch {}
            }, repeatingInterval);
        }

        if (autoMessageInterval) clearInterval(autoMessageInterval);
        if (config.Ozellikler.OtoMesaj.Etkin) {
            console.log(chalk.blue(`[OtoMesaj] Otomatik mesaj sistemi ${config.Ozellikler.OtoMesaj.Aralik / 1000} saniyede bir çalışacak.`));
            autoMessageInterval = setInterval(sendAutoMessage, config.Ozellikler.OtoMesaj.Aralik);
        }

        if (antiAfkInterval) clearInterval(antiAfkInterval);
        if (config.Ozellikler.GelistirilmisAntiAFK.Etkin) {
            console.log(chalk.blue(`[AntiAFK] Gelişmiş Anti-AFK sistemi ${config.Ozellikler.GelistirilmisAntiAFK.Aralik / 1000} saniyede bir çalışacak şekilde ayarlandı.`));
            antiAfkInterval = setInterval(performAdvancedAntiAfk, config.Ozellikler.GelistirilmisAntiAFK.Aralik);
        }

        if (healthCheckInterval) clearInterval(healthCheckInterval);
        if (config.Ozellikler.OtomatikBeslenme.Etkin) {
            console.log(chalk.blue(`[AutoEat] Otomatik beslenme sistemi 10 saniyede bir çalışacak şekilde ayarlandı.`));
            healthCheckInterval = setInterval(checkHealthAndEat, 10000);
        }

        if (safetyCheckInterval) clearInterval(safetyCheckInterval);
        if (config.Ozellikler.Guvenlik.DusukCanUyarisi.Etkin || config.Ozellikler.Guvenlik.BoslukKorumasi.Etkin) {
            console.log(chalk.blue(`[Guvenlik] Can ve güvenlik sistemi 2 saniyede bir çalışacak şekilde ayarlandı.`));
            safetyCheckInterval = setInterval(checkSafety, 2000);
        }
    }, 8000); 
  });

  bot.on("message", (jsonMsg, position) => {
    const messageString = jsonMsg.toString();
    if (position === 'game_info' || !messageString.trim()) return;

    logChatMessage(messageString);

    try {
      const messageText = jsonMsg.toAnsi();
      console.log(messageText);
    } catch { console.log(messageString); }
    rl.prompt(true);

    // --- MSG Command Regex ---
    const msgRegex = /MESAJ ⇴ (\w+) adlı oyuncudan ➜ (.*)/;
    const msgMatch = messageString.match(msgRegex);

    if (msgMatch) {
        const username = msgMatch[1];
        const message = msgMatch[2].trim();

        if (config.Ozellikler.KomutSistemi.Etkin &&
            username.toLowerCase().trim() === currentAccount.sahip.toLowerCase().trim() &&
            message.startsWith(config.Ozellikler.KomutSistemi.OnEk)) {
            
            console.log(chalk.green(`[KomutSistemi] Sahip (${username}) tarafından özel mesajla komut algılandı: ${message}`));
            
            const prefix = config.Ozellikler.KomutSistemi.OnEk;
            const args = message.substring(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            handleCommand(command, args, username);
            return; // Command handled, stop processing
        }
    }

    // --- Public Chat Regex ---
    const chatRegex = /.*?(\w+)\s»\s(.*)/;
    const chatMatch = messageString.match(chatRegex);

    if (chatMatch) {
        const username = chatMatch[1];
        const message = chatMatch[2].trim();

        // Auto-Responder
        if (config.Ozellikler.OtomatikCevaplayici.Etkin && 
            message.toLowerCase().includes(currentAccount.kullaniciAdi.toLowerCase()) &&
            username.toLowerCase() !== currentAccount.kullaniciAdi.toLowerCase()) {
            
            console.log(chalk.green(`[OtoCevap] ${username} tarafından bot etiketlendi.`));
            bot.chat(config.Ozellikler.OtomatikCevaplayici.Mesaj);
            return; 
        }

        // Welcome Message

    }
  });

  bot.on("error", (err) => {
      console.log(chalk.red("Kritik bir hata oluştu:", err.message));
  });

  bot.on("end", (reason) => {
    if (reconnectTimer) return; 

    console.log(chalk.red(`Bağlantı sonlandı. Sebep: ${reason || 'Bilinmeyen'}`));

    if (global.bot) {
        global.bot.removeAllListeners();
    }
    if (antiAfkInterval) clearInterval(antiAfkInterval);
    if (survivalInterval) clearInterval(survivalInterval);
    if (healthCheckInterval) clearInterval(healthCheckInterval);
    if (safetyCheckInterval) clearInterval(safetyCheckInterval);
    if (autoMessageInterval) clearInterval(autoMessageInterval);
    antiAfkInterval = null;
    survivalInterval = null;
    healthCheckInterval = null;
    safetyCheckInterval = null;
    autoMessageInterval = null;
    global.bot = null;
    
    console.log(chalk.yellow(`${reconnectDelay / 1000} saniye içinde yeniden bağlanılıyor...`));
    
    reconnectTimer = setTimeout(() => {
      startBot();
      reconnectTimer = null; 
    }, reconnectDelay);
  });
}

async function main() {
    const accountName = process.argv[2];

    let accounts = [];
    const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');
    try {
        if (fs.existsSync(ACCOUNTS_FILE)) {
            accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
        } else {
            console.log(chalk.red('HATA: accounts.json dosyası bulunamadı. Lütfen accounts.json.example dosyasını kopyalayıp adını accounts.json olarak değiştirin ve içini doldurun.'));
            process.exit(1);
        }
    } catch (e) {
        console.log(chalk.red('HATA: accounts.json dosyası okunamadı veya bozuk.'));
        process.exit(1);
    }

    if (accounts.length === 0) {
        console.log(chalk.red('HATA: accounts.json dosyasında hiç hesap bulunamadı.'));
        process.exit(1);
    }

    let accountToRun;
    if (accountName) {
        accountToRun = accounts.find(acc => acc.hesapAdi.toLowerCase() === accountName.toLowerCase());
    } else {
        console.log("Başlatılacak bir hesap adı belirtilmedi.");
        console.log("Lütfen aşağıdaki listeden bir hesap seçin:");
        accounts.forEach((acc, index) => {
            console.log(`${index + 1}: ${acc.hesapAdi} (${acc.kullaniciAdi})`);
        });

        const answer = await new Promise(resolve => {
            rl.question('Lütfen başlatmak istediğiniz hesabın numarasını girin: ', resolve);
        });
        
        const accountIndex = parseInt(answer, 10) - 1;
        if (isNaN(accountIndex) || !accounts[accountIndex]) {
            console.log(chalk.red("Geçersiz seçim. Program sonlandırılıyor."));
            process.exit(1);
        }
        accountToRun = accounts[accountIndex];
    }

    if (!accountToRun) {
        console.log(chalk.red(`HATA: accounts.json içinde "${accountName}" adına sahip bir hesap bulunamadı.`));
        process.exit(1);
    }

    currentAccount = accountToRun;
    


    console.log(chalk.green(`'${currentAccount.hesapAdi}' hesabı başlatılıyor...`));

    await checkForUpdates(); 
    setInterval(checkForUpdates, 1800000); 

    startBot();
}

main();
