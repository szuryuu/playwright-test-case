// "Wawasan tambahan" (next-class + industry-standard practice) appended to
// approved submissions. Banks are keyed by submission kind so the suggestion
// is tailored to what the student actually built, not copy-paste boilerplate.
// Picks are random per run so repeated reviews don't read canned.

const CLASS_PATHS = {
  "fe-beginner": [
    "Belajar Fundamental Front-End Web Development. Kamu akan berkenalan dengan Webpack, REST API, dan bundler, lanjutan alami dari Expense Tracker ini.",
    "Belajar Membuat Aplikasi Web dengan React. Pola state dan render ulang terpusat yang kamu rintis manual di sini menjadi terstruktur lewat komponen.",
    "Belajar Dasar-Dasar Pemrograman Web. Kelas ini memperdalam fondasi HTML, CSS, dan JavaScript yang menopang proyek ini.",
  ],
  "be-js-basic": [
    "Belajar Back-End Pemula dengan JavaScript. Pelajari dasar dalam membangun RESTful API, dari HTTP server, routing, hingga membangun Back-End untuk aplikasi yang nyata.",
  ],
  "fe-fundamental-sub1": [
    "Belajar Membuat Aplikasi Web dengan React. Kamu akan mengelola state aplikasi Notes dengan pendekatan komponen dan hooks, lanjutan alami dari Web Components yang kamu bangun di sini.",
    "Belajar Pengembangan Web Intermediate. Kelas ini memperdalam pengembangan aplikasi web modern dan praktik kualitas aplikasi front-end.",
    "Belajar Fundamental Aplikasi Web dengan React. Kamu akan mempelajari dasar React, state management, dan cara membangun single-page application.",
  ],
  "fe-fundamental-sub2": [
    "Belajar Pengembangan Web Intermediate. Kelas ini memperdalam pengembangan aplikasi web modern dan praktik kualitas aplikasi front-end.",
    "Belajar Membuat Aplikasi Web dengan React. Kamu akan mengelola data dari REST API dengan pendekatan komponen dan state management yang lebih terstruktur.",
  ],
};

