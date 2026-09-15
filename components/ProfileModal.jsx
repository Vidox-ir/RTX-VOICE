import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=RTX_Gamer',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberGhost',
  'https://api.dicebear.com/7.x/bottts/svg?seed=NeonKnight',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowPro',
  'https://api.dicebear.com/7.x/bottts/svg?seed=VipDragon'
];

const AVAILABLE_BADGES = [
  { id: 'pro_gamer', label: '🎮 Pro Gamer' },
  { id: 'streamer', label: '📡 Streamer' },
  { id: 'rtx_master', label: '⚡ RTX Master' },
  { id: 'night_owl', label: '🦉 Night Owl' },
  { id: 'vip_gold', label: '👑 Gold VIP' }
];

export default function ProfileModal({ profile, onClose, onUpdate }) {
  const [avatar, setAvatar] = useState(profile?.avatar_url || AVATARS[0]);
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedBadges, setSelectedBadges] = useState(profile?.badges || []);
  const [loading, setLoading] = useState(false);

  const toggleBadge = (badgeId) => {
    if (selectedBadges.includes(badgeId)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badgeId));
    } else {
      if (selectedBadges.length < 5) {
        setSelectedBadges([...selectedBadges, badgeId]);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatar, bio, badges: selectedBadges })
      .eq('id', profile.id);

    setLoading(false);
    if (!error) {
      onUpdate();
      onClose();
    } else {
      alert('خطا در بروزرسانی پروفایل: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#151922] border border-blue-900/40 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-blue-900/30 pb-2">تنظیمات پروفایل کاربر</h2>
        
        {/* انتخاب آواتار */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-2 text-gray-400">آواتارهای خفن گیمینگ:</label>
          <div className="flex justify-between items-center bg-[#0B0E14] p-3 rounded-xl border border-blue-900/20">
            {AVATARS.map((url, index) => (
              <img
                key={index}
                src={url}
                onClick={() => setAvatar(url)}
                className={`w-12 h-12 rounded-full cursor-pointer border-2 p-1 transition-all ${avatar === url ? 'border-blue-500 scale-110 bg-blue-950/50' : 'border-transparent opacity-70 hover:opacity-100'}`}
                alt="Avatar Option"
              />
            ))}
          </div>
        </div>

        {/* بیوگرافی */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-2 text-gray-400">بیوگرافی:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[#0B0E14] border border-blue-900/30 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 text-gray-200"
            rows="3"
            maxLength="120"
            placeholder="درباره خودت بنویس..."
          />
        </div>

        {/* بج‌های گیمینگ */}
        <div className="mb-6">
          <label className="block text-xs font-semibold mb-2 text-gray-400">انتخاب بج‌ها (حداکثر ۵ عدد):</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_BADGES.map((b) => {
              const isSelected = selectedBadges.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBadge(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-[#0B0E14] text-gray-400 border border-blue-900/30 hover:border-blue-500'}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/30">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold">انصراف</button>
          <button onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/40">
            {loading ? 'در حال ثبت...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </div>
  );
}
