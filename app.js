import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.firebasestorage.app",
  messagingSenderId: "69640690245",
  appId: "1:69640690245:web:...aa12c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cloudinary configuration
const CLOUD_NAME = 'dysxdaa2u';
const UPLOAD_PRESET = 'platform';

// DOM Elements
const fullname = document.getElementById('fullname');
const iqama = document.getElementById('iqama');
const phone = document.getElementById('phone');
const jobSelect = document.getElementById('jobSelect');
const iqamaImage = document.getElementById('iqamaImage');
const licenseImage = document.getElementById('licenseImage');
const profileImage = document.getElementById('profileImage');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const msgEl = document.getElementById('msg');
const iqamaFileName = document.getElementById('iqamaFileName');
const licenseFileName = document.getElementById('licenseFileName');
const profileFileName = document.getElementById('profileFileName');

// Show message function
function showMsg(txt, type = '') {
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
  msgEl.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas ${icon} alert-icon"></i>
      ${txt}
    </div>
  `;
}

// Upload file to Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Check if residency number exists
async function residencyExists(value) {
  const q = query(collection(db, 'applicants'), where('iqama', '==', value));
  const snap = await getDocs(q);
  return !snap.empty;
}

// Load available jobs
async function loadJobs() {
  jobSelect.innerHTML = '<option value="">-- بدون اختيار --</option>';
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  
  snap.forEach(doc => {
    const job = doc.data();
    const option = document.createElement('option');
    option.value = doc.id;
    option.text = `${job.title} — ${job.projectId || '-'}`;
    jobSelect.appendChild(option);
  });
}

// Reset form
resetBtn.onclick = () => {
  fullname.value = '';
  iqama.value = '';
  phone.value = '';
  jobSelect.value = '';
  iqamaImage.value = '';
  licenseImage.value = '';
  profileImage.value = '';
  iqamaFileName.textContent = 'اختر ملف';
  licenseFileName.textContent = 'اختر ملف';
  profileFileName.textContent = 'اختر ملف';
  msgEl.innerHTML = '';
};

// File input change handlers
iqamaImage.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    iqamaFileName.textContent = e.target.files[0].name;
  }
});

licenseImage.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    licenseFileName.textContent = e.target.files[0].name;
  }
});

profileImage.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    profileFileName.textContent = e.target.files[0].name;
  }
});

// Submit form
submitBtn.onclick = async () => {
  const name = fullname.value.trim();
  const resNo = iqama.value.trim();
  const phoneNum = phone.value.trim();
  
  // Validate required fields
  if (!name || !resNo || !phoneNum) {
    showMsg('الرجاء إكمال الحقول الإلزامية', 'error');
    return;
  }
  
  // Validate residency number
  showMsg('جاري التحقق من رقم الإقامة...', '');
  if (await residencyExists(resNo)) {
    showMsg('رقم الإقامة مسجل بالفعل', 'error');
    return;
  }
  
  // Validate files
  if (!iqamaImage.files[0] || !licenseImage.files[0] || !profileImage.files[0]) {
    showMsg('الرجاء رفع جميع الملفات المطلوبة', 'error');
    return;
  }
  
  showMsg('جاري رفع الملفات...', '');
  submitBtn.disabled = true;
  
  try {
    // Upload files in parallel
    const [iqamaUrl, licenseUrl, profileUrl] = await Promise.all([
      uploadToCloudinary(iqamaImage.files[0]),
      uploadToCloudinary(licenseImage.files[0]),
      uploadToCloudinary(profileImage.files[0])
    ]);
    
    if (!iqamaUrl || !licenseUrl || !profileUrl) {
      throw new Error('فشل في رفع الملفات');
    }
    
    // Get project ID if job is selected
    let projectId = null;
    if (jobSelect.value) {
      const jobDoc = await getDoc(doc(db, 'jobs', jobSelect.value));
      if (jobDoc.exists()) {
        projectId = jobDoc.data().projectId;
      }
    }
    
    // Save applicant data
    await addDoc(collection(db, 'applicants'), {
      fullname: name,
      iqama: resNo,
      phone: phoneNum,
      jobId: jobSelect.value || null,
      projectId,
      iqamaImage: iqamaUrl,
      licenseImage: licenseUrl,
      profileImage: profileUrl,
      createdAt: new Date().toISOString()
    });
    
    showMsg('تم تقديم طلبك بنجاح، شكراً لك!', 'success');
    resetBtn.click();
  } catch (error) {
    console.error('Submission error:', error);
    showMsg('حدث خطأ أثناء تقديم الطلب، الرجاء المحاولة لاحقاً', 'error');
  } finally {
    submitBtn.disabled = false;
  }
};

// Initialize the page
loadJobs();
