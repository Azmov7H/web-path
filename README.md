# Web Learning Platform (Next.js + Prisma)

منصة ويب متقدمة لإدارة وتقديم الدروس التعليمية، مبنية باستخدام **Next.js (App Router)** و **Prisma ORM** مع قاعدة بيانات **PostgreSQL**. المشروع مصمم ليكون قابلًا للتوسع، مناسب لمنصات SaaS التعليمية.

---

## 🚀 المميزات الرئيسية

* نظام كورسات ودروس احترافي
* ربط الدروس بالاختبارات (Quiz)
* إدارة المحتوى عبر API
* Prisma ORM مع PostgreSQL
* جاهز للتوسع (SaaS Ready)
* هيكلة نظيفة للـ Backend و Frontend

---

## 🧱 التقنيات المستخدمة

* **Next.js 16 (App Router)**
* **Prisma ORM**
* **PostgreSQL**
* **JavaScript (مع JSDoc)**
* **Node.js**

---

## 📂 هيكلة المشروع

```
web-learning-platform/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── courses/
│   │       ├── lessons/
│   │       └── quizzes/
│   ├── lib/
│   │   └── prisma.js
├── .env
├── package.json
└── README.md
```

---

## 🗄️ مخطط قاعدة البيانات (Prisma Schema)

### Course

```prisma
model Course {
  id        Int      @id @default(autoincrement())
  title     String
  slug      String   @unique
  lessons   Lesson[]
  createdAt DateTime @default(now())
}
```

### Lesson

```prisma
model Lesson {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  order     Int

  course    Course  @relation(fields: [courseId], references: [id])
  courseId  Int

  quiz      Quiz?
}
```

### Quiz (One-to-One)

```prisma
model Quiz {
  id        Int      @id @default(autoincrement())
  lesson    Lesson  @relation(fields: [lessonId], references: [id])
  lessonId  Int      @unique

  questions Question[]
}
```

### Question

```prisma
model Question {
  id        Int     @id @default(autoincrement())
  title     String
  options   String[]
  answer    String

  quiz      Quiz    @relation(fields: [quizId], references: [id])
  quizId    Int
}
```

---

## ⚙️ الإعداد والتشغيل

### 1️⃣ تثبيت الاعتمادات

```bash
npm install
```

### 2️⃣ إعداد متغيرات البيئة

أنشئ ملف `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/learning"
```

### 3️⃣ تهيئة Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 4️⃣ تشغيل المشروع

```bash
npm run dev
```

---

## 🔌 Prisma Client (Singleton)

```js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 📡 أمثلة API

### إنشاء درس

```http
POST /api/lessons
```

```json
{
  "title": "Intro to HTML",
  "content": "Basics of HTML",
  "courseId": 1
}
```

---

## 🧠 ملاحظات هندسية

* العلاقة بين Lesson و Quiz هي **One-to-One**
* كل درس يحتوي على اختبار واحد فقط
* التصميم يدعم إضافة نظام مستخدمين وخطط مدفوعة لاحقًا

---

## 🛠️ قابل للتطوير

* Authentication (NextAuth / JWT)
* Dashboard للإدارة
* نظام اشتراكات
* تتبع تقدم الطلاب

---

## 📄 الرخصة

هذا المشروع مخصص للاستخدام التعليمي والتجاري حسب الاتفاق مع العميل.

---

## ✨ تم التطوير بواسطة

**Ali Naji**

Frontend & Backend Developer
