import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// بيانات الحسابات المؤقتة
const TEMP_ACCOUNTS = [
  { email: "abubakr@temp.com", password: "00", name: "أبوبكر" },
  { email: "ahmed@temp.com", password: "000", name: "أحمد" },
  { email: "mazen@temp.com", password: "0000", name: "مازن" }
];

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('pass').value.trim();
  
  if (!email || !password) {
    showMessage('الرجاء إدخال البريد وكلمة المرور', 'error');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // التحقق من وجود المستخدم في مجموعة admins
    const q = query(collection(db, "admins"), where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await auth.signOut();
      showMessage('ليس لديك صلاحيات الدخول', 'error');
      return;
    }
    
    window.location.href = "dashboard.html";
  } catch (error) {
    showMessage('فشل تسجيل الدخول: تأكد من البيانات', 'error');
    console.error("Login error:", error);
  }
});

function showMessage(msg, type) {
  const msgEl = document.getElementById('authMsg');
  msgEl.innerHTML = `
    <div class="alert ${type}">
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}></i>
      ${msg}
    </div>
  `;
}

// عرض الحسابات المؤقتة
function displayTempAccounts() {
  const accountsList = TEMP_ACCOUNTS.map(acc => 
    `<p><strong>${acc.name}:</strong> ${acc.email} - ${acc.password}</p>`
  ).join('');
  
  document.querySelector('.temp-accounts').innerHTML = `
    <h4>حسابات تجريبية (تأكد من تشغيلها في Firebase أولاً):</h4>
    ${accountsList}
  `;
}

displayTempAccounts();
