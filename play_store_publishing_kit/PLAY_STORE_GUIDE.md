# Complete Google Play Store Publishing Guide 🚀
## App Name: Study Mode App Lock & Timer (Package: `com.applocktimer.pro`)

इस गाइड में आपको Google Play Store पर अपनी ऐप पब्लिश करने का पूरा आसान तरीका (Step-by-Step) बताया गया है।

---

## 📅 Quick Summary of What You Need (जरूरी चीजें)
1. **Google Play Console Account**: $25 One-time Registration Fee (requires Identity Verification like Passport/Aadhaar/PAN).
2. **Signed App Bundle (`.aab` file)**: आपके GitHub Actions में ऑटोमैटिकली बन चुका है। (Download instructions below).
3. **App Store Listing Assets**: HTML Privacy Policy, App Icon (512x512), Feature Graphic (1024x500), and Phone Screenshots.
4. **App Content Declarations**: Forms to fill on the Play Console (Ads, Content Rating, Data Safety, etc.).

---

## 🛠 Step 1: Download your Signed `.aab` & `.apk` from GitHub
आपका Android App Bundle (.aab) और APK सुरक्षित तरीके से आपके GitHub repository में बन चुका है। इसे डाउनलोड करने के लिए:

1. अपने **GitHub Repository (`App-lock`)** पेज पर जाएं।
2. ऊपर मेनू बार में **"Actions"** टैब पर क्लिक करें।
3. वहां `Build, Test & Package Android/Web` (या जो भी लेटेस्ट ग्रीन टिक वाला नाम हो) वाले रन पर क्लिक करें।
4. पेज में सबसे नीचे स्क्रॉल करें। वहां आपको **Artifacts** सेक्शन दिखेगा:
   - **`AppLockTimerPro-Signed-Release-AAB`**: इसे डाउनलोड करें और ज़िप अनज़िप करें। इस `.aab` फाइल को आपको डायरेक्ट Google Play Console पर अपलोड करना है।
   - **`AppLockTimerPro-Signed-Release-APK`**: इसे डाउनलोड करके आप डायरेक्ट अपने या अपने दोस्तों के फोन में इंस्टॉल करके टेस्ट कर सकते हैं।

---

