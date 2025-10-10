# Crage Network Console Client

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

Bu proje, Crage Network sunucusuna bot olarak bağlanmak için tasarlanmış basit bir konsol istemcisidir. Mineflayer kütüphanesi kullanılarak geliştirilmiştir ve çeşitli otomatik özellikler sunar.

## Özellikler

Bot, `configuration.json` dosyası üzerinden yapılandırılabilen aşağıdaki özelliklere sahiptir:

*   **Sohbet Kaydı (`SohbetLog`):** Tüm sohbeti `sohbet-gecmisi` klasörüne kaydeder.
*   **Gelişmiş Anti-AFK (`GelistirilmisAntiAFK`):** Botun AFK olarak algılanmasını engellemek için rastgele hareketler yapar. Hareket aralığı yapılandırılabilir.
*   **Otomatik Beslenme (`OtomatikBeslenme`):** Botun açlık seviyesi belirli bir değerin altına düştüğünde otomatik olarak yemek yemesini sağlar.
*   **Otomatik Cevaplayıcı (`OtomatikCevaplayici`):** Sohbette botun adı geçtiğinde otomatik olarak önceden tanımlanmış bir mesaj gönderir.
*   **Komut Sistemi (`KomutSistemi`):** Belirlenen sahip kullanıcısının bota oyun içinden komut vermesini sağlar. Komut ön eki yapılandırılabilir (örneğin: `!`).
*   **Güvenlik (`Guvenlik`):**
    *   **Düşük Can Uyarısı (`DusukCanUyarisi`):** Botun canı belirli bir seviyenin altına düştüğünde sahibine özel mesaj gönderir.
    *   **Boşluk Koruması (`BoslukKorumasi`):** Bot belirli bir Y seviyesinin altına düşerse sunucudan ayrılır.
*   **Otomatik Komut (`OtoKomut`):**
    *   **Giriş Komutları (`GirisKomutlari`):** Sunucuya her katıldığında bir defaya mahsus çalıştırılacak komutlar.
    *   **Tekrarlı Komutlar (`TekrarliKomutlar`):** Belirtilen aralıklarla sürekli tekrarlanacak komutlar.
*   **Yeniden Bağlanma (`YenidenBaglanma`):** Sunucuyla bağlantı koptuğunda otomatik yeniden bağlanma ayarları (gecikme süreleri).
*   **Otomatik Mesaj (`OtoMesaj`):** Belirtilen aralıklarla, sırayla bir mesaj listesi gönderir. Sohbet botu gibi kullanılabilir.
*   **Otomatik Güncelleme (`Guncelleme`):** Botun kendi GitHub deposundan otomatik olarak güncellenmesini sağlar. Etkinleştirilebilir ve depo URL'si yapılandırılabilir.

## Gereksinimler

