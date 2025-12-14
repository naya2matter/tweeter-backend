# 🐦 Tweeter Backend

مشروع **Tweeter Backend** هو تطبيق Backend (API) مبني باستخدام **Next.js** و **Prisma ORM**،
ويتصل بقاعدة بيانات **MySQL** مستضافة على **Railway**، مع نشر التطبيق على **Vercel**.

المشروع يوفّر وظائف أساسية مثل تسجيل المستخدمين (Register) والتعامل مع قاعدة البيانات بطريقة آمنة وحديثة.

---

## 🚀 طريقة التشغيل محليًا

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/naya2matter/tweeter-backend.git
cd tweeter-backend
```

---

### 2️⃣ تثبيت الحزم

```bash
npm install
```

---

### 3️⃣ إعداد متغيرات البيئة

أنشئ ملف باسم `.env` في جذر المشروع، ثم أضف:


```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@interchange.proxy.rlwy.net:38060/railway"
```
> ⚠️ لا تقم برفع ملف `.env` إلى GitHub.


---

### 4️⃣ إعداد Prisma


```bash
npx prisma migrate deploy
```

أو أثناء التطوير:

```bash
npx prisma db push
```

---

### 5️⃣ تشغيل المشروع محليًا

```bash
npm run dev
```

سيتوفر السيرفر على:

```
http://localhost:3000
```

---

## 🧪 اختبار الـ API

يمكنك استخدام **Postman** لاختبار الـ endpoints مثل:

```
POST http://localhost:3000/api/register
```

---

## 🖥️ Prisma Studio

لعرض البيانات مباشرة من قاعدة البيانات:

```bash
npx prisma studio
```

سيتم فتح الواجهة على:

```
http://localhost:5555
```

---

## 🌐 النشر على Vercel

1. اربط المشروع مع GitHub.
2. أثناء الإعداد على Vercel، أضف متغير البيئة التالي:

```
Name: DATABASE_URL
Value: mysql://root:YOUR_PASSWORD@interchange.proxy.rlwy.net:38060/railway
```

3. اضغط **Deploy**.

بعد النشر، ستحصلين على رابط مثل:

```
https://tweeter-backend.vercel.app
```

---

## 🧩 التقنيات المستخدمة

* **Next.js** (API Routes)
* **Prisma ORM**
* **MySQL** (Railway)
* **Vercel**
* **Postman** (للاختبار)

---

## 👩‍💻 المطوّرة

* الاسم: (NAYA MATTER)
* GitHub: [tweeter-backend](https://github.com/naya2matter/tweeter-backend)
* Vercel: https://tweeter-backend-sandy.vercel.app/


---

✨ هذا المشروع جزء من التعلّم العملي على بناء Backends حديثة باستخدام Prisma و Cloud Databases.
