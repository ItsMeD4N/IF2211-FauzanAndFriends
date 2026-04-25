# IF2211-FauzanAndFriends

## Deskripsi Singkat
Aplikasi Web Scraper yang mengimplementasikan algoritma Breadth-First Search (BFS) dan Depth-First Search (DFS) untuk mencari dan menelusuri elemen-elemen HTML berdasarkan selector CSS, serta mencari Lowest Common Ancestor (LCA) dari elemen-elemen di sebuah halaman web.

## Penjelasan Singkat Algoritma BFS dan DFS
Aplikasi ini memanfaatkan struktur data _tree_ untuk merepresentasikan struktur HTML dari halaman web yang diproses. Tiap tag HTML direpresentasikan sebagai _node_, dan elemen di dalam tag tersebut menjadi _child node_-nya.

### Breadth-First Search (BFS)
Algoritma pencarian yang menelusuri _tree_ secara melebar, lapis demi lapis (_level by level_). BFS dimulai dari _root node_ (tag `<html>`), lalu mengunjungi semua _node_ di tingkat yang sama (misalnya tag `<head>` dan `<body>`) sebelum melanjutkan ke tingkat yang lebih dalam. 
- **Implementasi:** Menggunakan struktur data antrean (_Queue_). _Node_ yang sedang dikunjungi dikeluarkan dari antrean, diperiksa apakah cocok dengan kriteria pencarian (selector), dan kemudian semua anak-anaknya (_children_) dimasukkan ke dalam antrean untuk kunjungan berikutnya.
- **Karakteristik:** Sangat efektif untuk menemukan elemen yang posisinya tidak terlalu dalam di struktur DOM.

### Depth-First Search (DFS)
Algoritma pencarian yang menelusuri _tree_ secara mendalam terlebih dahulu. DFS dimulai dari _root node_, lalu terus menyelusuri cabang pertama sedalam mungkin hingga mencapai _leaf node_ (node tanpa anak), sebelum mundur (_backtrack_) dan menelusuri cabang berikutnya.
- **Implementasi:** Menggunakan struktur data tumpukan (_Stack_) secara eksplisit. _Node_ dipop dari tumpukan, diperiksa, lalu anak-anaknya dipush ke tumpukan. Untuk menjaga urutan penelusuran (dari kiri ke kanan), anak-anak dipush ke tumpukan dari yang paling kanan ke paling kiri.
- **Karakteristik:** Cenderung lebih cepat jika elemen yang dicari letaknya berada sangat dalam pada suatu cabang DOM.

## Requirements Program
Aplikasi ini dibangun menggunakan arsitektur _Client-Server_. Berikut adalah kebutuhan (_requirements_) untuk menjalankan aplikasi:

1. **Backend (Server):**
   - [Go (Golang)](https://go.dev/) 
2. **Frontend (Client):**
   - [Node.js](https://nodejs.org/)
   - Package manager seperti `npm` atau `yarn`
3. **Pilihan Deployment:**
   - [Docker](https://www.docker.com/) & Docker Compose 

## Cara Instalasi dan Menjalankan Program

Terdapat dua cara utama untuk menjalankan aplikasi ini: menggunakan Docker atau menjalankannya secara manual.

### Cara 1: Menggunakan Docker Compose 
Cara ini paling direkomendasikan karena akan otomatis mem-build frontend dan backend lalu menyajikannya di satu kontainer secara terintegrasi.
1. Buka terminal atau command prompt.
2. Pastikan Anda berada di direktori utama (root) repository ini.
3. Jalankan perintah berikut:
   ```bash
   docker-compose up -d --build
   ```
4. Tunggu proses build selesai. Setelah selesai, aplikasi dapat diakses di browser melalui URL: `http://localhost:8080`
5. Untuk menghentikan aplikasi, gunakan perintah: `docker-compose down`

### Cara 2: Menjalankan Secara Manual
Jika Anda ingin menjalankan aplikasi tanpa Docker, ikuti langkah berikut:

#### 1. Build Client (Frontend)
Masuk ke folder `client`, install _dependencies_, dan lakukan build.
```bash
cd client
yarn install      # atau: npm install
yarn run build    # atau: npm run build
cd ..
```
*(Catatan: Langkah ini penting karena backend Golang secara default dikonfigurasi untuk menyajikan (_serve_) _file statis_ dari folder `./client/build` (atau `./client` tergantung konfigurasi final Anda). Pastikan folder client sudah berisi file yang siap di-_serve_).*

#### 2. Menjalankan Server (Backend)
Masuk ke folder `server` lalu jalankan server Go.
```bash
cd server
go mod tidy
go run main.go
```
Secara default, backend akan berjalan pada `http://localhost:8080`. Karena server Go meng-handle API route `/api/*` dan menyajikan halaman client dari rute `/`, Anda dapat langsung membuka browser pada `http://localhost:8080` untuk melihat hasilnya.

#### Alternatif Development Client (React)
Jika Anda ingin mengembangkan client dan melihat perubahannya secara instan:
```bash
cd client
yarn start   # atau: npm start
```
_(Akan berjalan pada http://localhost:3000. Pastikan server Go juga sedang berjalan agar API dapat diakses)._

## Author 
- 13524143 - Daniel Putra Rywandi S
- 13524145 - Dzakwan Muhammad Khairan P. P.
- 13524113 - Fauzan Mohamad Abdul Ghani
