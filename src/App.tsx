import { useEffect, useState } from 'react';
import axios from 'axios';

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

function App() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    axios
      .get<WeatherData>(
        'https://api.open-meteo.com/v1/forecast?latitude=35.243&longitude=58.465&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Tehran'
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('خطا در دریافت اطلاعات');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-2xl animate-pulse">
        در حال بارگذاری...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  const current = data!.current;
  const daily = data!.daily;

  const weather = (code?: number): [string, string] => {
    const map: Record<number, [string, string]> = {
      0: ['آفتابی', '☀️'],
      1: ['نیمه آفتابی', '🌤️'],
      2: ['پوشیده', '☁️'],
      3: ['ابری', '☁️'],
      45: ['مه', '🌫️'],
      61: ['بارانی', '🌧️'],
      71: ['برفی', '❄️'],
      80: ['رگبار', '⛈️'],
    };
    return map[code ?? -1] || ['نامشخص', '❓'];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
        <header className="flex justify-between items-center p-5 backdrop-blur-lg bg-white/30 dark:bg-black/30 border-b border-white/20">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-2xl p-2 rounded-full bg-white/40 dark:bg-black/40 hover:scale-110 transition"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <h1 className="text-2xl font-bold">آب‌وهوای کاشمر</h1>
        </header>


      <main className="p-4 space-y-10 max-w-7xl mx-auto">
        <section className="rounded-3xl p-6 md:p-10 bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl">کاشمر</p>
              <p className="text-7xl font-light">
                {Math.round(current.temperature_2m)}°
              </p>
              <p className="text-2xl mt-2">{weather(current.weather_code)[0]}</p>
            </div>

            <div className="text-8xl">{weather(current.weather_code)[1]}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              ['احساس', current.apparent_temperature + '°'],
              ['رطوبت', current.relative_humidity_2m + '%'],
              ['باد', current.wind_speed_10m + ' km/h'],
              ['بارش', current.precipitation + ' mm'],
            ].map((i, k) => (
              <div
                key={k}
                className="rounded-xl p-4 bg-white/20 backdrop-blur-md text-center"
              >
                <p className="text-sm">{i[0]}</p>
                <p className="text-xl font-semibold">{i[1]}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-center">
            پیش‌بینی ۵ روز آینده
          </h2>

          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 overflow-x-auto md:overflow-visible pb-4">
            {daily.time.slice(0, 5).map((d: string, i: number) => (
              <div
                key={i}
                className="
                  min-w-40
                  rounded-3xl p-5 text-center
                  bg-white/40 dark:bg-white/10
                  backdrop-blur-xl
                  border border-white/30
                  shadow-lg
                  transition-all duration-300
                  hover:scale-[1.03]
                  hover:bg-white/60 dark:hover:bg-white/20
                  hover:shadow-2xl
                "
              >
                <p className="font-semibold mb-1">
                  {new Date(d).toLocaleDateString('fa-IR', { weekday: 'short' })}
                </p>
                <div className="text-5xl my-2">{weather(daily.weather_code[i])[1]}</div>
                <p className="font-bold">
                  {Math.round(daily.temperature_2m_min[i])}° –{' '}
                  {Math.round(daily.temperature_2m_max[i])}°
                </p>
                <p className="text-sm opacity-80">
                  {weather(daily.weather_code[i])[0]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center text-sm opacity-70 p-4">
        داده‌ها از Open-Meteo
      </footer>
    </div>
  );
}

export default App;

