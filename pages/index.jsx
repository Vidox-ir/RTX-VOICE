import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProfileModal from '../components/ProfileModal';

export default function RTXVoiceDashboard() {
  const [session, setSession] = useState(null);
  const [authContact, setAuthContact] = useState('');
  const [authStep, setAuthStep] = useState('input'); // input | otp
  const [otpCode, setOtpCode] = useState('');
  
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [passInput, setPassInput] = useState('');
  const [selectedProtectedRoom, setSelectedProtectedRoom] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    fetchRooms();

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: true });
    if (data) setRooms(data);
  };

  const fetchProfile = async (userId) => {
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!data) {
      // ایجاد پروفایل پیش‌فرض در اولین ورود
      const defaultUsername = 'User_' + Math.floor(1000 + Math.random() * 9000);
      const { data: newProfile } = await supabase.from('profiles').insert([
        { id: userId, username: defaultUsername }
      ]).select().single();
      data = newProfile;
    }
    setProfile(data);
  };

  // ارسال کد تأیید (ایمیل یا شماره موبایل)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const isEmail = authContact.includes('@');
    
    let error;
    if (isEmail) {
      ({ error } = await supabase.auth.signInWithOtp({ email: authContact }));
    } else {
      ({ error } = await supabase.auth.signInWithOtp({ phone: authContact }));
    }

    if (error) {
      alert('خطا در ارسال کد: ' + error.message);
    } else {
      setAuthStep('otp');
    }
  };

  // تایید کد OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const isEmail = authContact.includes('@');
    
    const { data, error } = await supabase.auth.verifyOtp({
      [isEmail ? 'email' : 'phone']: authContact,
      token: otpCode,
      type: isEmail ? 'email' : 'sms'
    });

    if (error) {
      alert('کد وارد شده اشتباه است!');
    } else if (data.session) {
      setSession(data.session);
    }
  };

  const joinRoom = (room) => {
    if (room.type === 'vip' && !profile?.is_vip) {
      alert('🔒 این روم مخصوص کاربران VIP است.');
      return;
    }

    if (room.type === 'protected') {
      setSelectedProtectedRoom(room);
      return;
    }

    setCurrentRoom(room);
  };

  const verifyPasswordAndJoin = () => {
    if (passInput === selectedProtectedRoom.password) {
      setCurrentRoom(selectedProtectedRoom);
      setSelectedProtectedRoom(null);
      setPassInput('');
    } else {
      alert('❌ رمز عبور اشتباه است!');
    }
  };

  // ساختار صفحه ورود (اگر لاگین نکرده باشد)
  if (!session) {
    return (
      <div className="flex h-screen bg-[#0B0E14] items-center justify-center p-4 font-sans dir-rtl">
        <div className="bg-[#151922] border border-blue-900/30 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">RTX VOICE</h1>
          <p className="text-xs text-gray-400 mb-6">ورود به پلتفرم صوتی گیمرها</p>

          {authStep === 'input' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <input
                type="text"
                placeholder="ایمیل یا شماره موبایل (+98...)"
                value={authContact}
                onChange={(e) => setAuthContact(e.target.value)}
                required
                className="w-full bg-[#0B0E14] border border-blue-900/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 text-center dir-ltr"
              />
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30">
                ارسال کد تایید
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                placeholder="کد ۶ رقمی دریافتی"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                className="w-full bg-[#0B0E14] border border-blue-900/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 text-center dir-ltr tracking-widest"
              />
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30">
                ورود به برنامه
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ساختار اصلی داشبورد
  return (
    <div className="flex h-screen bg-[#0B0E14] text-gray-200 font-sans dir-rtl overflow-hidden">
      {/* Sidebar سمت راست (لیست چنل‌ها) */}
      <div className="w-72 bg-[#151922] border-l border-blue-900/20 flex flex-col justify-between select-none">
        <div>
          <div className="h-16 border-b border-blue-900/20 flex items-center px-5 font-black text-lg text-blue-500 tracking-wider shadow-md">
            <span className="ml-2">⚡</span> RTX VOICE
          </div>

          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[11px] font-bold text-gray-500 px-2 py-1 uppercase tracking-wider">کانال‌های صوتی (۱۰)</div>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  currentRoom?.id === room.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-[#1E2330] text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{room.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {room.type === 'protected' && <span className="text-xs">🔒</span>}
                  {room.type === 'vip' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">VIP</span>}
                  {room.max_users > 0 && <span className="text-[10px] text-gray-500">({room.max_users})</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* پنل پروفایل کاربر در پایین سایدمپ */}
        {profile && (
          <div className="p-3 bg-[#0E1118] border-t border-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full border border-blue-500/50 bg-blue-950/30 p-0.5" />
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{profile.username}</div>
                <div className="text-[10px] text-gray-500 truncate">{profile.bio || 'بدون بیوگرافی'}</div>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition">
              ⚙️
            </button>
          </div>
        )}
      </div>

      {/* بخش مرکزی (محیط مکالمه صوتی) */}
      <div className="flex-1 flex flex-col bg-[#0B0E14]">
        <div className="h-16 border-b border-blue-900/20 flex items-center justify-between px-6 bg-[#121620]">
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            {currentRoom ? <><span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> متصل به: {currentRoom.name}</> : 'یک کانال صوتی را انتخاب کنید'}
          </h1>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-red-400 hover:text-red-300">
              خروج از حساب
            </button>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          {currentRoom ? (
            <div className="text-center bg-[#151922] p-8 rounded-2xl border border-blue-900/30 shadow-2xl max-w-sm w-full">
              <div className="w-28 h-28 bg-blue-600/10 border-2 border-blue-500 rounded-full flex items-center justify-center animate-pulse mx-auto mb-6 shadow-xl shadow-blue-500/10">
                <span className="text-5xl">{isMuted ? '🎙️❌' : '🎙️'}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{currentRoom.name}</h2>
              <p className="text-xs text-gray-400 mb-6">محیط صوتی فعال و بدون نویز</p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isMuted ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {isMuted ? 'میکروفون غیرفعال' : 'میکروفون فعال'}
                </button>
                <button 
                  onClick={() => setCurrentRoom(null)} 
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30"
                >
                  قطع اتصال
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-center text-xs">
              برای شروع گفتگو از منوی سمت راست روی یکی از چنل‌ها کلیک کنید.
            </div>
          )}
        </div>
      </div>

      {/* مودال دریافت رمز روم ادمین */}
      {selectedProtectedRoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#151922] border border-blue-900/40 rounded-2xl p-6 w-full max-w-sm text-white shadow-2xl">
            <h3 className="text-sm font-bold mb-2">ورود به روم ادمین</h3>
            <p className="text-xs text-gray-400 mb-4">رمز مخصوص ادمین‌ها را وارد کنید:</p>
            <input
              type="password"
              placeholder="رمز عبور..."
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full bg-[#0B0E14] border border-blue-900/30 rounded-xl p-3 text-sm mb-4 focus:outline-none focus:border-blue-500 text-center"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedProtectedRoom(null)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">لغو</button>
              <button onClick={verifyPasswordAndJoin} className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-600/30">ورود</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش پروفایل */}
      {showProfileModal && (
        <ProfileModal 
          profile={profile} 
          onClose={() => setShowProfileModal(false)} 
          onUpdate={() => fetchProfile(session.user.id)} 
        />
      )}
    </div>
  );
}