## 🧑‍💻 Step 2: Open Google Play Console & Setup Account
1. [Google Play Console](https://play.google.com/console/signup) पर जाएं।
2. अपनी ईमेल आईडी चुनें और **Developer Account type** (Personal/Organization) सेलेक्ट करें।
3. **$25 ( approx ₹2,100)** की वन-टाइम रजिस्ट्रेशन फीस पे करें।
4. अपना **Identity Verification** पूरा करें (गवर्नमेंट आईडी अपलोड करके)।

---

## 📝 Step 3: Create App & Basic Configuration
1. Play Console लॉग इन करने के बाद, ऊपर दाईं ओर **"Create app"** बटन पर क्लिक करें।
2. निम्नलिखित डिटेल्स भरें:
   - **App Name**: `Study Mode App Lock & Timer` (या आपके पसंद का कोई भी नाम, Max 50 Characters).
   - **Default language**: `English (United States)`
   - **App or Game?**: `App`
   - **Free or Paid?**: `Free`
3. **Declarations** (Developer Guidelines, US Export Laws) चेकबॉक्स को टिक करें और नीचे **"Create app"** पर क्लिक करें।

---

## 📋 Step 4: App Content Configuration (The Most Critical Step!)
Play Console के बाएं साइड बार में स्क्रॉल करें और **Dashboard** पर क्लिक करें। वहां आपको **Set up your app** के अंदर स्टेप्स मिलेंगे:

### 1. Privacy Policy (प्राइवेसी पॉलिसी)
* **What to do**: Google App Locks के लिए बहुत सख्त है। प्राइवेसी पॉलिसी के बिना ऐप सस्पेंड हो जाता है।
* **Solution**: हमने आपके फोल्डर में एक कम्प्लीट, रेडीमेड प्राइवेसी पॉलिसी `Privacy_Policy.html` बना दी है। 
* **How to host**: आप इस पॉलिसी टेक्स्ट को कॉपी करके [Google Sites](https://sites.google.com/), [GitHub Gist](https://gist.github.com/), या किसी भी फ्री प्राइवेसी पॉलिसी जनरेटर होस्टिंग साइट पर डाल सकते हैं और उसका लिंक यहाँ पेस्ट कर दें।

### 2. App Access (ऐप एक्सेस)
* **Select**: `All functionality is available without special access` (अगर ऐप में कोई पासवर्ड/रजिस्ट्रेशन कम्पल्सरी लॉगिन नहीं है)।

### 3. Ads (विज्ञापन)
* **Select**: `No, my app does not contain ads` (अभी इस ऐप में कोड स्तर पर कोई विज्ञापन नहीं हैं)।

### 4. Content Rating (कंटेंट रेटिंग)
* **Click**: **Start questionnaire** पर क्लिक करें।
* **Email Address**: अपनी ईमेल डालें (e.g. `jitu1199pal@gmail.com`).
* **Category**: **Utility, Productivity, Communication, or Other** सेलेक्ट करें।
* **Questions Answer**: सभी प्रश्नों के उत्तर में **"No"** सेलेक्ट करें (क्योंकि ऐप में कोई हिंसा, नग्नता, या आपत्तिजनक सामग्री नहीं है)।
* **Save** करें, फिर **Calculate rating** करें और अंत में **Submit** करें।

### 5. Target Audience & Content (लक्ष्य दर्शक)
* **Select**: `13-15`, `16-17`, `18 and over` (13 साल और उससे अधिक उम्र के यूज़र्स)।
* **Could your store listing unintentionally appeal to children?**: Select **"No"**.

### 6. News Apps
* **Select**: `No, my app is not a news app`.

### 7. COVID-19 Contact Tracing
* **Select**: `My app is not a publicly available COVID-19 contact tracing app`.

### 8. Data Safety (डेटा सुरक्षा - बेहद जरूरी)
Google को बताना जरूरी है कि ऐप कौन सा डेटा कलेक्ट करता है। चूंकि ऐप लोकल `Room SQLite` डेटाबेस यूज़ करता है और कोई इंटरनेट बैकएंड या डेटा लीक नहीं है:
* **Does your app collect or share any of the required user data types?**: Select **"No"**.
* **Is all of the user data collected by your app encrypted in transit?**: Select **"Yes"** (या simple **No** रखें क्योंकि डेटा कलेक्ट ही नहीं होता)।
* **Submit Description**: "Our app is completely offline. We do not collect or share any user data. All locked app configurations, times, and user profiles are stored 100% locally on the device inside an encrypted sandbox."

### 9. Advertising ID
* **Select**: `No, my app does not use Advertising ID`.

---

## 🎨 Step 5: Beautiful Store Listing Assets Guide
Play Console में **Grow > Store Presence > Main store listing** पर जाएं:

1. **App Title**: `Study Mode App Lock & Timer`
2. **Short Description**: `Secure your apps with pin, pattern & customized smart timer control profiles!`
3. **Full Description**: (Use the fully prepared description from `/play_store_publishing_kit/Store_Listing_Details.txt`)
4. **App Icon (512x512 PNG)**: (Max 1MB, transparent background, solid shape design).
5. **Feature Graphic (1024x500 JPG/PNG)**: (Max 1MB, standard beautiful visual demonstrating Timer App Lock).
6. **Screenshots**: अपने फोन पर ऐप खोलें, 3-4 अच्छे स्क्रीनशॉट (App Lock screen, Timer Configuration screen, Settings page) लें और 16:9 या 9:16 रेश्यो में यहाँ अपलोड करें (Min 2, Max 8 screenshots required).

---

## 📦 Step 6: Upload the `.aab` & Publish to Testing or Production
Google Play Store पर डायरेक्ट पब्लिश करने से पहले नए ऐप्स के लिए गूगल `Closed Testing` (20 testers for 14 days) की मांग करता है।

1. बाएं साइडबार में **Release > Production** (या **Closed testing**) पर जाएं।
2. **"Create new release"** पर क्लिक करें।
3. **App bundles** सेक्शन में अपनी डाउनलोड की हुई **Signed Release `.aab`** फाइल को ड्रैग और ड्रॉप करें।
4. **Release Name**: `1.0 (1)`
5. **Release Notes**: 
   ```text
   - Initial production launch of Study Mode App Lock & Timer!
   - Secure apps with high-velocity pin/pattern protection.
   - Built-in session timers to combat smartphone addiction and schedule usage.
   - 100% secure, offline-first execution ensures privacy.
   ```
6. **Save** करें, फिर **Review release** पर क्लिक करें।
7. सभी चेक्स ग्रीन होने के बाद **"Start roll-out to Production"** (या Testing) दबाएं!

आपका ऐप Google Play Policy team के रिव्यु में जाएगा (इसमें आमतौर पर 2 से 5 दिन लगते हैं)। सफल रिव्यु के बाद आपका ऐप प्ले स्टोर पर लाइव हो जाएगा! 🎉🎉
