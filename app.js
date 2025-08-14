// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAyowWAzM5tpmNVxx_1XoxZpQIRSKkRExA",
  authDomain: "al-zahrani-platform.firebaseapp.com",
  projectId: "al-zahrani-platform",
  storageBucket: "al-zahrani-platform.firebasestorage.app",
  messagingSenderId: "69640690245",
  appId: "1:69640690245:web:580a8113c9a751771aa12c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// تحميل الوظائف
function loadJobs() {
  db.collection("jobs").get().then(snapshot => {
    const jobsList = document.getElementById("jobsList");
    jobsList.innerHTML = "";
    snapshot.forEach(doc => {
      const job = doc.data();
      const div = document.createElement("div");
      div.className = "job-card";
      div.innerHTML = `<h3>${job.title}</h3><p>${job.desc}</p>
        <button onclick="applyJob('${doc.id}')">تقديم</button>`;
      jobsList.appendChild(div);
    });
  });
}
if (document.getElementById("jobsList")) loadJobs();

// اختيار الوظيفة للتقديم
function applyJob(id) {
  document.getElementById("jobId").value = id;
  window.scrollTo(0, document.getElementById("jobForm").offsetTop);
}

// إرسال الطلب مع منع تكرار رقم الإقامة
if (document.getElementById("jobForm")) {
  document.getElementById("jobForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const iqama = document.getElementById("iqama").value;
    const jobId = document.getElementById("jobId").value;

    const exists = await db.collection("applications")
      .where("iqama", "==", iqama).get();

    if (!exists.empty) {
      alert("رقم الإقامة مسجل بالفعل!");
      return;
    }

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    const iqamaFile = document.getElementById("iqamaFile").files[0];
    const licenseFile = document.getElementById("licenseFile").files[0];
    const photoFile = document.getElementById("photoFile").files[0];

    const iqamaUrl = await uploadFile(iqamaFile);
    const licenseUrl = await uploadFile(licenseFile);
    const photoUrl = await uploadFile(photoFile);

    await db.collection("applications").add({
      name, iqama, phone, jobId, iqamaUrl, licenseUrl, photoUrl, date: new Date()
    });

    alert("تم إرسال الطلب بنجاح!");
    e.target.reset();
  });
}

// رفع الملفات
async function uploadFile(file) {
  const ref = storage.ref().child("uploads/" + file.name);
  await ref.put(file);
  return await ref.getDownloadURL();
}

// دخول المشرف
if (document.getElementById("adminLoginForm")) {
  document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;
    auth.signInWithEmailAndPassword(email, password).then(() => {
      window.location.href = "admin.html";
    }).catch(err => alert(err.message));
  });
}

// إضافة وظيفة
if (document.getElementById("addJobForm")) {
  document.getElementById("addJobForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("jobTitle").value;
    const desc = document.getElementById("jobDesc").value;
    await db.collection("jobs").add({ title, desc });
    alert("تم إضافة الوظيفة");
    loadJobs();
    e.target.reset();
  });
}

// عرض الطلبات
if (document.getElementById("applicationsList")) {
  db.collection("applications").orderBy("date", "desc").onSnapshot(snapshot => {
    const list = document.getElementById("applicationsList");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const app = doc.data();
      const div = document.createElement("div");
      div.className = "app-card";
      div.innerHTML = `<p><b>${app.name}</b> - ${app.iqama}</p>
        <a href="${app.iqamaUrl}" target="_blank">صورة الإقامة</a> |
        <a href="${app.licenseUrl}" target="_blank">رخصة القيادة</a> |
        <a href="${app.photoUrl}" target="_blank">الصورة الشخصية</a>`;
      list.appendChild(div);
    });
  });
}
