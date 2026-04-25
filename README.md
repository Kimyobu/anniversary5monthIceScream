# 🍦 Dreamy Scoops — Ice Cream Shop Game

เกมร้านไอศกรีม สไตล์ชมพูพาสเทล

## 📁 โครงสร้างไฟล์

```
icecream-game/
├── index.html       ← หน้าเกม (HTML)
├── style.css        ← สไตล์ทั้งหมด
├── script.js        ← โค้ดเกม + config
└── README.md        ← ไฟล์นี้
```

## ⚙️ การตั้งค่าสำคัญ (script.js)

เปิดไฟล์ `script.js` หาบล็อก CONFIG ด้านบนสุด:

```js
const CONFIG = {
  totalCustomers:  10,       // จำนวนลูกค้าที่ต้องเสิร์ฟ
  timerSeconds:    18,       // เวลาต่อออเดอร์ (วินาที)
  redirectDelay:   3000,     // ms ก่อน redirect (หลัง win)

  // 🔗 ใส่ URL ซัปไพรส์ตรงนี้!
  redirectUrl: 'https://YOUR_SURPRISE_URL_HERE',
};
```

### 👉 วิธีใส่ URL ซัปไพรส์
แก้บรรทัดนี้ใน `script.js`:
```js
redirectUrl: 'https://username.github.io/surprise-page',
```

## 🚀 Deploy บน GitHub Pages

1. สร้าง repo ใหม่ใน GitHub
2. อัปโหลดไฟล์ทั้ง 3 (`index.html`, `style.css`, `script.js`)
3. ไปที่ Settings → Pages → Source: main branch
4. รอประมาณ 1-2 นาที แล้วเข้าได้เลย!

## 🎮 การเล่น

1. กด **เริ่มขาย!** เพื่อเริ่มเกม
2. ดูออเดอร์ที่ลูกค้าสั่ง (📋 ออเดอร์)
3. กดไอศกรีมจากเมนูด้านล่างเพื่อใส่ถาด
4. กด **เสิร์ฟ!** เมื่อใส่ครบตามออเดอร์
5. เสิร์ฟให้ครบ 10 คน → **สำเร็จแล้ว!** → redirect ✨

## 💡 Tips

- คลิกที่ไอศกรีมในถาดเพื่อเอาออก
- เสิร์ฟเร็วได้ bonus +50 คะแนน
- หมดเวลา = Game Over ต้องเล่นใหม่
