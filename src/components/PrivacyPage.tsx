import React, { useState } from 'react';
import { Shield, Mail, Globe, ArrowLeft, Info, HelpCircle } from 'lucide-react';

interface PrivacyPageProps {
  onBackToApp?: () => void;
}

export default function PrivacyPage({ onBackToApp }: PrivacyPageProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const permissions = [
    {
      name: 'ACCESSIBILITY_SERVICE',
      labelEn: 'Accessibility Service',
      labelHi: 'एक्सेसिबिलिटी सर्विस',
      type: 'Sensitive',
      descEn: 'Essential. Allows the app to monitor window state changes locally and detect when a restricted app is launched, triggering the overlay blocker instantly. No keystrokes or content are recorded.',
      descHi: 'अनिवार्य। यह सर्विस बैकग्राउंड में लॉक की गई ऐप के ओपन होने पर विंडो स्टेट को डिटेक्ट करती है और तुरंत PIN/Pattern लॉक स्क्रीन दिखाती है। यह कोई डेटा इकट्ठा या शेयर नहीं करती।'
    },
    {
      name: 'SYSTEM_ALERT_WINDOW',
      labelEn: 'System Alert (Overlays)',
      labelHi: 'सिस्टम अलर्ट ओवरले',
      type: 'Critical',
      descEn: 'Essential. Enables rendering of the highly-secure PIN/Pattern lock screens on top of target locked applications when they try to bypass.',
      descHi: 'अनिवार्य। यह अन्य प्रतिबंधित ऐप्स के ऊपर सुरक्षा पिन या पैटर्न लॉक स्क्रीन ओवरले दिखाने में मदद करता है।'
    },
    {
      name: 'PACKAGE_USAGE_STATS',
      labelEn: 'Usage Stats',
      labelHi: 'पैकेज यूसेज स्टैट्स',
      type: 'Critical',
      descEn: 'Required to accurately query background operational runtimes and verify daily study minutes logged for the restricted apps list.',
      descHi: 'इसका उपयोग सक्रिय रूप से बैकग्राउंड में ऐप्स के इस्तेमाल के समय (Minutes) और असाइन की गई दैनिक समय सीमाओं को कैलकुलेट करने के लिए किया जाता है।'
    },
    {
      name: 'FOREGROUND_SERVICE',
      labelEn: 'Foreground Service',
      labelHi: 'फोरग्राउंड सर्विस',
      type: 'Normal',
      descEn: 'Ensures the background monitoring services can run sleep cycles safely to track durations without getting aggressively closed by Android resources.',
      descHi: 'इसके द्वारा एंड्रॉइड ऑपरेटिंग सिस्टम बैकग्राउंड में चल रहे फोकस-टाइमर को अचानक बंद होने से बचाता है।'
    },
    {
      name: 'RECEIVE_BOOT_COMPLETED',
      labelEn: 'Receive Boot Completed',
      labelHi: 'रिसीव बूट कम्प्लीटेड',
      type: 'Normal',
      descEn: 'Automatically reactivates study lock routines when the device restarts, protecting you against quick reboot lock bypasses.',
      descHi: 'फ़ोन को रीस्टार्ट / रीबूट करने पर भी सुरक्षा सर्विस ऑटोमैटिक बैकग्राउंड में री-एक्टिवेट हो जाती है ताकि लॉक को बाइपास न किया जा सके।'
    },
    {
      name: 'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      labelEn: 'Ignore Battery Optimizations',
      labelHi: 'बैटरी ऑप्टिमाइज़ेशन इग्नोर',
      type: 'Sensitive',
      descEn: 'Stops Android\'s deep battery dozing from aggressively freezing the background focus countdown monitor.',
      descHi: 'एंड्रॉइड की डीप-स्लीप बैटरी अनुकूलन (Battery Optimization) योजना को आपके सक्रिय फोकस शेड्यूल्स को निष्क्रिय करने से रोकता है।'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080e] text-gray-200 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden bg-[#0a0b12] border-b border-gray-900 px-6 py-12 md:py-16 text-center">
        {/* Abstract background decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/40 rounded-full border border-indigo-900/30 text-xs font-mono text-indigo-400">
            <Shield className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>Play Console Target SDK 34/35 Stability</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-serif italic max-w-xl mx-auto">
            Study Mode App Lock & Timer / स्टडी मोड ऐप लॉक एंड टाइमर
          </p>
          <div className="text-xs font-mono text-gray-500">
            Effective Date: June 12, 2026
          </div>

          {/* Interactive Language Option Tabs */}
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all uppercase ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[#121421] text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              English Version
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all uppercase ${
                lang === 'hi'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[#121421] text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              हिंदी संस्करण (Hindi)
            </button>
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Developer Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content body card */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-[#0b0c13] rounded-2xl border border-gray-900 p-6 md:p-10 shadow-xl space-y-8">
          {lang === 'en' ? (
            /* ENGLISH PRIVACY BLOCK */
            <div className="space-y-8 animate-fadeIn">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">1.</span> Welcome & Overview
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  Welcome to <strong>Study Mode App Lock & Timer</strong>. We respect your privacy and are committed to protecting it. This Privacy Policy describes how we collect, use, and handle information within our phone lock-out application.
                </p>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  Our app functions entirely client-side, designed to secure your mobile device from persistent distractions and optimize student screen routine locks. By downloading and setting up the app, you agree to these clear developer-end practices.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">2.</span> Data Minimalism & Collection
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  We believe in zero online footprints. This application adheres to strict offline-first principles:
                </p>
                <ul className="list-disc pl-5 space-y-2.5 text-gray-300 text-sm">
                  <li>
                    <strong className="text-white">No PII (Personally Identifiable Information) Collected:</strong> We do NOT collect, transmit, or read your name, email addresses, phone contacts, location maps, or photo streams.
                  </li>
                  <li>
                    <strong className="text-white">Private Local Sandbox Database:</strong> All setup keys (such as target lockdown apps, customized countdown limits, and secure password hashes) are saved safely in your device’s sandbox local Room Database. They never leave your device.
                  </li>
                  <li>
                    <strong className="text-white">Offline Operational Isolation:</strong> The application does not deploy cloud server synchronization modules.
                  </li>
                  <li>
                    <strong className="text-white">Secure Local Security:</strong> Your lock values (PIN or patterns) are encrypted using robust local algorithms to protect them against on-device extraction.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">3.</span> Android Permissions Transparency
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  To provide reliable, tamper-proof study timers and draw security locks over distracting apps, we require specific Android settings. See the detailed clearance breakdown:
                </p>

                <div className="overflow-x-auto border border-gray-850 rounded-xl">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-indigo-950/20 border-b border-gray-850 text-gray-300">
                        <th className="p-4 font-semibold">Permission</th>
                        <th className="p-4 font-semibold">Classification</th>
                        <th className="p-4 font-semibold">Purpose & Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {permissions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-4 font-mono font-bold text-gray-100">{p.name}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                              p.type === 'Critical' ? 'bg-rose-950/60 text-rose-300 border border-rose-900/30' :
                              p.type === 'Sensitive' ? 'bg-amber-950/60 text-amber-300 border border-amber-900/30' :
                              'bg-indigo-950/60 text-indigo-300 border border-indigo-900/30'
                            }`}>
                              {p.type}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 leading-relaxed">{p.descEn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">4.</span> Ads & Commercial SDKs Integrity
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  We maintain a disturbance-free estudying environment. We include <strong>no commercial advertisement SDKs</strong> (like Google AdMob or Unity ads) and no behavioral third-party tracking beacons. Our source code runs entirely clean.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">5.</span> Child Protection (COPPA & GDPR Compliance)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  As an application built for academic self-control, students of all ages use our app. By completely eliminating cloud tracking, PII gathering, and ads, this software complies fully with all Children’s Online Privacy Protection Act (COPPA) guidelines and EU GDPR young minor standards.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">6.</span> Contact or Support Response
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  If there are any concerns about user permissions or app features, please reach out directly:
                </p>
                <div className="inline-flex items-center gap-2.5 p-4 bg-[#121421] border border-gray-850 rounded-xl">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <a href="mailto:jitu1199pal@gmail.com" className="text-indigo-400 hover:underline font-bold text-sm">
                    jitu1199pal@gmail.com
                  </a>
                </div>
              </section>
            </div>
          ) : (
            /* HINDI PRIVACY BLOCK */
            <div className="space-y-8 animate-fadeIn">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5 font-sans">
                  <span className="text-indigo-500">1.</span> स्वागत और विवरण (Introduction)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  <strong>Study Mode App Lock & Timer</strong> में आपका स्वागत है। हम आपकी गोपनीयता (Privacy) का सम्मान करते हैं और इसे सुरक्षित रखने के लिए पूरी तरह से प्रतिबद्ध हैं। यह प्राइवेसी पॉलिसी बताती है कि हमारी एप्लीकेशन आपके डिवाइस पर आपके सेटिंग्स और डेटा को किस प्रकार सुरक्षित रखती है।
                </p>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  हमारी यह एप्लीकेशन पूरी तरह से ऑफलाइन-फर्स्ट और स्थानीय रूप से डिवाइस पर कार्य करती है। इसका एकमात्र उद्देश्य पढ़ाई के दौरान विचलित करने वाली ऐप्स से आपका बचाव करना है। इस एप्लीकेशन को इंस्टॉल करने के बाद आप इस गोपनीयता योजना को अपनी सहमति प्रदान करते हैं।
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">2.</span> न्यूनतम डेटा संग्रह (Data Minimalism)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  हम न्यूनतम डेटा संग्रह नीतियों का पालन करते हैं। हमारा मुख्य कार्य निम्नलिखित सुरक्षा सिद्धांतों पर टिका है:
                </p>
                <ul className="list-disc pl-5 space-y-2.5 text-gray-300 text-sm">
                  <li>
                    <strong className="text-white">कोई भी व्यक्तिगत जानकारी कलेक्ट नहीं की जाती:</strong> हम आपका नाम, ईमेल, फ़ोन नंबर, कांटेक्ट सूचियां या गैलरी फोटो बिल्कुल भी रीड या शेयर नहीं करते हैं।
                  </li>
                  <li>
                    <strong className="text-white">स्थानीय सैंडबॉक्स डेटाबेस (Private Local Storage):</strong> आपके द्वारा लॉक की गई ऐप्स, कस्टमाइज़्ड समय सीमाएं या सुरक्षा PIN केवल आपके डिवाइस के निजी सैंडबॉक्स SQLite/Room डेटाबेस में सहेजे जाते हैं।
                  </li>
                  <li>
                    <strong className="text-white">कोई क्लाउड सिंक्रोनाइजेशन नहीं:</strong> इस एप्लीकेशन में डेटा का कोई बाहरी ट्रांसमिशन नहीं होता है क्योंकि इस ऐप में कोई भी ऑनलाइन बैकएंड सर्वर नहीं है।
                  </li>
                  <li>
                    <strong className="text-white">पिन/पैटर्न सिक्योरिटी का ऑफलाइन हैश:</strong> सुरक्षा पासवर्ड फ़ोन के लोकल स्पेस में अत्यंत सुरक्षित एल्गोरिदम के साथ स्थानीय रूप से संग्रहीत होते हैं।
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">3.</span> संवेदनशील डिवाइस अनुमतियाँ (System Permissions)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  ऐप को बैकग्राउंड में समय सीमा मापने, लॉक को बाइपास होने से रोकने और लॉक स्क्रीन का ओवरले दिखाने के लिए एंड्रॉइड की कुछ अनुमतियों की आवश्यकता होती है:
                </p>

                <div className="overflow-x-auto border border-gray-850 rounded-xl">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-indigo-950/20 border-b border-gray-850 text-gray-300">
                        <th className="p-4 font-semibold">अनुमति</th>
                        <th className="p-4 font-semibold">वर्गीकरण</th>
                        <th className="p-4 font-semibold">उद्देश्य और कार्यप्रणाली</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {permissions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-4 font-mono font-bold text-gray-100">{p.name}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                              p.type === 'Critical' ? 'bg-rose-950/60 text-rose-300 border border-rose-900/30' :
                              p.type === 'Sensitive' ? 'bg-amber-950/60 text-amber-300 border border-amber-900/30' :
                              'bg-indigo-950/60 text-indigo-300 border border-indigo-900/30'
                            }`}>
                              {p.type === 'Critical' ? 'महत्वपूर्ण' : p.type === 'Sensitive' ? 'संवेदनशील' : 'सामान्य'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 leading-relaxed">{p.descHi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">4.</span> विज्ञापनों और तृतीय-पक्ष SDK से मुक्ति
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  पढ़ाई के दौरान ध्यान विचलित न होने देने के लिए यह ऐप विज्ञापनों (No Ads) से पूरी तरह मुक्त है। हम ऐप में कोई व्यावसायिक नेटवर्क (जैसे Google AdMob या Unity) अथवा कुकीज़ और एनालिटिक्स ट्रैकर्स लोड नहीं करते हैं।
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">5.</span> बच्चों की गोपनीयता का संरक्षण (Compliance Statement)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  यह एप्लीकेशन विद्यार्थियों और कम उम्र के बच्चों द्वारा अपनी स्क्रीन लिमिट नियंत्रित करने के लिए किया जाता है। किसी भी प्रकार की निजी ट्रैकिंग व विज्ञापन नीतियों से रहित होने के चलते यह सॉफ्टवेयर COPPA (चाइल्ड ऑनलाइन प्राइवेसी प्रोटेक्शन एक्ट) और बच्चों के सुदृढ़ डेटा सुरक्षा नियमों के पूरी तरह अनुकूल है।
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-gray-850 pb-2.5">
                  <span className="text-indigo-500">6.</span> संपर्क करें (Developer Support)
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                  ऐप की गोपनीयता, अनुमतियों या किसी अन्य सहायता के संबंध में सीधे ईमेल पर संपर्क करें:
                </p>
                <div className="inline-flex items-center gap-2.5 p-4 bg-[#121421] border border-gray-850 rounded-xl">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <a href="mailto:jitu1199pal@gmail.com" className="text-indigo-400 hover:underline font-bold text-sm">
                    jitu1199pal@gmail.com
                  </a>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b0c13] text-center py-8 text-gray-500 font-mono text-xs border-t border-gray-950 space-y-2">
        <p>© 2026 Study Mode App Lock & Timer. All rights reserved.</p>
        <p>Package ID: <code className="text-rose-400 bg-slate-950 px-1.5 py-0.5 rounded">com.applocktimer.pro</code></p>
      </footer>
    </div>
  );
}
