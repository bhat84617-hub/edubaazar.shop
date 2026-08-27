# EduBazar Admin Panel - Quick Setup

## What's New ✨

Your admin panel has been **completely revamped**:

✅ **Improved Admin Dashboard** - Better UI, clearer order status  
✅ **Download URL Management** - Add download links for each course during approval  
✅ **Email Notifications** - Students get download links via email + dashboard  
✅ **Payment Verification** - See UTR and customer details clearly  
✅ **Complete Workflow** - Purchase → Verify → Approve → Download  

---

## 📝 Files Changed

1. **`src/app/admin/page.tsx`** - New admin dashboard UI with download URL inputs
2. **`src/app/api/admin/orders/approve/route.ts`** - Updated approval API
3. **`.env.example`** - Environment variables template
4. **`DEPLOYMENT_GUIDE_HINDI.md`** - Complete setup guide in Hindi

---

## 🚀 Quick Start

### 1. Copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

### 2. Fill in your environment variables

Edit `.env.local`:

```env
ADMIN_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=your_32_char_random_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Then visit: `http://localhost:3000/admin/login`

### 4. Deploy to Vercel

See `DEPLOYMENT_GUIDE_HINDI.md` for complete Vercel deployment steps.

---

## 🎯 Admin Workflow

1. **Student buys a course** on `/shop`
   - Order created in Supabase
   - Admin gets email notification

2. **Admin logs in** to `/admin`
   - Sees "PENDING VERIFICATION" orders
   - Checks payment UTR
   - Enters download links for each course

3. **Admin clicks "YES - Approve & Send Download Links"**
   - Order status changes to "APPROVED"
   - Student gets email with download buttons
   - Download links appear in student's `/account` dashboard

4. **Student downloads the course**
   - From email link OR
   - From their dashboard

---

## 🔑 Environment Variables Explained

| Variable | What It Does | Where to Get |
|----------|---|---|
| `ADMIN_PASSWORD` | Admin login password | You decide |
| `ADMIN_SESSION_SECRET` | Session security token | Generate random 32+ chars |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database key | Supabase → Settings → API |
| `RESEND_API_KEY` | Email service | Resend → API Keys |

---

## ✅ Testing Checklist

- [ ] Admin login works (`/admin/login` → password enters)
- [ ] Admin dashboard loads (`/admin`)
- [ ] Can see pending orders
- [ ] Can enter download URLs
- [ ] Approval sends email to student
- [ ] Student gets download links in email
- [ ] Student sees courses in `/account` dashboard
- [ ] Download links work

---

## 📚 Full Documentation

See **`DEPLOYMENT_GUIDE_HINDI.md`** for:
- Complete Supabase setup
- Resend email configuration
- Vercel deployment steps
- Troubleshooting guide

---

## 🆘 Quick Troubleshooting

**Admin panel shows "Database not configured"?**
- Check `.env.local` has all Supabase variables
- Check Supabase `orders` table exists

**Emails not arriving?**
- Check `RESEND_API_KEY` is correct
- Check student email address is registered

**Approval button not working?**
- Make sure you've entered download links for ALL courses
- Check browser console for errors (F12)

---

## 📞 Support

For full setup help, refer to `DEPLOYMENT_GUIDE_HINDI.md`

Happy course selling! 🎉
