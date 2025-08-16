// Firestore و Storage
const db = firebase.firestore();

// دالة عرض الطلبات
async function loadApplications() {
  const applicationsList = document.getElementById("applicationsList");
  applicationsList.innerHTML = "<p>⏳ جاري تحميل الطلبات...</p>";

  try {
    const snapshot = await db.collection("applications")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      applicationsList.innerHTML = "<p>⚠️ لا توجد طلبات حتى الآن</p>";
      return;
    }

    applicationsList.innerHTML = ""; // تفريغ

    snapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement("div");
      card.classList.add("application-card");

      card.innerHTML = `
        <h3>${data.name}</h3>
        <p><strong>رقم الإقامة:</strong> ${data.iqama}</p>
        <p><strong>رقم الهاتف:</strong> ${data.phone}</p>
        <p><strong>تاريخ التقديم:</strong> ${data.createdAt?.toDate().toLocaleString("ar-SA") || "غير متوفر"}</p>
        
        <div class="images">
          <div>
            <p>الإقامة:</p>
            <img src="${data.iqamaUrl}" alt="صورة الإقامة">
          </div>
          <div>
            <p>الرخصة:</p>
            <img src="${data.licenseUrl}" alt="صورة الرخصة">
          </div>
          <div>
            <p>الصورة الشخصية:</p>
            <img src="${data.photoUrl}" alt="صورة شخصية">
          </div>
        </div>
      `;

      applicationsList.appendChild(card);
    });
  } catch (error) {
    console.error("خطأ في جلب الطلبات:", error);
    applicationsList.innerHTML = "<p>❌ حدث خطأ أثناء تحميل الطلبات</p>";
  }
}

// استدعاء عند فتح الصفحة
if (document.getElementById("applicationsList")) {
  loadApplications();
}
