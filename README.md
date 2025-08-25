# Hedef Filo Assessment
Bu proje, araç kiralama şirketi için geliştirilmiş bir vaka takip sistemi monorepo'sudur.

## Database: MongoDB Atlas (Cloud)
Bu proje **MongoDB Atlas** (bulut veritabanı) kullanmaktadır. Local MongoDB kurulumu **gerekli değildir**.

### Atlas Connection Bilgileri:
- **Database Name**: `hedef-filo`
- **Connection String**: `mongodb+srv://kullanici:1234@cluster0.fgrbsuz.mongodb.net/hedef-filo`
- **Username**: `kullanici`
- **Password**: `1234`
- **Access**: Read-only (güvenlik için sadece okuma yetkisi)

### Mevcut Veriler (Hazır Test Datası):
- **Cases**: 9 vaka kaydı
- **Customers**: 4 müşteri 
- **Suppliers**: 9 tedarikçi
- **Notifications**: 17 bildirim
- **Case Types**: 2 tip (Accident, Damage)
- **Status Codes**: 3 durum (Open, In Progress, Completed)
- **Surveys**: 3 memnuniyet anketi
## Proje Yapısı
```
hedef-filo-assesment/
├── backend/                 # Express + MongoDB API Server
│   ├── server.js           # Ana server dosyası
│   ├── routes/             # API route'ları
│   ├── models/             # MongoDB modelleri
│   └── package.json        # Backend dependencies
├── frontend/                # React Native (Expo) mobil uygulama
│   ├── App.tsx             # Ana uygulama bileşeni
│   ├── src/                # Kaynak kodlar
│   │   ├── screens/        # Ekranlar
│   │   ├── components/     # Bileşenler
│   │   ├── hooks/          # Custom hooks
│   │   ├── navigation/     # Navigasyon
│   │   └── context/        # Context API
│   └── package.json        # Frontend dependencies
└── README.md               # Bu dosya
```
## Kurulum ve Çalıştırma

### Hızlı Başlangıç (Tek Komut)
```bash
# GitHub'dan projeyi klonla
git clone https://github.com/burotring/hedef-filo-case-study.git
cd hedef-filo-case-study

# Her şeyi otomatik başlat
./start.sh
```
Bu script otomatik olarak backend ve UI'yi kurup başlatır!

### Manuel Kurulum
#### 1. Proje İndirme
```bash
# GitHub'dan projeyi klonla
git clone https://github.com/burotring/hedef-filo-case-study.git
cd hedef-filo-case-study
```
#### 2. Backend Kurulumu (Atlas ile)
```bash
# Backend klasörüne git
cd hedef-filo-backend

# Dependencies yükle
npm install

# Server'ı başlat
npm start
```

**Not**: MongoDB kurulumu ve .env dosyası oluşturma gerekli değil! Atlas'a otomatik bağlanır.

Backend `http://localhost:4000` adresinde çalışacak.

