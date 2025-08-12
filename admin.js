import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc 
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyY...",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// إنشاء حسابات مؤقتة (تنفيذ مرة واحدة فقط)
async function createTempAccounts() {
  const tempAccounts = [
    { email: "abubakr@temp.com", password: "00", name: "أبوبكر" },
    { email: "ahmed@temp.com", password: "000", name: "أحمد" },
    { email: "mazen@temp.com", password: "0000", name: "مازن" }
  ];

  for (const acc of tempAccounts) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      await setDoc(doc(db, "admins", userCredential.user.uid), {
        email: acc.email,
        name: acc.name,
        createdAt: new Date().toISOString()
      });
      console.log(`تم إنشاء ${acc.name} بنجاح`);
    } catch (error) {
      console.error(`خطأ في إنشاء ${acc.name}:`, error.message);
    }
  }
}

// تسجيل الدخول
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('pass').value.trim();
  
  if (!email || !password) {
    showMessage('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showMessage('بيانات الدخول غير صحيحة', 'error');
  }
});

function showMessage(msg, type) {
  const msgEl = document.getElementById('authMsg');
  msgEl.innerHTML = `<div class="alert ${type}">${msg}</div>`;
}

// تنفيذ مرة واحدة لإنشاء الحسابات
// createTempAccounts(); // قم بإلغاء التعليق عند الحاجة ثم علقها بعد التنفيذ