*   [Node.js](https://nodejs.org/) (LTS sürümü önerilir)

## Kurulum

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/Propenthia34/Crage-Network-Console-Client.git
    cd Crage-Network-Console-Client
    ```
2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

## Yapılandırma

Botun davranışını özelleştirmek için iki ana yapılandırma dosyası bulunmaktadır:

### `accounts.json`

Bu dosya, botun bağlanacağı Minecraft hesaplarının bilgilerini içerir. `accounts.json.example` dosyasını kopyalayıp adını `accounts.json` olarak değiştirin ve aşağıdaki formatta hesap bilgilerinizi girin:

```json
[
  {
    "hesapAdi": "Botunuzun Adı",
    "kullaniciAdi": "Minecraft Kullanıcı Adınız",
    "sifre": "Minecraft Şifreniz",
    "sahip": "Botu kontrol edecek kişinin oyun içi kullanıcı adı"
  }
]
```

**Önemli:** `accounts.json` dosyası `.gitignore` tarafından göz ardı edilir ve GitHub'a yüklenmez. Bu, hesap bilgilerinizin güvende kalmasını sağlar.

### `configuration.json`

Bu dosya, botun çeşitli özelliklerini ve ayarlarını içerir. `DEFAULT_CONFIG` ile birleştirme mantığı sayesinde, yeni eklenen ayarlar otomatik olarak dosyanıza dahil edilirken, mevcut ayarlarınız korunur.

Örnek bir yapılandırma:

```json
{
  "_comment_Sunucu": "Botun bağlanacağı Minecraft sunucusunun sürüm bilgisi.",
  "Sunucu": {
    "Surum": "1.21.4"
  },
  "_comment_Ozellikler": "Botun çeşitli özelliklerini açıp kapatabileceğiniz ve ayarlayabileceğiniz bölüm.",
  "Ozellikler": {
    "_comment_SohbetLog": "True ise, tüm sohbeti 'sohbet-gecmisi' klasörüne kaydeder.",
    "SohbetLog": true,
    "_comment_GelistirilmisAntiAFK": "Botun AFK olarak algılanmasını engellemek için rastgele hareketler yapmasını sağlar.",
    "GelistirilmisAntiAFK": {
      "Etkin": true,
      "_comment_Aralik": "Milisaniye cinsinden ne kadar sürede bir hareket yapılacağı (120000 = 2 dakika).",
      "Aralik": 120000
    },
    "_comment_OtomatikBeslenme": "Bot acıktığında otomatik olarak yemek yemesini sağlar.",
    "OtomatikBeslenme": {
      "Etkin": true,
      "_comment_AclikSeviyesi": "Açlık seviyesi bu değerin altına düştüğünde bot yemek yer (Max: 20).",
      "AclikSeviyesi": 19
    },
    "_comment_OtomatikCevaplayici": "Sohbette botun adı geçtiğinde otomatik olarak mesaj atar.",
    "OtomatikCevaplayici": {
      "Etkin": true,
      "Mesaj": "Merhaba, ben bir botum. Sahibim şu an burada değil."
    },
    "_comment_KomutSistemi": "Sahip kullanıcısının bota oyun içinden komut vermesini sağlar.",
    "KomutSistemi": {
      "Etkin": true,
      "_comment_OnEk": "Komutların başına gelecek olan karakter (örneğin: !at).",
      "OnEk": "!"
    },
    "_comment_Guvenlik": "Botun canını ve pozisyonunu kontrol eden güvenlik özellikleri.",
    "Guvenlik": {
      "DusukCanUyarisi": {
        "Etkin": true,
        "_comment_CanSeviyesi": "Botun canı bu değerin altına düştüğünde sahibine özel mesaj atar (Max: 20).",
        "CanSeviyesi": 10
      },
      "BoslukKorumasi": {
        "Etkin": true,
        "_comment_Yukseklik": "Bot bu Y seviyesinin altına düşerse sunucudan atılır.",
        "Yukseklik": 0
      }
    },
    "_comment_OtoKomut": "Bota, sunucuya her katıldığında veya periyodik olarak otomatik komutlar yazdırma.",
    "OtoKomut": {
      "_comment_GirisKomutlari": "Sunucuya girildiğinde bir defaya mahsus, sırayla çalıştırılacak komutlar.",
      "GirisKomutlari": {
        "Etkin": true,
        "Komutlar": [
          "/server survival"
        ]
      },
      "_comment_TekrarliKomutlar": "Belirtilen aralıkla sürekli tekrarlanacak komut.",
      "TekrarliKomutlar": {
        "Etkin": true,
        "_comment_Aralik": "Milisaniye cinsinden tekrarlama aralığı (30000 = 30 saniye).",
        "Aralik": 30000,
        "Komut": "/survival"
      }
    },
    "_comment_YenidenBaglanma": "Sunucuyla bağlantı koptuğunda yeniden bağlanma ayarları.",
    "YenidenBaglanma": {
      "_comment_Gecikme": "Milisaniye cinsinden varsayılan yeniden bağlanma gecikmesi (5000 = 5 saniye).",
      "Gecikme": 5000,
      "_comment_HizliGirisGecikmesi": "Sunucu 'çok hızlı giriş' hatası verdiğinde beklenecek süre (30000 = 30 saniye).",
      "HizliGirisGecikmesi": 30000
    },
    "_comment_OtoMesaj": "Belirtilen aralıklarla, sırayla bir mesaj listesi gönderir. Sohbet botu gibi kullanılabilir.",
    "OtoMesaj": {
      "Etkin": false,
      "_comment_Aralik": "Milisaniye cinsinden her mesaj arasındaki bekleme süresi (10000 = 10 saniye).",
      "Aralik": 10000,
      "_comment_Mesajlar": "Sırayla gönderilecek mesajların listesi.",
      "Mesajlar": [
        "1. otomatik mesaj",
        "2. otomatik mesaj",
        "3. otomatik mesaj"
      ]
    },
    "_comment_Guncelleme": "Otomatik güncelleme ayarları. ",
    "Guncelleme": {
      "Etkin": true,
      "RepoURL": "Propenthia34/Crage-Network-Console-Client"
    }
  }
}
```

## Kullanım

Botu başlatmak için aşağıdaki yöntemlerden birini kullanabilirsiniz.

1.  **`start.bat` dosyasını çalıştırmak (Windows için):**
    ```bash
    start.bat
    ```
2.  **npm kullanarak başlatmak (Tüm platformlar):**
    ```bash
    npm start
    ```

Bot başlatıldığında, `accounts.json` dosyasında tanımlı hesaplar listelenecek ve başlatmak istediğiniz hesabın numarasını girmeniz istenecektir.

### Oyun İçi Komutlar

`configuration.json` dosyasında `KomutSistemi.OnEk` ile tanımlanan ön ek (varsayılan `!`) kullanılarak botunuza oyun içinden komutlar verebilirsiniz. Örnek komutlar:

*   `!envanter`: Botun envanterini gösterir.
*   `!at <eşya_adı> [miktar]`: Belirtilen eşyayı botun envanterinden atar.
*   `!mesaj <kullanıcı> <mesaj>`: Belirtilen kullanıcıya özel mesaj gönderir.
*   `!kaz`: Botun altındaki bloğu kazar.

## Otomatik Güncelleme

Bot, `configuration.json` dosyasındaki `Ozellikler.Guncelleme.Etkin` ayarı `true` ise otomatik olarak güncellemeleri kontrol eder ve uygular. Güncelleme sırasında `configuration.json` ve `accounts.json` dosyalarınızdaki ayarlarınız korunur.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.
