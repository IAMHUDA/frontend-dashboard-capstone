import  { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Building2, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [user] = useState({ nama: "Admin" });
  
  // Data UMKM per Kategori
  const dataKategori = [
    { name: 'Kuliner', value: 145, color: '#FF6B6B' },
    { name: 'Fashion', value: 98, color: '#4ECDC4' },
    { name: 'Kerajinan', value: 112, color: '#FFE66D' },
    { name: 'Jasa', value: 87, color: '#A8E6CF' },
    { name: 'Teknologi', value: 54, color: '#95B8D1' },
    { name: 'Lainnya', value: 76, color: '#FF8B94' }
  ];

  // Data UMKM per Wilayah
  const dataWilayah = [
    { wilayah: 'Sleman', total: 156, color: '#667eea' },
    { wilayah: 'Bantul', total: 142, color: '#764ba2' },
    { wilayah: 'Kota Yogya', total: 189, color: '#f093fb' },
    { wilayah: 'Kulon Progo', total: 98, color: '#4facfe' },
    { wilayah: 'Gunung Kidul', total: 87, color: '#00f2fe' }
  ];

  // Data Survey Timeline
  const dataSurvey = [
    { bulan: 'Jan', terisi: 45, total: 100 },
    { bulan: 'Feb', terisi: 78, total: 120 },
    { bulan: 'Mar', terisi: 123, total: 150 },
    { bulan: 'Apr', terisi: 167, total: 200 },
    { bulan: 'Mei', terisi: 234, total: 280 },
    { bulan: 'Jun', terisi: 312, total: 350 }
  ];

  const totalUMKM = dataKategori.reduce((sum, item) => sum + item.value, 0);
  const totalSurveyTerisi = dataSurvey[dataSurvey.length - 1].terisi;
  const totalSurveyTarget = dataSurvey[dataSurvey.length - 1].total;
  const persentaseSurvey = ((totalSurveyTerisi / totalSurveyTarget) * 100).toFixed(1);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Selamat Datang, <span className="font-semibold">{user?.nama || "User"}</span>!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalUMKM}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">UMKM Terdaftar</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Survey</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalSurveyTerisi}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Survey Terisi</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Target</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{persentaseSurvey}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pencapaian Survey</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Wilayah</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{dataWilayah.length}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cakupan Area</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* UMKM per Kategori - Pie Chart */}
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">UMKM per Kategori</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataKategori}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataKategori.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dataKategori.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* UMKM per Wilayah - Bar Chart */}
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">UMKM per Wilayah</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataWilayah}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="wilayah" 
                  tick={{ fill: '#6b7280' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {dataWilayah.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Survey Progress Chart - Full Width */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Progress Pengisian Survey</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dataSurvey}>
              <defs>
                <linearGradient id="colorTerisi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="bulan" 
                tick={{ fill: '#6b7280' }}
              />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="terisi" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fill="url(#colorTerisi)"
                name="Survey Terisi"
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fill="url(#colorTotal)"
                name="Target Total"
                dot={{ fill: '#06b6d4', r: 5 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Survey Terisi: {totalSurveyTerisi}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-600"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Target Total: {totalSurveyTarget}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}