// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyowWAzM5tpmNVxx_1XoxZpQIRSKkRExA",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.firebasestorage.app",
  messagingSenderId: "69640690245",
  appId: "1:69640690245:web:580a8113c9a751771aa12c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = "zahrani-platform";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dysxdaa2u/image/upload";

// رفع الصور إلى Cloudinary
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  const data = await res.json();
  return data.secure_url;
}

// تقديم طلب وظيفة
document.getElementById("jobForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const iqama = document.getElementById("iqama").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const iqamaFile = document.getElementById("iqamaFile").files[0];
  const licenseFile = document.getElementById("licenseFile").files[0];
  const photoFile = document.getElementById("photoFile").files[0];
  const jobId = document.getElementById("jobId").value;

  // تحقق من تكرار رقم الإقامة على مستوى جميع الوظائف
  const querySnapshot = await db.collection("applications")
    .where("iqama", "==", iqama)
    .get();

  if (!querySnapshot.empty) {
    alert("رقم الإقامة مسجل بالفعل في النظام.");
    return;
  }

  // رفع الصور
  const iqamaUrl = await uploadImage(iqamaFile);
  const licenseUrl = await uploadImage(licenseFile);
  const photoUrl = await uploadImage(photoFile);

  // حفظ البيانات
  await db.collection("applications").add({
    name,
    iqama,
    phone,
    iqamaUrl,
    licenseUrl,
    photoUrl,
    jobId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("تم تقديم الطلب بنجاح!");
  document.getElementById("jobForm").reset();
});

// تسجيل دخول المشرف
document.getElementById("adminLoginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    window.location.href = "admin.html";
  } catch (error) {
    alert("بيانات الدخول غير صحيحة");
  }
});
