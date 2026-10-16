# Google Login Setup — EduBazar.shop

Code ready hai (`Continue with Google` button login/register pages pe, `/auth/callback` page, `/api/auth/google` verification). Lekin Google login chalane ke liye **2 jagah manual setup** karna padega — ye steps sirf tum kar sakte ho:

## Step 1: Google Cloud Console me OAuth Client banao (10 min)

1. https://console.cloud.google.com → naya project banao (ya existing select karo)
2. **APIs & Services** → **OAuth consent screen** → User type: **External** → App name: `EduBazar.shop`, support email apni daalo → Scopes: `email`, `profile` add karo → Save
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID** → Application type: **Web application**
4. **Authorized redirect URIs** me ye add karo (apne Supabase project ka URL daal ke):
   ```
   https://<tumhara-project-ref>.supabase.co/auth/v1/callback
   ```
   (Project ref: Supabase dashboard → Project Settings → General → Reference ID)
5. **Create** dabao → **Client ID** aur **Client secret** copy kar lo

## Step 2: Supabase Dashboard me Google Provider ON karo (5 min)

1. https://supabase.com/dashboard → apna project kholo
2. **Authentication** → **Providers** → **Google** → **Enable** toggle ON
3. Upar copy kiya hua **Client ID** aur **Client secret** paste karo → **Save**
4. **Authentication** → **URL Configuration** → **Redirect URLs** me ye dono add karo:
   ```
   https://www.edubaazar.shop/auth/callback
   https://edubaazar.shop/auth/callback
   ```
5. **Save**

## Step 3: Test karo

1. Site kholo → **Login** page → **Continue with Google** dabao
2. Apna Google account select karo → wapas site pe redirect hoga → `/account` khulna chahiye logged-in state me
3. Agar error aaye to browser console ya `/auth/callback` page pe message dikhega

## Kaise kaam karta hai (technical)

- Button dabane pe Supabase Google OAuth (PKCE flow) start hota hai
- Google se wapas `/auth/callback` pe aate hain → code exchange → Supabase session
- `access_token` ko `/api/auth/google` pe bheja jata hai → **server Supabase se token verify karta hai** (client pe bharosa nahi)
- Verify hone pe `users` table me entry banti hai (password = unusable hash — Google wale users password se login nahi kar sakte)
- Phir normal app session (localStorage) ban jata hai — baki sab kuch (cart, orders, checkout) waise hi kaam karta hai

## Zaroori note

- Google login ke liye `NEXT_PUBLIC_SUPABASE_URL` aur `NEXT_PUBLIC_SUPABASE_ANON_KEY` Vercel env me set hone chahiye (ye pehle se honge, kyunki site Supabase use karti hai)
- Purane email+password users waise hi login kar sakte hain — kuch nahi badla unke liye
