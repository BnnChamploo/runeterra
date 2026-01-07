import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import { formatRuneterraTime } from '../utils/runeterraTime';
import { getAvatarUrl, createAvatarErrorHandler } from '../utils/avatar';
import { highlightMentionsSimple } from '../utils/highlightMentions';
import SearchableSelect from '../components/SearchableSelect';
import { getUploadUrl, getApiUrl } from '../utils/config';

// 可拖拽的回复项组件
const SortableReplyItem = ({ reply, index, isEditMode, onEdit, onDelete, users, regions, onUsersUpdate, customUsername, useCustomUsername, onCustomUsernameChange, onUseCustomUsernameChange, postUserId }) => {
  const replyQuillRef = useRef(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reply.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ReactQuill 模块配置
  const replyQuillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('images', file);
              try {
                const response = await api.post('/upload-image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                const imageUrl = getUploadUrl(response.data.images[0]);
                const quill = replyQuillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, 'image', imageUrl);
                  quill.setSelection(range.index + 1);
                }
              } catch (error) {
                console.error('上传图片失败:', error);
                alert('图片上传失败');
              }
            }
          };
        }
      }
    }
  }), []);

  if (isEditMode) {
    return (
      <div ref={setNodeRef} style={style} className="border-b border-gray-700 pb-4 mb-4 last:border-0">
        <div className="theme-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing theme-text-secondary hover:theme-text-primary"
                >
                  ⋮⋮
                </button>
                <span className="text-sm theme-text-secondary">楼层</span>
                <input
                  type="number"
                  value={reply.floor_number || index + 1}
                  onChange={(e) => onEdit(reply.id, { floor_number: parseInt(e.target.value) || null })}
                  className="w-16 px-2 py-1 theme-input rounded text-sm"
                  min="1"
                />
              </div>
              <button
                onClick={() => onDelete(reply.id)}
                className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md text-sm transition-colors"
              >
                删除
              </button>
            </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs theme-text-secondary mb-1">用户</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 mb-1">
                  <label className="flex items-center space-x-1 text-xs">
                    <input
                      type="radio"
                      checked={!useCustomUsername}
                      onChange={() => {
                        onUseCustomUsernameChange(false);
                        onCustomUsernameChange('');
                      }}
                      disabled={reply.is_anonymous === 1}
                      className="w-3 h-3"
                    />
                    <span className="text-xs">选择用户</span>
                  </label>
                  <label className="flex items-center space-x-1 text-xs">
                    <input
                      type="radio"
                      checked={useCustomUsername}
                      onChange={() => {
                        onUseCustomUsernameChange(true);
                        onEdit(reply.id, { user_id: null });
                      }}
                      disabled={reply.is_anonymous === 1}
                      className="w-3 h-3"
                    />
                    <span className="text-xs">自定义名称</span>
                  </label>
                </div>
                {!useCustomUsername ? (
                  <SearchableSelect
                    value={reply.user_id || ''}
                    onChange={(value) => onEdit(reply.id, { user_id: parseInt(value) || null })}
                    options={users}
                    placeholder="搜索并选择用户..."
                    disabled={reply.is_anonymous === 1}
                    className="w-full"
                  />
                ) : (
                  <input
                    type="text"
                    value={customUsername || ''}
                    onChange={(e) => onCustomUsernameChange(e.target.value)}
                    placeholder="输入自定义用户名"
                    disabled={reply.is_anonymous === 1}
                    className="w-full px-2 py-1 theme-input rounded text-sm"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs theme-text-secondary mb-1">匿名</label>
              <input
                type="checkbox"
                checked={reply.is_anonymous === 1}
                onChange={(e) => {
                  const isAnon = e.target.checked;
                  onEdit(reply.id, { is_anonymous: isAnon ? 1 : 0 });
                  if (isAnon) {
                    onUseCustomUsernameChange(false);
                    onCustomUsernameChange('');
                  }
                }}
                className="mt-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">时间</label>
              <input
                type="text"
                value={reply.custom_time || ''}
                onChange={(e) => onEdit(reply.id, { custom_time: e.target.value })}
                placeholder="AN时间"
                className="w-full px-2 py-1 theme-input rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">地区</label>
              <select
                value={reply.region || ''}
                onChange={(e) => onEdit(reply.id, { region: e.target.value })}
                className="w-full px-2 py-1 theme-input rounded text-sm"
              >
                <option value="">选择地区</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">头衔</label>
              <input
                type="text"
                value={reply.user_title || ''}
                onChange={(e) => onEdit(reply.id, { user_title: e.target.value })}
                placeholder="如：九尾妖狐"
                className="w-full px-2 py-1 theme-input rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">身份</label>
              <input
                type="text"
                value={reply.user_identity || ''}
                onChange={(e) => onEdit(reply.id, { user_identity: e.target.value })}
                placeholder="如：版主"
                className="w-full px-2 py-1 theme-input rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">段位/外号</label>
              <input
                type="text"
                value={reply.user_rank || ''}
                onChange={(e) => onEdit(reply.id, { user_rank: e.target.value })}
                placeholder="如：最强王者或九尾妖狐"
                className="w-full px-2 py-1 theme-input rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">楼层数</label>
              <input
                type="number"
                value={reply.floor_number || ''}
                onChange={(e) => onEdit(reply.id, { floor_number: parseInt(e.target.value) || null })}
                placeholder="留空则自动计数"
                className="w-full px-2 py-1 theme-input rounded text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">收藏数</label>
              <input
                type="number"
                value={reply.likes || 0}
                onChange={(e) => onEdit(reply.id, { likes: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 theme-input rounded text-sm"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs theme-text-secondary mb-1">内容</label>
            <div className="theme-input rounded">
              <ReactQuill
                ref={replyQuillRef}
                theme="snow"
                value={reply.content || ''}
                onChange={(content) => onEdit(reply.id, { content })}
                modules={replyQuillModules}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'link', 'image'
                ]}
                className="theme-quill"
                style={{ minHeight: '150px' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="border-b border-gray-700 pb-3 md:pb-4 mb-3 md:mb-4 last:border-0">
      <div className="flex items-start space-x-2 md:space-x-3">
        <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
          <img
            src={getAvatarUrl(reply.avatar, reply.username)}
            alt={reply.username}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-runeterra-gold theme-avatar-bg object-cover"
            onError={createAvatarErrorHandler(reply.username, getAvatarUrl(reply.avatar, reply.username))}
          />
          <div className="absolute inset-0 w-8 h-8 md:w-10 md:h-10 rounded-full border border-runeterra-gold theme-avatar-bg flex items-center justify-center text-runeterra-gold text-xs md:text-sm font-bold" style={{ display: 'none' }}>
            {reply.username?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1 md:gap-2 mb-1">
            <span className="text-xs md:text-sm theme-text-muted">#{reply.floor_number || index + 1}</span>
            <span className="text-xs md:text-sm text-runeterra-gold font-medium">{reply.username || '匿名用户'}</span>
            {reply.user_id && postUserId && String(reply.user_id) === String(postUserId) && (
              <span className="text-xs bg-runeterra-gold/30 text-runeterra-gold px-1 md:px-2 py-0.5 md:py-1 rounded font-medium">
                楼主
              </span>
            )}
            {!reply.is_anonymous && reply.user_title && (
              <span className="text-xs bg-runeterra-purple/30 text-runeterra-purple px-1 md:px-2 py-0.5 md:py-1 rounded">
                {reply.user_title}
              </span>
            )}
            {!reply.is_anonymous && reply.user_identity && (
              <span className="text-xs bg-runeterra-blue/30 text-runeterra-blue px-1 md:px-2 py-0.5 md:py-1 rounded">
                {reply.user_identity}
              </span>
            )}
            <span className="text-xs text-runeterra-gold">{reply.rank || '坚韧黑铁'}</span>
            <span className="theme-text-secondary hidden sm:inline">|</span>
            <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">发布于{formatRuneterraTime(reply.created_at, reply.custom_time)}</span>
            {reply.region && <><span className="text-gray-400 hidden sm:inline"> | </span><span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">来自 {reply.region}</span></>}
            {isEditMode && (
              <>
                <span className="text-gray-400 hidden sm:inline"> | </span>
                <input
                  type="number"
                  value={reply.likes || 0}
                  onChange={(e) => onEdit(reply.id, { likes: parseInt(e.target.value) || 0 })}
                  className="w-12 md:w-16 px-1 md:px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs md:text-sm"
                  min="0"
                />
                <span className="text-xs text-gray-500 hidden sm:inline">点赞</span>
              </>
            )}
            {!isEditMode && (
              <>
                <span className="text-gray-400 hidden sm:inline"> | </span>
                <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">点赞({reply.likes || 0})</span>
                <span className="text-gray-400 hidden sm:inline"> | </span>
                <button
                  onClick={() => {
                    // 触发回复功能，需要传递到ReplyForm
                    const event = new CustomEvent('replyToReply', {
                      detail: {
                        replyId: reply.id,
                        floorNumber: reply.floor_number || index + 1,
                        username: reply.username,
                        content: reply.content
                      }
                    });
                    window.dispatchEvent(event);
                    // 滚动到回复表单
                    document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className="text-xs md:text-sm text-runeterra-gold hover:text-yellow-400 transition-colors px-1 sm:px-0"
                >
                  回复
                </button>
              </>
            )}
          </div>
          {reply.parent_reply_id && reply.parent_username && (
            <div className="mb-2 md:mb-3 pl-3 md:pl-4 border-l-2 border-runeterra-gold/50">
              <div className="text-xs md:text-sm text-runeterra-gold mb-1">
                引用 #{reply.parent_floor_number || '?'} {reply.parent_username}:
              </div>
              <div className="text-xs md:text-sm theme-text-secondary" dangerouslySetInnerHTML={{ __html: highlightMentionsSimple(reply.parent_content || '') }} />
            </div>
          )}
          <div className="theme-text-primary mb-2 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: highlightMentionsSimple(reply.content) }} />
          {reply.images && reply.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {reply.images.map((img, idx) => (
                <img
                  key={idx}
                  src={getUploadUrl(img)}
                  alt={`回复图片${idx + 1}`}
                  className="max-w-full sm:max-w-xs rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingReplies, setEditingReplies] = useState([]);
  const [postCustomUsername, setPostCustomUsername] = useState('');
  const [postUseCustomUsername, setPostUseCustomUsername] = useState(false);
  // 存储每个回复的自定义用户名信息
  const [replyCustomUsernames, setReplyCustomUsernames] = useState(new Map());
  const [replyUseCustomUsernames, setReplyUseCustomUsernames] = useState(new Map());
  const postQuillRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const editMode = localStorage.getItem('editMode') === 'true';
    setIsEditMode(editMode);
    fetchPost();
    fetchReplies();
    fetchUsers();
    fetchRegions();
  }, [id]);

  // 监听编辑模式变化事件，避免页面重新加载
  useEffect(() => {
    const handleEditModeChange = (event) => {
      setIsEditMode(event.detail.isEditMode);
    };

    window.addEventListener('editModeChanged', handleEditModeChange);
    return () => {
      window.removeEventListener('editModeChanged', handleEditModeChange);
    };
  }, []);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
      setEditingPost(response.data);
    } catch (error) {
      console.error('获取帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await api.get(`/posts/${id}/replies`);
      setReplies(response.data);
      setEditingReplies(response.data);
    } catch (error) {
      console.error('获取回复失败:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await api.get('/regions');
      setRegions(response.data);
    } catch (error) {
      console.error('获取地区列表失败:', error);
    }
  };

  // 根据板块获取主板块，用于确定标签颜色
  const getMainCategory = (category) => {
    if (!category) return null;
    if (category.startsWith('plaza_')) return 'plaza';
    if (category.startsWith('gossip_')) return 'gossip';
    if (category.startsWith('emotion_')) return 'emotion';
    if (category.startsWith('life_')) return 'life';
    if (category === 'plaza') return 'plaza';
    if (category === 'gossip') return 'gossip';
    if (category === 'emotion') return 'emotion';
    if (category === 'life') return 'life';
    return null;
  };

  // 根据主板块返回标签颜色类
  const getCategoryColor = (category) => {
    const mainCategory = getMainCategory(category);
    switch (mainCategory) {
      case 'plaza':
        return 'bg-runeterra-purple/30 text-runeterra-purple';
      case 'gossip':
        return 'bg-orange-500/30 text-orange-400';
      case 'emotion':
        return 'bg-pink-500/30 text-pink-400';
      case 'life':
        return 'bg-green-500/30 text-green-400';
      default:
        return 'bg-runeterra-purple/30 text-runeterra-purple';
    }
  };

  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    fetch(getApiUrl('/categories/all'))
      .then(res => res.json())
      .then(data => {
        const map = {};
        Object.keys(data).forEach(key => {
          map[key] = data[key].name;
        });
        setCategoryMap(map);
      })
      .catch(err => console.error('获取板块名称失败:', err));
  }, []);

  const getCategoryName = (category) => {
    return categoryMap[category] || category;
  };

  // 帖子编辑的 ReactQuill 模块配置
  const postQuillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('images', file);
              try {
                const response = await api.post('/upload-image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                const imageUrl = getUploadUrl(response.data.images[0]);
                const quill = postQuillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, 'image', imageUrl);
                  quill.setSelection(range.index + 1);
                }
              } catch (error) {
                console.error('上传图片失败:', error);
                alert('图片上传失败');
              }
            }
          };
        }
      }
    }
  }), []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = editingReplies.findIndex(r => r.id === active.id);
    const newIndex = editingReplies.findIndex(r => r.id === over.id);
    const newReplies = arrayMove(editingReplies, oldIndex, newIndex);
    
    // 根据新位置自动调整楼层号和排序
    const replyUpdates = newReplies.map((reply, idx) => ({
      id: reply.id,
      floor_number: idx + 1, // 楼层号从1开始
      sort_order: idx
    }));

    try {
      // 批量更新楼层号和排序
      await Promise.all(replyUpdates.map(update => 
        api.put(`/replies/${update.id}`, {
          floor_number: update.floor_number,
          sort_order: update.sort_order
        })
      ));
      
      // 更新本地状态
      const updatedReplies = newReplies.map((reply, idx) => ({
        ...reply,
        floor_number: idx + 1,
        sort_order: idx
      }));
      setEditingReplies(updatedReplies);
    } catch (error) {
      console.error('更新排序失败:', error);
      alert('更新排序失败，请重试');
    }
  };

  const handleReplyEdit = (replyId, updates) => {
    const updated = editingReplies.map(r => 
      r.id === replyId ? { ...r, ...updates } : r
    );
    setEditingReplies(updated);
  };

  const handleReplyUpdate = async (replyId) => {
    const reply = editingReplies.find(r => r.id === replyId);
    if (!reply) return;
    
    try {
      // 处理自定义用户名：如果使用自定义用户名，需要先查找或创建用户
      let finalUserId = reply.user_id;
      const useCustom = replyUseCustomUsernames.get(replyId) || false;
      const customUsername = replyCustomUsernames.get(replyId) || '';
      
      if (!reply.is_anonymous && useCustom && customUsername.trim()) {
        // 查找是否存在该用户名的用户
        const existingUser = users.find(u => u.username === customUsername.trim());
        if (existingUser) {
          finalUserId = existingUser.id;
        } else {
          // 用户不存在，需要创建（使用默认密码1234567）
          try {
            const registerResponse = await api.post('/register', {
              username: customUsername.trim(),
              password: '1234567'
            });
            finalUserId = registerResponse.data.user.id;
            // 刷新用户列表
            fetchUsers();
          } catch (registerError) {
            // 如果注册失败（可能是并发创建），尝试再次查找
            await fetchUsers(); // 刷新用户列表
            const retryUser = users.find(u => u.username === customUsername.trim());
            if (retryUser) {
              finalUserId = retryUser.id;
            } else {
              alert('创建用户失败，请重试');
              return;
            }
          }
        }
      }
      
      const updatedReply = {
        ...reply,
        user_id: finalUserId
      };
      
      await api.put(`/replies/${replyId}`, updatedReply);
      fetchReplies();
    } catch (error) {
      console.error('更新回复失败:', error);
      alert(error.response?.data?.error || error.message || '更新失败，请重试');
    }
  };

  const handleReplyDelete = async (replyId) => {
    if (!confirm('确定删除这条回复吗？')) return;
    try {
      await api.delete(`/replies/${replyId}`);
      setEditingReplies(editingReplies.filter(r => r.id !== replyId));
      fetchReplies();
    } catch (error) {
      console.error('删除回复失败:', error);
    }
  };

  const handlePostUpdate = async () => {
    try {
      // 处理自定义用户名：如果使用自定义用户名，需要先查找或创建用户
      let finalUserId = editingPost.user_id;
      if (!editingPost.is_anonymous && postUseCustomUsername && postCustomUsername.trim()) {
        // 查找是否存在该用户名的用户
        const existingUser = users.find(u => u.username === postCustomUsername.trim());
        if (existingUser) {
          finalUserId = existingUser.id;
        } else {
          // 用户不存在，需要创建（使用默认密码1234567）
          try {
            const registerResponse = await api.post('/register', {
              username: postCustomUsername.trim(),
              password: '1234567'
            });
            finalUserId = registerResponse.data.user.id;
            // 刷新用户列表
            fetchUsers();
          } catch (registerError) {
            // 如果注册失败（可能是并发创建），尝试再次查找
            const retryUser = users.find(u => u.username === postCustomUsername.trim());
            if (retryUser) {
              finalUserId = retryUser.id;
            } else {
              alert('创建用户失败，请重试');
              return;
            }
          }
        }
      }
      
      const updatedPost = {
        ...editingPost,
        user_id: finalUserId
      };
      
      const response = await api.put(`/posts/${id}`, updatedPost);
      // 使用服务器返回的数据，确保 replies_count 是最新的
      const updatedPostData = response.data;
      setPost(updatedPostData);
      setEditingPost(updatedPostData);
      alert('帖子更新成功！');
    } catch (error) {
      console.error('更新帖子失败:', error);
      alert(error.response?.data?.error || error.message || '更新失败，请重试');
    }
  };


  const handleSaveAll = async () => {
    try {
      // 保存帖子
      await api.put(`/posts/${id}`, editingPost);
      
      // 保存所有回复（处理自定义用户名）
      for (const reply of editingReplies) {
        let finalUserId = reply.user_id;
        const useCustom = replyUseCustomUsernames.get(reply.id) || false;
        const customUsername = replyCustomUsernames.get(reply.id) || '';
        
        if (!reply.is_anonymous && useCustom && customUsername.trim()) {
          // 查找是否存在该用户名的用户
          const existingUser = users.find(u => u.username === customUsername.trim());
          if (existingUser) {
            finalUserId = existingUser.id;
          } else {
            // 用户不存在，需要创建（使用默认密码1234567）
            try {
              const registerResponse = await api.post('/register', {
                username: customUsername.trim(),
                password: '1234567'
              });
              finalUserId = registerResponse.data.user.id;
            } catch (registerError) {
              // 如果注册失败（可能是并发创建），尝试再次查找
              await fetchUsers(); // 刷新用户列表
              const retryUser = users.find(u => u.username === customUsername.trim());
              if (retryUser) {
                finalUserId = retryUser.id;
              } else {
                alert(`回复 #${reply.floor_number || reply.id} 创建用户失败，请重试`);
                continue;
              }
            }
          }
        }
        
        const updatedReply = {
          ...reply,
          user_id: finalUserId
        };
        
        await api.put(`/replies/${reply.id}`, updatedReply);
      }
      
      // 刷新用户列表（可能创建了新用户）
      await fetchUsers();
      
      // 更新排序
      const replyOrders = editingReplies.map((reply, idx) => ({
        id: reply.id,
        sort_order: idx
      }));
      await api.put(`/posts/${id}/replies/order`, { replyOrders });
      
      fetchPost();
      fetchReplies();
      alert('所有更改已保存！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-runeterra-gold">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-runeterra-gold">帖子不存在</div>
      </div>
    );
  }

  const displayReplies = isEditMode ? editingReplies : replies;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-4 py-4 md:py-8">
      <Link to="/" className="inline-block mb-4 text-runeterra-gold hover:underline">
        ← 返回首页
      </Link>

      {isEditMode && (
        <div className="mb-4 p-4 bg-runeterra-purple/20 border border-runeterra-purple rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-runeterra-purple font-bold">编辑模式</span>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-runeterra-gold text-runeterra-dark rounded-md hover:bg-yellow-600 transition-colors font-medium"
            >
              保存所有更改
            </button>
          </div>
        </div>
      )}

      <article className="theme-card rounded-lg p-8 border border-runeterra-gold/20 mb-6">
        {isEditMode ? (
          <div className="space-y-4">
            <div>
              <label className="block theme-label mb-2 font-medium">标题</label>
              <input
                type="text"
                value={editingPost?.title || ''}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full px-4 py-2 theme-input rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block theme-label mb-2 font-medium">用户</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={!postUseCustomUsername}
                        onChange={() => {
                          setPostUseCustomUsername(false);
                          setPostCustomUsername('');
                        }}
                        disabled={editingPost.is_anonymous === 1}
                        className="w-4 h-4"
                      />
                      <span className="theme-label text-sm">选择用户</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={postUseCustomUsername}
                        onChange={() => {
                          setPostUseCustomUsername(true);
                          setEditingPost({ ...editingPost, user_id: null });
                        }}
                        disabled={editingPost.is_anonymous === 1}
                        className="w-4 h-4"
                      />
                      <span className="theme-label text-sm">自定义名称</span>
                    </label>
                  </div>
                  {!postUseCustomUsername ? (
                    <SearchableSelect
                      value={editingPost.user_id || ''}
                      onChange={(value) => setEditingPost({ ...editingPost, user_id: parseInt(value) || null })}
                      options={users}
                      placeholder="搜索并选择用户..."
                      disabled={editingPost.is_anonymous === 1}
                      className="w-full"
                    />
                  ) : (
                    <input
                      type="text"
                      value={postCustomUsername}
                      onChange={(e) => setPostCustomUsername(e.target.value)}
                      placeholder="输入自定义用户名"
                      disabled={editingPost.is_anonymous === 1}
                      className="w-full px-4 py-2 theme-input rounded-md"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">匿名</label>
                <input
                  type="checkbox"
                  checked={editingPost.is_anonymous === 1}
                  onChange={(e) => {
                    const isAnon = e.target.checked;
                    setEditingPost({ ...editingPost, is_anonymous: isAnon ? 1 : 0 });
                    if (isAnon) {
                      setPostUseCustomUsername(false);
                      setPostCustomUsername('');
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">时间</label>
                <input
                  type="text"
                  value={editingPost.custom_time || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, custom_time: e.target.value })}
                  placeholder="AN时间（格式：YYYY-MM-DD HH:mm）"
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">地区</label>
                <select
                  value={editingPost.region || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, region: e.target.value })}
                  className="w-full px-4 py-2 theme-input rounded-md"
                >
                  <option value="">选择地区</option>
                  {regions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">头衔</label>
                <input
                  type="text"
                  value={editingPost.user_title || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, user_title: e.target.value })}
                  placeholder="如：九尾妖狐"
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">身份</label>
                <input
                  type="text"
                  value={editingPost.user_identity || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, user_identity: e.target.value })}
                  placeholder="如：版主"
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">段位/外号</label>
                <input
                  type="text"
                  value={editingPost.user_rank || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, user_rank: e.target.value })}
                  placeholder="如：最强王者（召唤师）或九尾妖狐（英雄外号）"
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">浏览量</label>
                <input
                  type="number"
                  value={editingPost.views || 0}
                  onChange={(e) => setEditingPost({ ...editingPost, views: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">收藏数</label>
                <input
                  type="number"
                  value={editingPost.likes || 0}
                  onChange={(e) => setEditingPost({ ...editingPost, likes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 theme-input rounded-md"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">回复数</label>
                <input
                  type="number"
                  value={editingPost.custom_replies_count !== undefined && editingPost.custom_replies_count !== null ? editingPost.custom_replies_count : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingPost({ 
                      ...editingPost, 
                      custom_replies_count: value === '' ? null : parseInt(value) || 0 
                    });
                  }}
                  placeholder="留空则使用实际回复数"
                  className="w-full px-4 py-2 theme-input rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label className="block theme-label mb-2 font-medium">置顶</label>
                <input
                  type="checkbox"
                  checked={editingPost.is_pinned === 1}
                  onChange={(e) => setEditingPost({ ...editingPost, is_pinned: e.target.checked ? 1 : 0 })}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <label className="block theme-label mb-2 font-medium">内容</label>
              <div className="theme-input rounded-md">
                <ReactQuill
                  ref={postQuillRef}
                  theme="snow"
                  value={editingPost?.content || ''}
                  onChange={(content) => setEditingPost({ ...editingPost, content })}
                  modules={postQuillModules}
                  formats={[
                    'header',
                    'bold', 'italic', 'underline', 'strike',
                    'list', 'bullet',
                    'link', 'image'
                  ]}
                  className="theme-quill"
                />
              </div>
            </div>
            <button
              onClick={handlePostUpdate}
              className="px-4 py-2 bg-runeterra-gold text-runeterra-dark rounded-md hover:bg-yellow-600 transition-colors"
            >
              保存帖子更改
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-4 flex-wrap">
              <span className={`px-3 py-1 rounded text-sm flex-shrink-0 ${getCategoryColor(post.category)}`}>
                {getCategoryName(post.category)}
              </span>
              <h1 className="text-3xl font-bold theme-text-primary flex-1 min-w-0">{post.title}</h1>
            </div>
            <div className="flex items-center flex-wrap gap-2 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <img
                    src={getAvatarUrl(post.avatar, post.username)}
                    alt={post.username}
                    className="w-8 h-8 rounded-full border border-runeterra-gold bg-gray-700 object-cover"
                    onError={createAvatarErrorHandler(post.username, getAvatarUrl(post.avatar, post.username))}
                  />
                  <div className="absolute inset-0 w-8 h-8 rounded-full border border-runeterra-gold bg-gray-700 flex items-center justify-center text-runeterra-gold text-xs font-bold" style={{ display: 'none' }}>
                    {post.username?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <span className="text-runeterra-gold">{post.username || '匿名用户'}</span>
                <span className="text-xs bg-runeterra-gold/30 text-runeterra-gold px-2 py-1 rounded font-medium">
                  楼主
                </span>
                {!post.is_anonymous && post.user_title && (
                  <span className="text-xs bg-runeterra-purple/30 text-runeterra-purple px-2 py-1 rounded">
                    {post.user_title}
                  </span>
                )}
                {!post.is_anonymous && post.user_identity && (
                  <span className="text-xs bg-runeterra-blue/30 text-runeterra-blue px-2 py-1 rounded">
                    {post.user_identity}
                  </span>
                )}
                <span className="text-xs text-runeterra-gold">{post.rank || '坚韧黑铁'}</span>
              </div>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">发布于{formatRuneterraTime(post.created_at, post.custom_time)}</span>
              {post.region && <><span className="text-gray-400 hidden sm:inline"> | </span><span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">来自 {post.region}</span></>}
              <span className="text-gray-400 hidden sm:inline"> | </span>
              <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">浏览量({post.views || 0})</span>
              <span className="text-gray-400 hidden sm:inline"> | </span>
              <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">评论({post.replies_count !== undefined ? post.replies_count : replies.length})</span>
              <span className="text-gray-400 hidden sm:inline"> | </span>
              <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">收藏({post.likes || 0})</span>
            </div>
            <div className="prose prose-invert max-w-none mb-6">
              <div className="theme-text-primary leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightMentionsSimple(post.content) }} />
            </div>
            {post.images && post.images.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getUploadUrl(img)}
                    alt={`帖子图片${idx + 1}`}
                    className="max-w-md rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </article>

      <div className="theme-card rounded-lg p-6 border border-runeterra-gold/20 mb-6">
        <h2 className="text-xl font-bold text-runeterra-gold mb-4">
          回复 ({(() => {
            if (isEditMode && editingPost?.custom_replies_count !== undefined && editingPost?.custom_replies_count !== null) {
              return editingPost.custom_replies_count;
            }
            return post?.replies_count !== undefined ? post.replies_count : displayReplies.length;
          })()})
        </h2>

        {displayReplies.length === 0 ? (
          <p className="theme-text-secondary text-center py-4">暂无回复</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            enabled={isEditMode}
          >
            <SortableContext
              items={displayReplies.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {displayReplies.map((reply, index) => (
                  <SortableReplyItem
                    key={reply.id}
                    reply={reply}
                    index={index}
                    isEditMode={isEditMode}
                    onEdit={handleReplyEdit}
                    onDelete={handleReplyDelete}
                    users={users}
                    regions={regions}
                    customUsername={replyCustomUsernames.get(reply.id) || ''}
                    useCustomUsername={replyUseCustomUsernames.get(reply.id) || false}
                    onCustomUsernameChange={(value) => {
                      const newMap = new Map(replyCustomUsernames);
                      newMap.set(reply.id, value);
                      setReplyCustomUsernames(newMap);
                    }}
                    onUseCustomUsernameChange={(value) => {
                      const newMap = new Map(replyUseCustomUsernames);
                      newMap.set(reply.id, value);
                      setReplyUseCustomUsernames(newMap);
                    }}
                    postUserId={post?.user_id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {!isEditMode && user && (
        <ReplyForm
          key={`reply-form-${id}`}
          postId={id}
          user={user}
          users={users}
          regions={regions}
          replies={replies}
          onReply={fetchReplies}
          onUsersUpdate={fetchUsers}
        />
      )}

      {user && (
        <div className="mt-4">
          <button
            onClick={async () => {
              if (!confirm('确定要删除这个帖子吗？此操作不可恢复！')) return;
              try {
                await api.delete(`/posts/${id}`);
                alert('帖子已删除');
                navigate('/');
              } catch (error) {
                console.error('删除帖子失败:', error);
                alert('删除失败，请重试');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            删除帖子
          </button>
        </div>
      )}
    </div>
  );
};

// 回复表单组件
const ReplyForm = ({ postId, user, users, regions, replies, onReply, onUsersUpdate }) => {
  const quillRef = useRef(null);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [parentReply, setParentReply] = useState(null);
  const [quillKey, setQuillKey] = useState(0);
  const [customTime, setCustomTime] = useState('');
  const [customTimeYear, setCustomTimeYear] = useState('');
  const [customTimeMonth, setCustomTimeMonth] = useState('');
  const [customTimeDay, setCustomTimeDay] = useState('');
  const [customTimeHour, setCustomTimeHour] = useState('');
  const [customTimeMinute, setCustomTimeMinute] = useState('');
  const [region, setRegion] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [userIdentity, setUserIdentity] = useState('');
  const [userRank, setUserRank] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '');
  const [customUsername, setCustomUsername] = useState('');
  const [useCustomUsername, setUseCustomUsername] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 监听回复事件
  useEffect(() => {
    const handleReplyToReply = (event) => {
      const { replyId, floorNumber, username, content } = event.detail;
      setParentReply({
        id: replyId,
        floorNumber,
        username,
        content
      });
    };

    window.addEventListener('replyToReply', handleReplyToReply);
    return () => {
      window.removeEventListener('replyToReply', handleReplyToReply);
    };
  }, []);

  // 记忆功能：当选择用户时，自动填充该用户在这个帖子中的最后一次回复的值
  useEffect(() => {
    if (selectedUserId && !useCustomUsername && replies && replies.length > 0) {
      // 查找该用户在这个帖子中的最后一次回复
      const userReplies = replies.filter(r => r.user_id === parseInt(selectedUserId));
      if (userReplies.length > 0) {
        // 按时间排序，取最后一次回复
        const lastReply = userReplies.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        })[0];
        
        // 填充表单
        if (lastReply.user_identity) setUserIdentity(lastReply.user_identity);
        if (lastReply.user_title) setUserTitle(lastReply.user_title);
        if (lastReply.user_rank) setUserRank(lastReply.user_rank);
        if (lastReply.region) setRegion(lastReply.region);
        if (lastReply.custom_time) {
          // 解析时间格式 YY-MM-DD HH:mm 或 YYYY-MM-DD HH:mm
          const timeMatch = lastReply.custom_time.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/);
          if (timeMatch) {
            setCustomTimeYear(timeMatch[1]);
            setCustomTimeMonth(timeMatch[2]);
            setCustomTimeDay(timeMatch[3]);
            setCustomTimeHour(timeMatch[4]);
            setCustomTimeMinute(timeMatch[5]);
          }
        }
      } else {
        // 如果该用户没有回复过，清空表单（但保留已输入的值，只在切换用户时清空）
      }
    } else if (useCustomUsername) {
      // 切换到自定义用户名时，不清空表单，让用户继续编辑
    }
  }, [selectedUserId, useCustomUsername]);

  // 确保 ReactQuill 正确初始化
  useEffect(() => {
    // 延迟检查，确保 DOM 已渲染
    const timer = setTimeout(() => {
      if (quillRef.current && !quillRef.current.getEditor()) {
        // 如果编辑器没有正确初始化，强制重新初始化
        setQuillKey(prev => prev + 1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [quillKey]);

  // 使用 useMemo 优化 ReactQuill 模块配置，减少 findDOMNode 警告
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              setUploading(true);
              const formData = new FormData();
              formData.append('images', file);
              try {
                const response = await api.post('/upload-image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                const imageUrl = getUploadUrl(response.data.images[0]);
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, 'image', imageUrl);
                  quill.setSelection(range.index + 1);
                }
              } catch (error) {
                console.error('上传图片失败:', error);
                alert('图片上传失败');
              } finally {
                setUploading(false);
              }
            }
          };
        }
      }
    }
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      // 格式化时间：如果输入了年月日时分，自动生成 YY-MM-DD HH:mm 或 YYYY-MM-DD HH:mm 格式
      let formattedTime = customTime || null;
      if (customTimeYear) {
        // 年份格式化：1-9年显示为01-09，10年以上显示原样
        const yearNum = parseInt(customTimeYear);
        const year = yearNum < 10 ? String(yearNum).padStart(2, '0') : String(customTimeYear);
        const month = customTimeMonth ? String(customTimeMonth).padStart(2, '0') : '01';
        const day = customTimeDay ? String(customTimeDay).padStart(2, '0') : '01';
        const hour = customTimeHour ? String(customTimeHour).padStart(2, '0') : '00';
        const minute = customTimeMinute ? String(customTimeMinute).padStart(2, '0') : '00';
        formattedTime = `${year}-${month}-${day} ${hour}:${minute}`;
      }
      
      // 处理自定义用户名：如果使用自定义用户名，需要先查找或创建用户
      let finalUserId = null;
      if (!isAnonymous) {
        if (useCustomUsername && customUsername.trim()) {
          // 查找是否存在该用户名的用户
          const existingUser = users.find(u => u.username === customUsername.trim());
          if (existingUser) {
            finalUserId = existingUser.id;
          } else {
            // 用户不存在，需要创建（使用默认密码1234567）
            try {
              const registerResponse = await api.post('/register', {
                username: customUsername.trim(),
                password: '1234567'
              });
              finalUserId = registerResponse.data.user.id;
            } catch (registerError) {
              // 如果注册失败（可能是并发创建），尝试再次查找
              const retryUser = users.find(u => u.username === customUsername.trim());
              if (retryUser) {
                finalUserId = retryUser.id;
              } else {
                throw new Error('创建用户失败，请重试');
              }
            }
          }
        } else {
          finalUserId = selectedUserId || user?.id;
        }
      }
      
      await api.post(`/posts/${postId}/replies`, {
        content,
        is_anonymous: isAnonymous,
        custom_time: formattedTime,
        region: region || null,
        user_title: userTitle || null,
        user_identity: userIdentity || null,
        user_rank: userRank || null,
        floor_number: floorNumber ? parseInt(floorNumber) : null,
        parent_reply_id: parentReply?.id || null,
        user_id: finalUserId,
        images: [],
      });
      setContent('');
      setCustomTime('');
      setCustomTimeYear('');
      setCustomTimeMonth('');
      setParentReply(null);
      setCustomTimeDay('');
      setCustomTimeHour('');
      setCustomTimeMinute('');
      setRegion('');
      setUserTitle('');
      setUserIdentity('');
      setUserRank('');
      setFloorNumber('');
      setCustomUsername('');
      // 如果创建了新用户，刷新用户列表
      if (useCustomUsername && customUsername.trim()) {
        onUsersUpdate && onUsersUpdate();
      }
      // 强制重新初始化 ReactQuill
      setQuillKey(prev => prev + 1);
      onReply();
    } catch (error) {
      console.error('发布回复失败:', error);
      alert(error.response?.data?.error || error.message || '发布回复失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-card rounded-lg p-6 border border-runeterra-gold/20">
      <h3 className="text-lg font-bold text-runeterra-gold mb-4">发表回复</h3>
      <form id="reply-form" onSubmit={handleSubmit} className="space-y-4">
        {parentReply && (
          <div className="mb-4 pl-4 border-l-2 border-runeterra-gold/50">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-runeterra-gold">
                引用 #{parentReply.floorNumber} {parentReply.username}:
              </div>
              <button
                type="button"
                onClick={() => setParentReply(null)}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                取消引用
              </button>
            </div>
            <div className="text-sm theme-text-secondary" dangerouslySetInnerHTML={{ __html: highlightMentionsSimple(parentReply.content) }} />
          </div>
        )}
        <div className="theme-input rounded-md">
          <ReactQuill
            key={quillKey}
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="写下你的回复..."
            modules={quillModules}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'list', 'bullet',
              'link', 'image'
            ]}
            className="theme-quill"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block theme-label mb-2 text-sm">发帖人</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="radio"
                    checked={!useCustomUsername}
                    onChange={() => {
                      setUseCustomUsername(false);
                      setCustomUsername('');
                    }}
                    disabled={isAnonymous}
                    className="w-4 h-4"
                  />
                  <span className="theme-label text-sm">选择用户</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="radio"
                    checked={useCustomUsername}
                    onChange={() => {
                      setUseCustomUsername(true);
                      setSelectedUserId('');
                    }}
                    disabled={isAnonymous}
                    className="w-4 h-4"
                  />
                  <span className="theme-label text-sm">自定义名称</span>
                </label>
              </div>
              {!useCustomUsername ? (
                <SearchableSelect
                  value={selectedUserId}
                  onChange={(value) => setSelectedUserId(value)}
                  options={users}
                  placeholder="搜索并选择用户..."
                  disabled={isAnonymous}
                  className="w-full"
                />
              ) : (
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="输入自定义用户名"
                  disabled={isAnonymous}
                  className="w-full px-3 py-2 theme-input rounded-md text-sm"
                />
              )}
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="theme-label text-sm">匿名回复</span>
            </label>
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">时间（瓦罗兰历）</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customTimeYear || ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    setCustomTimeYear(year);
                  }}
                  placeholder="年"
                  className="flex-[1.2] px-3 py-2 theme-input rounded-md text-sm min-w-[80px]"
                  min="1"
                />
                <input
                  type="number"
                  value={customTimeMonth || ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    if (month === '' || (!isNaN(month) && parseInt(month) >= 1 && parseInt(month) <= 12)) {
                      setCustomTimeMonth(month);
                    }
                  }}
                  placeholder="月（1-12）"
                  min="1"
                  max="12"
                  className="flex-1 px-3 py-2 theme-input rounded-md text-sm min-w-[90px]"
                />
                <input
                  type="number"
                  value={customTimeDay || ''}
                  onChange={(e) => {
                    const day = e.target.value;
                    if (day === '' || (!isNaN(day) && parseInt(day) >= 1 && parseInt(day) <= 31)) {
                      setCustomTimeDay(day);
                    }
                  }}
                  placeholder="日（1-31）"
                  min="1"
                  max="31"
                  className="flex-1 px-3 py-2 theme-input rounded-md text-sm min-w-[90px]"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customTimeHour || ''}
                  onChange={(e) => {
                    const hour = e.target.value;
                    if (hour === '' || (!isNaN(hour) && parseInt(hour) >= 0 && parseInt(hour) <= 23)) {
                      setCustomTimeHour(hour);
                    }
                  }}
                  placeholder="时（0-23）"
                  min="0"
                  max="23"
                  className="flex-1 px-3 py-2 theme-input rounded-md text-sm"
                />
                <input
                  type="number"
                  value={customTimeMinute || ''}
                  onChange={(e) => {
                    const minute = e.target.value;
                    if (minute === '' || (!isNaN(minute) && parseInt(minute) >= 0 && parseInt(minute) <= 59)) {
                      setCustomTimeMinute(minute);
                    }
                  }}
                  placeholder="分（0-59）"
                  min="0"
                  max="59"
                  className="flex-1 px-3 py-2 theme-input rounded-md text-sm"
                />
              </div>
            </div>
            {customTimeYear && (
              <p className="mt-1 text-xs theme-text-muted">
                将显示为：瓦罗兰历 {(() => {
                  const yearNum = parseInt(customTimeYear);
                  const year = yearNum < 10 ? String(yearNum).padStart(2, '0') : String(customTimeYear);
                  const month = customTimeMonth ? String(customTimeMonth).padStart(2, '0') : '01';
                  const day = customTimeDay ? String(customTimeDay).padStart(2, '0') : '01';
                  const hour = customTimeHour ? String(customTimeHour).padStart(2, '0') : '00';
                  const minute = customTimeMinute ? String(customTimeMinute).padStart(2, '0') : '00';
                  return `${year}-${month}-${day} ${hour}:${minute}`;
                })()}
              </p>
            )}
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">地区</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 theme-input rounded-md text-sm h-[42px]"
            >
              <option value="">选择地区</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">头衔</label>
            <input
              type="text"
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              placeholder="如：九尾妖狐"
              className="w-full px-3 py-2 theme-input rounded-md text-sm h-[42px]"
            />
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">身份</label>
            <input
              type="text"
              value={userIdentity}
              onChange={(e) => setUserIdentity(e.target.value)}
              placeholder="如：版主"
              className="w-full px-3 py-2 theme-input rounded-md text-sm h-[42px]"
            />
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">段位/外号</label>
            <input
              type="text"
              value={userRank}
              onChange={(e) => setUserRank(e.target.value)}
              placeholder="如：最强王者或九尾妖狐"
              className="w-full px-3 py-2 theme-input rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block theme-label mb-2 text-sm">楼层数</label>
            <input
              type="number"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
              placeholder="留空则自动计数"
              className="w-full px-3 py-2 theme-input rounded-md text-sm"
              min="1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 bg-runeterra-gold text-runeterra-dark hover:bg-yellow-600 transition-colors font-medium rounded-md disabled:opacity-50"
        >
          {submitting ? '发布中...' : '发布回复'}
        </button>
      </form>
    </div>
  );
};

export default PostDetail;

// 添加@用户名高亮样式和链接样式
if (typeof document !== 'undefined') {
  const styleId = 'mention-highlight-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mention-highlight {
        color: #fbbf24;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s;
      }
      .mention-highlight:hover {
        color: #fcd34d;
      }
      [data-theme="dark"] .mention-highlight {
        color: #fbbf24;
      }
      [data-theme="dark"] .mention-highlight:hover {
        color: #fcd34d;
      }
      [data-theme="light-white"] .mention-highlight {
        color: #d97706;
      }
      [data-theme="light-white"] .mention-highlight:hover {
        color: #f59e0b;
      }
      [data-theme="light"] .mention-highlight {
        color: #d97706;
      }
      [data-theme="light"] .mention-highlight:hover {
        color: #f59e0b;
      }
      /* 链接样式 */
      .theme-text-primary a,
      .theme-text-secondary a {
        color: #60a5fa;
        text-decoration: underline;
        transition: color 0.2s, text-decoration-color 0.2s;
      }
      .theme-text-primary a:hover,
      .theme-text-secondary a:hover {
        color: #93c5fd;
        text-decoration-color: #93c5fd;
      }
      [data-theme="dark"] .theme-text-primary a,
      [data-theme="dark"] .theme-text-secondary a {
        color: #60a5fa;
      }
      [data-theme="dark"] .theme-text-primary a:hover,
      [data-theme="dark"] .theme-text-secondary a:hover {
        color: #93c5fd;
      }
      [data-theme="light-white"] .theme-text-primary a,
      [data-theme="light-white"] .theme-text-secondary a {
        color: #2563eb;
      }
      [data-theme="light-white"] .theme-text-primary a:hover,
      [data-theme="light-white"] .theme-text-secondary a:hover {
        color: #3b82f6;
      }
      [data-theme="light"] .theme-text-primary a,
      [data-theme="light"] .theme-text-secondary a {
        color: #2563eb;
      }
      [data-theme="light"] .theme-text-primary a:hover,
      [data-theme="light"] .theme-text-secondary a:hover {
        color: #3b82f6;
      }
    `;
    document.head.appendChild(style);
  }
}