### Test Backend Bağlantısı:
```bash
# Backend'in çalışıp çalışmadığını test et
curl http://localhost:4000/
# Sonuç: {"ok":true}

# Atlas'tan veri çekmeyi test et
curl http://localhost:4000/cases
# Sonuç: 9 vaka kaydı dönecek

curl "http://localhost:4000/notifications?customerId=CUST001"
# Sonuç: CUST001 müşterisinin bildirimler dönecek
```
#### 3. Frontend Kurulumu
```bash
# Yeni terminal aç, UI klasörüne git
cd hedef-filo-UI
# Dependencies yükle
npm install
# .env dosyası opsiyonel (otomatik IP detection çalışır)
# Expo uygulamasını başlat
npm run start
```
Expo uygulaması `http://localhost:8081` adresinde çalışacak.
### . Mobil Cihazda Test
**IP Adresi Otomatik Ayarlanır:**
- Android: Expo'nun otomatik IP detection'ı kullanılır
- iOS: localhost kullanılır
- Web: localhost kullanılır
**Manuel IP Ayarı (Opsiyonel):**
```bash
# Frontend .env dosyasında
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```
**Test Adımları:**
1. Backend'i başlat (`npm run dev`)
2. Frontend'i başlat (`npm run start`)
3. QR kodu scan et veya emulator kullan
## Teknolojiler
### Backend
- **Node.js** + **Express.js** - Web framework
- **MongoDB Atlas** + **Mongoose** - Cloud veritabanı ve ODM
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server
- **Socket.IO** - Real-time iletişim
### Frontend
- **React Native** + **Expo** - Cross-platform mobil uygulama
- **TypeScript** - Type safety
- **React Navigation** - Screen navigation
- **Context API** - State management
- **Axios** - HTTP client
- **Ionicons** - Icon set
## Uygulama Özellikleri
### Müşteri Özellikleri
- Vaka oluşturma ve takip
- Durum geçmişi görüntüleme
- Müşteri memnuniyet anketi
- Bildirim sistemi
### Admin Özellikleri
- Tüm vakaları görüntüleme
- Vaka durumu güncelleme
- Vaka silme
- İstatistikler
## Admin Girişi
- **Username**: `admin`
- **Password**: `admin123`
## API Endpoints
### Cases
- `GET /cases` - Tüm vakaları getir
- `POST /cases` - Yeni vaka oluştur
- `GET /cases/:id` - Vaka detayı getir
- `PUT /cases/:id/status` - Vaka durumu güncelle
- `DELETE /cases/:id` - Vaka sil
### Surveys
- `GET /surveys` - Tüm anketleri getir
- `POST /surveys` - Yeni anket oluştur
### Notifications
- `GET /notifications` - Bildirimleri getir
- `PUT /notifications/:id/read` - Bildirimi okundu olarak işaretle
## Gereksinimler
- Node.js 18+
- **İnternet bağlantısı** (Atlas için)
- Expo CLI  
- iOS Simulator veya Android Emulator

**Not**: MongoDB kurulumu gerekli değil! Atlas cloud database kullanılıyor.
## Environment Variables
### Backend (.env) - İsteğe Bağlı
```bash
# MongoDB Atlas otomatik bağlanır, .env dosyası gerekli değil
# İsteğe bağlı olarak özelleştirme için:
MONGODB_URI=mongodb+srv://kullanici:1234@cluster0.fgrbsuz.mongodb.net/hedef-filo?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
```

**MongoDB Atlas Otomatik Bağlantı:**
- .env dosyası oluşturmanıza gerek yok
- Atlas'a otomatik bağlanır
- Internet bağlantısı gerekli
- Hazır test verileri mevcut
### Frontend (.env)
```bash
# API URL (Otomatik detection varsayılan)
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```
## Önemli Notlar

### Database (MongoDB Atlas)
- **Bulut veritabanı**: Local MongoDB kurulumu gerekli değil
- **Hazır test datası**: 64 kayıt mevcut (9 vaka, 4 müşteri, 17 bildirim, vb.)
- **Read-only access**: Güvenlik için sadece okuma yetkisi
- **İnternet gerekli**: Atlas cloud service kullanıyor

### Uygulama Özellikleri  
- **Otomatik IP Detection**: Frontend IP adresini otomatik bulur
- **Cross-Platform**: Android, iOS, Web'de çalışır  
- **Environment Variables**: `.env` dosyaları ile kolay yapılandırma
- **Real-time**: Socket.IO ile canlı güncellemeler
- **API Testing**: curl komutları ile test edilebilir

### Güvenlik
- **Read-only database**: Veri değiştirme işlemleri çalışmaz
- **Assessment amaçlı**: Sadece okuma ve test için
- **Geçici erişim**: Değerlendirme süresi boyunca aktif

## Hızlı Test
```bash
# 1. Backend'i başlat
cd hedef-filo-backend
npm install
npm start

# 2. Yeni terminalde test et
curl http://localhost:4000/
curl http://localhost:4000/api/cases
curl "http://localhost:4000/api/notifications?customerId=CUST001"

# 3. Frontend'i başlat  
cd ../hedef-filo-UI
npm install
npm start
```
