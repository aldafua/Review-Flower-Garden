# Review Flower Garden

## Deskripsi Proyek

Review Flower Garden adalah aplikasi visualisasi data interaktif berbentuk taman bunga 3D. Setiap bunga merepresentasikan satu ulasan buku dari dataset Amazon Books Reviews. Aplikasi ini bertujuan untuk membantu pengguna memahami karakteristik ulasan buku melalui visualisasi yang menarik dan interaktif.

## Tujuan Proyek

1. Memvisualisasikan data ulasan buku dalam bentuk taman bunga 3D.
2. Menampilkan informasi ulasan berdasarkan rating, tahun, jumlah kata, jumlah karakter, dan helpfulness.
3. Mengubah atribut data menjadi karakteristik visual bunga agar pola data lebih mudah diamati.
4. Menyediakan interaksi untuk memilih bunga, melihat detail ulasan, serta mengatur tampilan taman.

## Sumber Dataset

Dataset yang digunakan adalah **Amazon Books Reviews** dari Kaggle, yang dipublikasikan oleh `mohamedbakhet`.

Sumber dataset: https://www.kaggle.com/datasets/mohamedbakhet/amazon-books-reviews

File utama yang digunakan untuk pengolahan ulasan adalah `Books_rating.csv`. Data diolah terlebih dahulu sebelum digunakan oleh aplikasi.

## Teknologi yang Digunakan

- **Python** — pengolahan dan pembersihan data.
- **Google Colab** — lingkungan untuk menjalankan notebook pengolahan data.
- **HTML** — struktur halaman aplikasi.
- **CSS** — pengaturan tampilan dan tata letak.
- **JavaScript** — logika aplikasi dan interaksi pengguna.
- **Three.js** — pembuatan visualisasi taman bunga 3D.
- **JSON** — penyimpanan data ulasan yang digunakan aplikasi.
- **GitHub** — penyimpanan dan pengelolaan kode sumber proyek.

## Struktur File

- `index.html` — struktur halaman aplikasi.
- `style.css` — gaya dan tata letak antarmuka.
- `script.js` — logika visualisasi 3D dan interaksi pengguna.
- `review_flower_garden_data.json` — data ulasan yang telah diolah untuk visualisasi.
- `README.md` — dokumentasi proyek.

## Pemetaan Atribut Data

| Atribut Data | Representasi Visual |
|---|---|
| Rating ulasan | Warna bunga |
| Jumlah kata ulasan | Ukuran bunga |
| Tahun ulasan | Posisi vertikal bunga |
| Jumlah karakter | Panjang kelopak bunga |
| Helpfulness | Lapisan kelopak bunga |

Pemetaan tersebut digunakan untuk membantu pengguna membandingkan karakteristik ulasan melalui tampilan visual.

## Cara Menjalankan Aplikasi

1. Unduh atau clone repository ini ke komputer.
2. Pastikan file `index.html`, `style.css`, `script.js`, dan `review_flower_garden_data.json` berada pada lokasi yang sesuai.
3. Buka folder proyek menggunakan Visual Studio Code.
4. Jalankan file `index.html` menggunakan ekstensi Live Server.
5. Buka alamat lokal yang diberikan Live Server melalui browser.
6. Pastikan koneksi internet tersedia karena Three.js dimuat melalui CDN.

## Notebook Pengolahan Data

Notebook Google Colab yang digunakan untuk mengolah dataset dapat diakses melalui tautan berikut:

https://colab.research.google.com/drive/1zdO7TGzNw7fnIM0T-v75kLkalxFOIhVr?usp=sharing

## Repository

Kode sumber proyek tersedia di GitHub:

https://github.com/aldafua/Review-Flower-Garden

## Catatan

Jumlah data dan nilai statistik yang ditampilkan pada aplikasi mengikuti data hasil pengolahan yang digunakan. Untuk menjalankan aplikasi dengan benar, pastikan file JSON tersedia dan memiliki struktur data yang sesuai dengan kebutuhan `script.js`.
