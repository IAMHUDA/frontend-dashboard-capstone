import { Page } from "components/shared/Page";

export default function Dashboard() {
  return (
    // Latar belakang halaman utama (bg-gray-50 untuk terang, dark:bg-dark-900 untuk gelap)
    <Page title="Dashboard Admin">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-dark-900">
        <div className="min-w-0">
          {/* Judul Dashboard Admin */}
          <h2 className="text-2xl font-semibold tracking-wide">
            Dashboard Admin
          </h2>

          <div className="mt-6">
            <p className="text-lg font-medium">Selamat Datang, huda</p>
            {/* Teks Deskripsi tetap abu-abu agar tidak terlalu menonjol */}
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mt-1">
              Kelola dan pantau semua aktivitas survey serta data UMKM dengan
              mudah melalui dashboard terintegrasi.
            </p>
          </div>

          {/* Grid utama */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            
            {/* Card Survey */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 dark:bg-dark-800 dark:border-dark-700 shadow-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Survey</p>
              {/* Angka Utama: Hitam Pekat (text-gray-900) di mode terang */}
              <h3 className="text-3xl font-semibold mt-2 text-gray-900 dark:text-white">1</h3>
              <p className="text-green-600 dark:text-green-500 text-sm mt-2">+12% bulan ini</p>
              <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Kelola Survey →
              </button>
            </div>

            {/* Card UMKM */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 dark:bg-dark-800 dark:border-dark-700 shadow-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total UMKM</p>
              {/* Angka Utama: Hitam Pekat (text-gray-900) di mode terang */}
              <h3 className="text-3xl font-semibold mt-2 text-gray-900 dark:text-white">1</h3>
              <p className="text-green-600 dark:text-green-500 text-sm mt-2">+8% bulan ini</p>
              <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Kelola UMKM →
              </button>
            </div>

            {/* Card Pengguna */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 dark:bg-dark-800 dark:border-dark-700 shadow-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengguna</p>
              {/* Angka Utama: Hitam Pekat (text-gray-900) di mode terang */}
              <h3 className="text-3xl font-semibold mt-2 text-gray-900 dark:text-white">2</h3>
              <p className="text-green-600 dark:text-green-500 text-sm mt-2">+5% bulan ini</p>
              <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Kelola Pengguna →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}