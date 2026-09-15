import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProfileModal from '../components/ProfileModal';

export default function Dashboard({ user }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [selectedProtectedRoom, setSelectedProtectedRoom] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchRooms();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*');
    setRooms(data);
  };

  const joinRoom = (room) => {
    // ۱. بررسی دسترسی VIP
    if (room.type === 'vip' && !profile?.is_vip) {
      alert('این چنل مخصوص کاربران VIP است.');
      return;
    }

    // ۲. بررسی روم‌های دارای پسورد ادمین
    if (room.type === 'protected') {
      setSelectedProtectedRoom(room);
      return;
    }

    // ورود به روم عادی
    setCurrentRoom(room);
  };

  const verifyPasswordAndJoin = () => {
    if (passInput === selectedProtectedRoom.password) {
      setCurrentRoom(selectedProtectedRoom);
      setSelectedProtectedRoom(null);
      setPassInput('');
    } else {
      alert('رمز عبور اشتباه است!');
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0E14] text-gray-200 font-sans dir-rtl">
      {/* Sidebar - لیست چنل‌ها */}
      <div className="w-72 bg-[#151922] border-l border-blue-900/20 flex flex-col justify-between">
        <div>
          {/* هدر چنل اصلی */}
          <div className="h-16 border-b border-blue-900/20 flex items-center px-4 font-black text-xl text-blue-500 shadow-lg tracking-wider">
            RTX VOICE
          </div>

          {/* لیست روم‌های ۱۰ گانه */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1">کانال‌های صوتی</div>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                  currentRoom?.id === room.id ? 'bg-blue-600 text-white font-medium' : 'hover:bg-[#1E2330] text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔊</span>
                  <span>{room.name}</span>
                </div>
                {room.type === 'protected' && <span className="text-xs">🔒</span>}
                {room.type === 'vip' && <span className="text-xs text-amber-400">👑 VIP</span>}
              </button>
            ))}
          </div>
        </div>

        {/* پنل اکانت کاربر در انتهای سایدمپ */}
        {profile && (
          <div className="p-3 bg-[#0E1118] border-t border-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full border border-blue-500/50" />
              <div>
                <div className="text-sm font-bold text-white leading-none">{profile.username}</div>
                <div className="text-xs text-gray-500 mt-1">{profile.bio || 'بدون بیوگرافی'}</div>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
              ⚙️
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area - فضای داخل روم */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-blue-900/20 flex items-center px-6 bg-[#121620]">
          <h1 className="text-lg font-bold text-white">
            {currentRoom ? `متصل به: ${currentRoom.name}` : 'یک چنل صوتی را انتخاب کنید'}
          </h1>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          {currentRoom ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center animate-pulse mx-auto mb-4">
                <span className="text-4xl">🎙️</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{currentRoom.name}</h2>
              <p className="text-gray-400 text-sm">صدا متصل است (LiveKit / RTC Active)</p>
              
              <button 
                onClick={() => setCurrentRoom(null)} 
                className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
              >
                قطع اتصال
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              برای مکالمه روی یکی از روم‌های سمت راست کلیک کنید.
            </div>
          )}
        </div>
      </div>

      {/* مودال ورود رمز روم ادمین */}
      {selectedProtectedRoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#151922] border border-blue-900/40 rounded-xl p-6 w-full max-w-sm text-white">
            <h3 className="text-lg font-bold mb-2">ورود به روم ادمین</h3>
            <p className="text-xs text-gray-400 mb-4">برای ورود به این روم نیاز به رمز عبور ادمین دارید.</p>
            <input
              type="password"
              placeholder="Password..."
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full bg-[#0B0E14] border border-gray-800 rounded p-2 text-sm mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedProtectedRoom(null)} className="px-4 py-2 rounded bg-gray-800 text-xs">لغو</button>
              <button onClick={verifyPasswordAndJoin} className="px-4 py-2 rounded bg-blue-600 text-xs font-semibold">ورود</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تنظیمات پروفایل */}
      {showProfileModal && (
        <ProfileModal 
          profile={profile} 
          onClose={() => setShowProfileModal(false)} 
          onUpdate={fetchProfile} 
        />
      )}
    </div>
  );
}
