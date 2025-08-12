import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAyowWAzM5tpmNVxx_1XoxZpQIRSKkRExA",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.firebasestorage.app",
  messagingSenderId: "69640690245",
  appId: "1:69640690245:web:580a8113c9a751771aa12c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const emailEl = document.getElementById('email');
const passEl = document.getElementById('pass');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMsg = document.getElementById('authMsg');
const panel = document.getElementById('panel');
const appsBody = document.getElementById('appsBody');
const exportBtn = document.getElementById('exportBtn');
const backBtn = document.getElementById('backBtn');

// Show authentication message
function showAuth(txt, type = 'error') {
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
  authMsg.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas ${icon} alert-icon"></i>
      ${txt}
    </div>
  `;
}

// Login button click handler
loginBtn.addEventListener('click', async () => {
  const email = emailEl.value.trim();
  const password = passEl.value.trim();
  
  if (!email || !password) {
    showAuth('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showAuth('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }
});

// Logout button click handler
logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

// Back button click handler
backBtn.addEventListener('click', (e) => {
  e.preventDefault();
  // Add your back button functionality here
  window.location.href = '/'; // Example: redirect to home page
});

// Auth state change listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    showAuth('تم تسجيل الدخول بنجاح', 'success');
    
    // Check if user is admin
    let projectId = null;
    const q = query(collection(db, 'admins'), where('email', '==', user.email));
    const snap = await getDocs(q);
    
    snap.forEach(doc => {
      projectId = doc.data().projectId;
    });
    
    if (!projectId) {
      showAuth('لا يوجد مشروع مرتبط بحسابك', 'error');
      return;
    }
    
    // Load applicants for the project
    await loadApplicants(projectId);
  } else {
    // User is signed out
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    panel.style.display = 'none';
    appsBody.innerHTML = '';
  }
});

// Load applicants function
async function loadApplicants(projectId) {
  panel.style.display = 'block';
  appsBody.innerHTML = '<tr><td colspan="6">جاري تحميل البيانات...</td></tr>';
  
  const q = query(
    collection(db, 'applicants'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  );
  
  const snap = await getDocs(q);
  const rows = [];
  appsBody.innerHTML = '';
  
  if (snap.empty) {
    appsBody.innerHTML = '<tr><td colspan="6">لا توجد طلبات متاحة</td></tr>';
    return;
  }
  
  snap.forEach(doc => {
    const applicant = doc.data();
    rows.push(applicant);
    
    const date = applicant.createdAt 
      ? new Date(applicant.createdAt).toLocaleString('ar-SA')
      : 'غير محدد';
    
    appsBody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${applicant.fullname || '-'}</td>
        <td>${applicant.iqama || '-'}</td>
        <td>${applicant.phone || '-'}</td>
        <td>${applicant.jobId || 'بدون اختيار'}</td>
        <td>
          <a href="${applicant.iqamaImage}" target="_blank" title="صورة الإقامة">
            <i class="fas fa-id-card"></i>
          </a>
          <a href="${applicant.licenseImage}" target="_blank" title="رخصة القيادة">
            <i class="fas fa-id-card-alt"></i>
          </a>
          <a href="${applicant.profileImage}" target="_blank" title="صورة شخصية">
            <i class="fas fa-user"></i>
          </a>
        </td>
        <td>${date}</td>
      </tr>
    `);
  });
  
  // Export to CSV functionality
  exportBtn.onclick = () => {
    const csvRows = rows.map(row => [
      `"${row.fullname || ''}"`,
      `"${row.iqama || ''}"`,
      `"${row.phone || ''}"`,
      `"${row.jobId || ''}"`,
      `"${row.createdAt || ''}"`
    ].join(','));
    
    const csv = [
      '"الاسم","رقم الإقامة","الجوال","الوظيفة","تاريخ التقديم"',
      ...csvRows
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `applicants_${projectId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
}