const INDUSTRY_TIPS = {
  "fe-beginner": [
    "Event delegation: alih-alih menempel satu listener di tiap tombol kartu, pasang satu listener pada container daftar lalu baca event.target.closest. Ini menjaga performa saat daftar transaksi membesar.",
    "Pisahkan logika data (array dan localStorage) dari logika DOM (render) ke dalam modul terpisah. Fungsi yang murni jauh lebih mudah diuji.",
    "Pasang Prettier dan ESLint agar gaya kode konsisten dan bug tertangkap lebih awal.",
    "Kembalikan array baru dengan filter atau map daripada mengubah array asli, supaya perubahan data mudah dilacak.",
    "Gunakan crypto.randomUUID() untuk id transaksi yang stabil dan unik.",
    "Tambahkan atribut aria-label pada tombol ikon agar terbaca oleh screen reader.",
  ],
  "be-js-basic": [
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam penerapan Object-Oriented Programming pada class Item dan Inventory dengan memisahkan tanggung jawab setiap class agar kode lebih modular dan mudah dikembangkan. Kamu juga dapat mempelajari konsep error handling seperti try...catch serta validasi input pada method addItem agar program lebih aman ketika menerima data yang tidak sesuai.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam praktik automated testing dengan menambahkan lebih banyak skenario pada fungsi sum, terutama untuk menguji edge case seperti input bertipe string, null, atau angka negatif. Selain itu, kamu dapat mempelajari konsep Test-Driven Development (TDD) agar proses penulisan kode dan pengujiannya dapat dilakukan secara lebih terstruktur.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam konsep rekursi yang telah kamu terapkan pada fungsi factorial dan fibonacci dengan memahami pentingnya base case agar fungsi berhenti dengan benar dan tidak menumpuk panggilan. Kamu juga dapat mempelajari teknik memoization agar perhitungan rekursif menjadi lebih efisien untuk input yang besar.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam pengelolaan data pada aplikasi orders dengan menambahkan validasi pada updateOrderStatus dan deleteOrder agar program memberi respon yang jelas ketika id tidak ditemukan. Kamu juga dapat mempelajari struktur data Map untuk mempercepat pencarian data berdasarkan id.",
    "Sebagai pengembangan selanjutnya, kamu dapat mempertahankan konsistensi gaya kode yang sudah kamu terapkan dengan memanfaatkan ESLint dan Prettier, sehingga aturan penggunaan const, indentasi 2 spasi, dan titik koma terjaga secara otomatis di setiap berkas. Kamu juga dapat mempelajari penamaan variabel dan fungsi yang lebih deskriptif agar kode semakin mudah dipahami.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam kebiasaan menulis komentar yang baik dengan menjelaskan alasan di balik kode, bukan sekadar apa yang dilakukan kode tersebut. Kamu juga dapat mempelajari dokumentasi kode seperti JSDoc agar setiap fungsi memiliki penjelasan parameter dan nilai kembalian yang jelas.",
  ],
  "fe-fundamental-sub1": [
    "Sebagai pengembangan selanjutnya, kamu dapat menerapkan event delegation pada daftar catatan dengan menempelkan satu event listener di container note-list lalu memeriksa event.target untuk menentukan tombol yang diklik. Kamu juga dapat mempelajari cara membubarkan listener dengan AbortController agar tidak terjadi kebocoran memori saat elemen dihapus.",
    "Sebagai pengembangan selanjutnya, kamu dapat memisahkan logika data catatan dari logika render dengan pola store sederhana, sehingga perubahan state selalu melalui satu jalur. Kamu juga dapat mempelajari konsep immutability dengan selalu mengembalikan array baru dari filter dan map agar data lebih mudah dilacak.",
    "Sebagai pengembangan selanjutnya, kamu dapat meningkatkan aksesibilitas Web Components dengan menambahkan atribut ARIA seperti role, aria-label, dan aria-live pada daftar catatan. Kamu juga dapat mempelajari teknik focus management agar pengguna keyboard tetap bisa menavigasi daftar catatan dengan nyaman.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperdalam Shadow DOM dengan memanfaatkan slot dan CSS custom properties untuk membuat komponen yang lebih fleksibel dan bisa di-styling ulang. Kamu juga dapat mempelajari pola CSS :host dan ::part untuk mengontrol gaya dari luar komponen.",
    "Sebagai pengembangan selanjutnya, kamu dapat menambahkan pengujian pada logika aplikasi catatan menggunakan Jest, terutama untuk menguji fungsi penambahan, penghapusan, dan pencarian catatan. Kamu juga dapat mempelajari pengujian komponen dengan Playwright agar interaksi pengguna ikut teruji.",
    "Sebagai pengembangan selanjutnya, kamu dapat meningkatkan performa render daftar catatan dengan menggunakan template element dan DocumentFragment agar pembaruan DOM lebih efisien. Kamu juga dapat mempelajari konsep virtual DOM untuk memahami bagaimana framework seperti React mengoptimalkan proses render.",
  ],
  "fe-fundamental-sub2": [
    "Sebagai pengembangan selanjutnya, kamu dapat memperkuat penanganan error pada pemanggilan REST API dengan memeriksa response.ok dan menampilkan pesan yang jelas ketika request gagal. Kamu juga dapat mempelajari penggunaan AbortController untuk membatalkan request yang tidak lagi dibutuhkan.",
    "Sebagai pengembangan selanjutnya, kamu dapat memperbaiki pengelolaan state asynchronous dengan menambahkan status loading, error, dan success secara konsisten di setiap pemanggilan API. Kamu juga dapat mempelajari pola optimistic update agar antarmuka terasa lebih responsif.",
    "Sebagai pengembangan selanjutnya, kamu dapat memanfaatkan code splitting pada Webpack dengan dynamic import agar berkas JavaScript terbagi menjadi chunk yang lebih kecil dan hanya dimuat saat dibutuhkan. Kamu juga dapat mempelajari lazy loading untuk komponen yang jarang digunakan.",
    "Sebagai pengembangan selanjutnya, kamu dapat menambahkan validasi data sebelum merender respons dari REST API untuk mencegah error ketika struktur data berubah. Kamu juga dapat mempelajari schema validation dengan library seperti Zod atau Joi.",
    "Sebagai pengembangan selanjutnya, kamu dapat memusatkan seluruh pemanggilan API dalam satu modul fetch wrapper agar konfigurasi header dan base URL tidak berulang. Kamu juga dapat mempelajari penggunaan interceptor untuk menangani token autentikasi secara otomatis.",
    "Sebagai pengembangan selanjutnya, kamu dapat menambahkan pengujian pada integrasi REST API menggunakan mock server agar pengujian tidak bergantung pada jaringan. Kamu juga dapat mempelajari end-to-end testing dengan Playwright untuk menguji alur lengkap aplikasi.",
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build a closing "wawasan tambahan" block for `kind`. Returns "" when the
// kind has no bank (e.g. unknown submission), so callers can skip silently.
function buildInsightBlock(kind) {
  const classes = CLASS_PATHS[kind];
  const tips = INDUSTRY_TIPS[kind];
  if (!classes || !tips) return "";

  const cls = pick(classes);
  const tip = pick(tips);

  return [
    "",
    "Wawasan tambahan untuk pengembanganmu ke depan:",
    `- Kelas lanjutan yang bisa kamu pelajari: ${cls}`,
    `- Praktik penulisan kode yang lebih efektif (standar industri): ${tip}`,
  ].join("\n");
}

// Actionable fix hints for each optional suggestion, keyed by report key. Used
// when all mandatory criteria pass but a suggestion is still unmet, so the
// student-facing feedback points at exactly what to improve.
const SUGGESTION_FEEDBACK = {
  "fe-fundamental-sub1": {
    "Suggestion 2: Realtime Form Validation":
      "Tambahkan validasi yang berjalan saat pengguna mengetik (event 'input'), misalnya tampilkan pesan error ketika judul kosong atau kurang dari N karakter — bukan hanya saat submit.",
    "Suggestion 3: Custom Attributes on Web Components":
      "Tambahkan atribut custom (contoh: type, data-note) pada salah satu custom element dan gunakan nilainya di dalam logika atau render komponen, bukan sekadar dideklarasikan.",
    "Suggestion 4: Mobile Responsiveness (No Overflow)":
      "Pastikan tidak ada overflow horizontal di layar sempit (mis. 390px): gunakan media query, grid/flex yang membungkus, dan batasi lebar elemen/gambar.",
  },
  "fe-fundamental-sub2": {
    "Suggestion 1: Archive & Unarchive Implementation":
      "Implementasikan fitur arsip: tombol arsip di tiap catatan yang memanggil endpoint archive, dan tampilkan daftar catatan terarsip terpisah dari catatan aktif.",
    "Suggestion 2: Error Feedback Handled":
      "Tampilkan feedback saat request gagal (alert, SweetAlert2, atau pesan di UI) agar pengguna tahu koneksi/API sedang bermasalah.",
    "Suggestion 3: Animation":
      "Tambahkan efek animasi/transisi (library seperti anime.js/GSAP, atau CSS transition/@keyframes) agar perpindahan antarmuka lebih halus.",
    "Suggestion 4: Prettier Formatter Configured":
      "Tambahkan Prettier sebagai devDependency di package.json dan sertakan file .prettierrc di root proyek.",
  },
};

function isPassValue(value) {
  return value === true || (typeof value === "string" && value.trim().toUpperCase().startsWith("PASS"));
}

function isInfoValue(value) {
  return typeof value === "string" && value.trim().toUpperCase().startsWith("INFO");
}

// Returns a feedback block listing suggestions still unmet (false or FAIL),
// skipping passed and INFO states. Empty string when nothing failed.
function buildFailedSuggestionFeedback(kind, optional) {
  const map = SUGGESTION_FEEDBACK[kind];
  if (!map) return "";

  const failed = Object.entries(optional || {})
    .filter(([key, value]) => map[key] && !isPassValue(value) && !isInfoValue(value))
    .map(([key]) => key);

  if (failed.length === 0) return "";

  const lines = failed.map((key) => `- ${key}: ${map[key]}`);
  return [
    "",
    "Catatan untuk perbaikan (saran yang belum terpenuhi):",
    ...lines,
  ].join("\n");
}

module.exports = { buildInsightBlock, buildFailedSuggestionFeedback };
