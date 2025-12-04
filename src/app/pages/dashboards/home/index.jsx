import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Building2, MapPin } from 'lucide-react';
import axios from 'utils/axios';
import api from 'configs/api.config';

export default function Dashboard() {
  
  // Fetch UMKM data
  const { data: umkmList = [] } = useQuery({
    queryKey: ['umkm'],
    queryFn: async () => {
      try {
        const res = await axios.get(api.umkm.list);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Error fetching UMKM:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch survey data
  const { data: surveyList = [] } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const res = await axios.get(api.surveys.list);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Error fetching surveys:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Process UMKM data by region (jangkauanPemasaran)
  const wilayahCount = {};
  umkmList.forEach(umkm => {
    const wilayah = umkm.jangkauanPemasaran || 'Lainnya';
    wilayahCount[wilayah] = (wilayahCount[wilayah] || 0) + 1;
  });

  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];
  const dataWilayah = Object.entries(wilayahCount)
    .map(([wilayah, total], index) => ({
      wilayah,
      total,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7); // Top 7 wilayah

  const totalUMKM = umkmList.length;
  const totalSurvey = surveyList.length;
  const totalSurveyTarget = 500; // Target estimasi
  const persentaseSurvey = totalSurveyTarget > 0 ? ((totalSurvey / totalSurveyTarget) * 100).toFixed(1) : 0;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalUMKM}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">UMKM Terdaftar</p>
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
          
          {/* Daftar Nama UMKM */}
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Daftar UMKM Terdaftar</h3>
            {totalUMKM > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {umkmList.map((umkm, index) => (
                  <div 
                    key={umkm.id || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{umkm.namaUsaha}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{umkm.namaPemilik}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{umkm.jangkauanPemasaran}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                Belum ada data UMKM
              </div>
            )}
          </div>

          {/* UMKM per Wilayah - Bar Chart */}
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">UMKM per Wilayah</h3>
            {dataWilayah.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
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
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                Belum ada data wilayah
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}