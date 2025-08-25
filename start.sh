#!/bin/bash

echo "🚀 Hedef Filo Uygulaması Başlatılıyor..."

# .env dosyasını backend'e kopyala
if [ ! -f "hedef-filo-backend/.env" ]; then
    cat > hedef-filo-backend/.env << 'EOF'
# MongoDB Atlas Bağlantısı
MONGODB_URI=mongodb+srv://kullanici:1234@cluster0.fgrbsuz.mongodb.net/hedef-filo?retryWrites=true&w=majority&appName=Cluster0

# Backend Ayarları
PORT=4000
NODE_ENV=development

# Twilio SMS Ayarları (İsteğe bağlı)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Webhook URL'leri (İsteğe bağlı)
CRM_WEBHOOK_URL=https://your-crm-system.com/webhooks/hedef-filo
SUPPLIER_WEBHOOK_URL=https://your-supplier-system.com/webhooks/hedef-filo
EOF
    echo "✅ .env dosyası oluşturuldu"
fi

# Backend dependencies
echo "📦 Backend bağımlılıkları yükleniyor..."
cd hedef-filo-backend
npm install

# Backend'i başlat
echo "🖥️  Backend başlatılıyor..."
npm run dev &
BACKEND_PID=$!

# UI dependencies
echo "📦 UI bağımlılıkları yükleniyor..."
cd ../hedef-filo-UI
npm install

# UI'yi başlat
echo "📱 UI başlatılıyor..."
npm run start

# Cleanup on exit
trap 'kill $BACKEND_PID' EXIT
