import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAyowWAzM5tpmNVxx_1XoxZpQIRSKkRExA",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.firebasestorage.app",
  messagingSenderId: "69640690245",
  appId: "1:69640690245:web:580a8113c9a751771aa12c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// عناصر DOM
const form = document.getElementById('applyForm');
const submitBtn = document.getElementById('submitBtn');
const msgEl = document.getElementById('msg');

// إرسال النموذج
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  msgEl.innerHTML = '<div class="alert info">جاري معالجة طلبك...</div>';

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // التحقق من البيانات
    if (!data.fullname || !data.iqama || !data.phone) {
      throw new Error('جميع الحقول الإلزامية مطلوبة');
    }
    
    if (!/^\d{10}$/.test(data.phone)) {
      throw new Error('رقم الجوال يجب أن يكون 10 أرقام');
    }
    
    // التحقق من عدم تكرار رقم الإقامة
    const q = query(collection(db, "applicants"), where("iqama", "==", data.iqama));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('رقم الإقامة مسجل مسبقاً');
    }
    
    // هنا كود رفع الملفات إلى Cloudinary (إذا كنت تستخدمها)
    
    // حفظ البيانات في Firestore
    await addDoc(collection(db, "applicants"), {
      ...data,
      createdAt: new Date().toISOString(),
      status: "pending"
    });
    
    showMessage('تم تقديم طلبك بنجاح', 'success');
    form.reset();
  } catch (error) {
    showMessage(`حدث خطأ: ${error.message}`, 'error');
    console.error("Submission error:", error);
  } finally {
    submitBtn.disabled = false;
  }
});

function showMessage(msg, type) {
  msgEl.innerHTML = `
    <div class="alert ${type}">
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}></i>
      ${msg}
    </div>
  `;
}
