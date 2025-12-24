import { useState, useRef } from 'react';
import api from '../utils/api';
import { getAvatarUrl, createAvatarErrorHandler } from '../utils/avatar';

const Profile = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [rank, setRank] = useState(user.rank || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    if (username !== user.username) {
      formData.append('username', username);
    }
    
    if (rank !== (user.rank || '')) {
      formData.append('rank', rank);
    }

    const file = fileInputRef.current?.files[0];
    if (file) {
      formData.append('avatar', file);
    }

    try {
      const response = await api.put('/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdate(response.data);
      setSuccess('更新成功！');
      if (file) {
        setAvatar(response.data.avatar);
      }
      // 更新本地rank状态
      if (response.data.rank !== undefined) {
        setRank(response.data.rank || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-runeterra-gold mb-6">个人资料</h1>

      <div className="theme-card rounded-lg p-8 border border-runeterra-gold/20">
        {error && (
          <div className="mb-4 p-3 theme-alert-error rounded border">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 theme-alert-success rounded border">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={getAvatarUrl(avatar, username)}
                alt={username}
                className="w-24 h-24 rounded-full border-4 border-runeterra-gold theme-avatar-bg object-cover"
                onError={createAvatarErrorHandler(username, getAvatarUrl(avatar, username))}
              />
              <div className="hidden w-24 h-24 rounded-full border-4 border-runeterra-gold theme-avatar-bg flex items-center justify-center text-runeterra-gold text-2xl font-bold">
                {username?.[0]?.toUpperCase() || '?'}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-runeterra-gold text-runeterra-dark rounded-full p-2 hover:bg-yellow-600 transition-colors"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      // 预览
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold theme-text-primary mb-2">{username}</h2>
              {rank && (
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-runeterra-blue text-white rounded text-sm">
                    {rank}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block theme-label mb-2 font-medium">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 theme-input rounded-md"
              required
            />
            <p className="mt-1 text-sm theme-text-muted">可以是英雄名字或符文大陆居民的名字</p>
          </div>
          <div>
            <label className="block theme-label mb-2 font-medium">段位/外号</label>
            <input
              type="text"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder={user.identity === '英雄' ? '如：九尾妖狐、暗裔剑魔等' : '如：最强王者、璀璨钻石等'}
              className="w-full px-4 py-3 theme-input rounded-md"
            />
            <p className="mt-1 text-sm theme-text-muted">
              {user.identity === '英雄' ? '英雄的外号（如：阿狸的外号是九尾妖狐）' : '召唤师的段位（如：最强王者、璀璨钻石等）'}
            </p>
          </div>

          <div>
            <label className="block theme-label mb-2 font-medium">头像</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 theme-input rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-runeterra-gold hover:file:bg-yellow-600"
            />
            <p className="mt-1 text-sm theme-text-muted">支持 jpg, png, gif, webp 格式，最大 5MB</p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-runeterra-gold/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-runeterra-gold">{user.posts_count || 0}</div>
              <div className="text-sm theme-text-secondary">发帖数</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-runeterra-gold text-runeterra-dark rounded-md hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存更改'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

