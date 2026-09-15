import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AVATARS = [
  '/avatars/cyberpunk.png',
  '/avatars/mecha.png',
  '/avatars/neon_ghost.png',
  '/avatars/rtx_dragon.png'
];

const BADGES = [
  { id: 'pro_gamer', label: '🎮 Pro Gamer' },
  { id: 'streamer', label: '📡 Streamer' },
  { id: 'rtx_master', label: '⚡ RTX Master' },
  { id: 'night_owl', label: '🦉 Night Owl' },
  { id: 'vip_gold', label: '👑 Gold VIP' }
];

export default function ProfileModal({ profile, onClose, onUpdate }) {
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [bio, setBio] = useState(profile.bio || '');
  const [selectedBadges, setSelectedBadges] = useState(profile.badges || []);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#151922] border border-blue-900/40 rounded-xl p-6 w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4 text-blue-400">کاستومایز پروفایل</h2>
        
        {/* آواتارها */}
        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-400">انتخاب آواتار:</label>
          <div className="flex gap-3">
            {AVATARS.map((url) => (
              <img
                key={url}
                src={url}
                onClick={() => setAvatar(url)}
                className={`w-12 h-12 rounded-full cursor-pointer border-2 ${avatar === url ? 'border-blue-500 scale-110' : 'border-transparent'} transition`}               />             ))}           </div>         </div>          {/* بیوگرافی */}         <div className="mb-4">           <label className="block text-sm mb-2 text-gray-400">بیوگرافی:</label>           <textarea             value={bio}             onChange={(e) => setBio(e.target.value)}             className="w-full bg-[#0B0E14] border border-gray-800 rounded p-2 text-sm focus:outline-none focus:border-blue-500"             rows="3"             maxLength="120"           />         </div>          {/* بج‌ها */}         <div className="mb-6">           <label className="block text-sm mb-2 text-gray-400">انتخاب بج‌ها (حداکثر ۵ عدد):</label>           <div className="flex flex-wrap gap-2">             {BADGES.map((b) => (               <button                 key={b.id}                 onClick={() => toggleBadge(b.id)}                 className={`px-3 py-1 rounded-full text-xs transition ${selectedBadges.includes(b.id) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm">انصراف</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-semibold">
            {loading ? 'در حال ثبت...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </div>
  );
}
