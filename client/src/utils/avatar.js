// 英雄名称映射（从 heroes.js 提取）
const HEROES_MAP = {
  '亚托克斯': 'Aatrox', 'Aatrox': 'Aatrox',
  '阿狸': 'Ahri', 'Ahri': 'Ahri',
  '阿卡丽': 'Akali', 'Akali': 'Akali',
  '阿克尚': 'Akshan', 'Akshan': 'Akshan',
  '阿利斯塔': 'Alistar', 'Alistar': 'Alistar',
  '阿木木': 'Amumu', 'Amumu': 'Amumu',
  '艾尼维亚': 'Anivia', 'Anivia': 'Anivia',
  '安妮': 'Annie', 'Annie': 'Annie',
  '厄斐琉斯': 'Aphelios', 'Aphelios': 'Aphelios',
  '艾希': 'Ashe', 'Ashe': 'Ashe',
  '奥瑞利安·索尔': 'AurelionSol', 'AurelionSol': 'AurelionSol',
  '阿兹尔': 'Azir', 'Azir': 'Azir',
  '巴德': 'Bard', 'Bard': 'Bard',
  '卑尔维斯': 'Belveth', 'Belveth': 'Belveth',
  '布里茨': 'Blitzcrank', 'Blitzcrank': 'Blitzcrank',
  '布兰德': 'Brand', 'Brand': 'Brand',
  '布隆': 'Braum', 'Braum': 'Braum',
  '布蕾尔': 'Briar', 'Briar': 'Briar',
  '凯特琳': 'Caitlyn', 'Caitlyn': 'Caitlyn',
  '卡蜜尔': 'Camille', 'Camille': 'Camille',
  '卡西奥佩娅': 'Cassiopeia', 'Cassiopeia': 'Cassiopeia',
  '科加斯': 'Chogath', 'Chogath': 'Chogath',
  '库奇': 'Corki', 'Corki': 'Corki',
  '德莱厄斯': 'Darius', 'Darius': 'Darius',
  '黛安娜': 'Diana', 'Diana': 'Diana',
  '德莱文': 'Draven', 'Draven': 'Draven',
  '蒙多医生': 'DrMundo', 'DrMundo': 'DrMundo',
  '艾克': 'Ekko', 'Ekko': 'Ekko',
  '伊莉丝': 'Elise', 'Elise': 'Elise',
  '伊芙琳': 'Evelynn', 'Evelynn': 'Evelynn',
  '伊泽瑞尔': 'Ezreal', 'Ezreal': 'Ezreal',
  '费德提克': 'Fiddlesticks', 'Fiddlesticks': 'Fiddlesticks',
  '菲奥娜': 'Fiora', 'Fiora': 'Fiora',
  '菲兹': 'Fizz', 'Fizz': 'Fizz',
  '加里奥': 'Galio', 'Galio': 'Galio',
  '普朗克': 'Gangplank', 'Gangplank': 'Gangplank',
  '盖伦': 'Garen', 'Garen': 'Garen',
  '纳尔': 'Gnar', 'Gnar': 'Gnar',
  '古拉加斯': 'Gragas', 'Gragas': 'Gragas',
  '格雷福斯': 'Graves', 'Graves': 'Graves',
  '格温': 'Gwen', 'Gwen': 'Gwen',
  '赫卡里姆': 'Hecarim', 'Hecarim': 'Hecarim',
  '黑默丁格': 'Heimerdinger', 'Heimerdinger': 'Heimerdinger',
  '彗': 'Hwei', 'Hwei': 'Hwei',
  '俄洛伊': 'Illaoi', 'Illaoi': 'Illaoi',
  '艾瑞莉娅': 'Irelia', 'Irelia': 'Irelia',
  '艾翁': 'Ivern', 'Ivern': 'Ivern',
  '迦娜': 'Janna', 'Janna': 'Janna',
  '嘉文四世': 'JarvanIV', 'JarvanIV': 'JarvanIV',
  '贾克斯': 'Jax', 'Jax': 'Jax',
  '杰斯': 'Jayce', 'Jayce': 'Jayce',
  '烬': 'Jhin', 'Jhin': 'Jhin',
  '金克丝': 'Jinx', 'Jinx': 'Jinx',
  '卡莎': 'Kaisa', 'Kaisa': 'Kaisa',
  '卡莉丝塔': 'Kalista', 'Kalista': 'Kalista',
  '卡尔玛': 'Karma', 'Karma': 'Karma',
  '卡尔萨斯': 'Karthus', 'Karthus': 'Karthus',
  '卡萨丁': 'Kassadin', 'Kassadin': 'Kassadin',
  '卡特琳娜': 'Katarina', 'Katarina': 'Katarina',
  '凯尔': 'Kayle', 'Kayle': 'Kayle',
  '凯隐': 'Kayn', 'Kayn': 'Kayn',
  '凯南': 'Kennen', 'Kennen': 'Kennen',
  '卡兹克': 'Khazix', 'Khazix': 'Khazix',
  '千珏': 'Kindred', 'Kindred': 'Kindred',
  '克烈': 'Kled', 'Kled': 'Kled',
  '克格莫': 'KogMaw', 'KogMaw': 'KogMaw',
  '奎桑提': 'KSante', 'KSante': 'KSante',
  '乐芙兰': 'Leblanc', 'Leblanc': 'Leblanc',
  '李青': 'LeeSin', 'LeeSin': 'LeeSin',
  '蕾欧娜': 'Leona', 'Leona': 'Leona',
  '莉莉娅': 'Lillia', 'Lillia': 'Lillia',
  '丽桑卓': 'Lissandra', 'Lissandra': 'Lissandra',
  '卢锡安': 'Lucian', 'Lucian': 'Lucian',
  '璐璐': 'Lulu', 'Lulu': 'Lulu',
  '拉克丝': 'Lux', 'Lux': 'Lux',
  '墨菲特': 'Malphite', 'Malphite': 'Malphite',
  '马尔扎哈': 'Malzahar', 'Malzahar': 'Malzahar',
  '茂凯': 'Maokai', 'Maokai': 'Maokai',
  '易': 'MasterYi', 'MasterYi': 'MasterYi',
  '米利欧': 'Milio', 'Milio': 'Milio',
  '厄运小姐': 'MissFortune', 'MissFortune': 'MissFortune',
  '莫德凯撒': 'Mordekaiser', 'Mordekaiser': 'Mordekaiser',
  '莫甘娜': 'Morgana', 'Morgana': 'Morgana',
  '纳亚菲利': 'Naafiri', 'Naafiri': 'Naafiri',
  '娜美': 'Nami', 'Nami': 'Nami',
  '内瑟斯': 'Nasus', 'Nasus': 'Nasus',
  '诺提勒斯': 'Nautilus', 'Nautilus': 'Nautilus',
  '妮蔻': 'Neeko', 'Neeko': 'Neeko',
  '奈德丽': 'Nidalee', 'Nidalee': 'Nidalee',
  '尼菈': 'Nilah', 'Nilah': 'Nilah',
  '魔腾': 'Nocturne', 'Nocturne': 'Nocturne',
  '努努和威朗普': 'Nunu', 'Nunu': 'Nunu',
  '奥拉夫': 'Olaf', 'Olaf': 'Olaf',
  '奥莉安娜': 'Orianna', 'Orianna': 'Orianna',
  '奥恩': 'Ornn', 'Ornn': 'Ornn',
  '潘森': 'Pantheon', 'Pantheon': 'Pantheon',
  '波比': 'Poppy', 'Poppy': 'Poppy',
  '派克': 'Pyke', 'Pyke': 'Pyke',
  '奇亚娜': 'Qiyana', 'Qiyana': 'Qiyana',
  '奎因': 'Quinn', 'Quinn': 'Quinn',
  '洛': 'Rakan', 'Rakan': 'Rakan',
  '拉莫斯': 'Rammus', 'Rammus': 'Rammus',
  '雷克塞': 'RekSai', 'RekSai': 'RekSai',
  '芮尔': 'Rell', 'Rell': 'Rell',
  '烈娜塔': 'Renata', 'Renata': 'Renata',
  '雷克顿': 'Renekton', 'Renekton': 'Renekton',
  '雷恩加尔': 'Rengar', 'Rengar': 'Rengar',
  '锐雯': 'Riven', 'Riven': 'Riven',
  '兰博': 'Rumble', 'Rumble': 'Rumble',
  '瑞兹': 'Ryze', 'Ryze': 'Ryze',
  '莎弥拉': 'Samira', 'Samira': 'Samira',
  '瑟庄妮': 'Sejuani', 'Sejuani': 'Sejuani',
  '赛娜': 'Senna', 'Senna': 'Senna',
  '萨勒芬妮': 'Seraphine', 'Seraphine': 'Seraphine',
  '瑟提': 'Sett', 'Sett': 'Sett',
  '萨科': 'Shaco', 'Shaco': 'Shaco',
  '慎': 'Shen', 'Shen': 'Shen',
  '希瓦娜': 'Shyvana', 'Shyvana': 'Shyvana',
  '辛吉德': 'Singed', 'Singed': 'Singed',
  '赛恩': 'Sion', 'Sion': 'Sion',
  '希维尔': 'Sivir', 'Sivir': 'Sivir',
  '斯卡纳': 'Skarner', 'Skarner': 'Skarner',
  '娑娜': 'Sona', 'Sona': 'Sona',
  '索拉卡': 'Soraka', 'Soraka': 'Soraka',
  '斯维因': 'Swain', 'Swain': 'Swain',
  '塞拉斯': 'Sylas', 'Sylas': 'Sylas',
  '辛德拉': 'Syndra', 'Syndra': 'Syndra',
  '塔姆': 'TahmKench', 'TahmKench': 'TahmKench',
  '塔莉垭': 'Taliyah', 'Taliyah': 'Taliyah',
  '泰隆': 'Talon', 'Talon': 'Talon',
  '塔里克': 'Taric', 'Taric': 'Taric',
  '提莫': 'Teemo', 'Teemo': 'Teemo',
  '锤石': 'Thresh', 'Thresh': 'Thresh',
  '崔丝塔娜': 'Tristana', 'Tristana': 'Tristana',
  '特朗德尔': 'Trundle', 'Trundle': 'Trundle',
  '泰达米尔': 'Tryndamere', 'Tryndamere': 'Tryndamere',
  '崔斯特': 'TwistedFate', 'TwistedFate': 'TwistedFate',
  '图奇': 'Twitch', 'Twitch': 'Twitch',
  '乌迪尔': 'Udyr', 'Udyr': 'Udyr',
  '厄加特': 'Urgot', 'Urgot': 'Urgot',
  '韦鲁斯': 'Varus', 'Varus': 'Varus',
  '薇恩': 'Vayne', 'Vayne': 'Vayne',
  '维迦': 'Veigar', 'Veigar': 'Veigar',
  '维克兹': 'Velkoz', 'Velkoz': 'Velkoz',
  '薇古丝': 'Vex', 'Vex': 'Vex',
  '蔚': 'Vi', 'Vi': 'Vi',
  '佛耶戈': 'Viego', 'Viego': 'Viego',
  '维克托': 'Viktor', 'Viktor': 'Viktor',
  '弗拉基米尔': 'Vladimir', 'Vladimir': 'Vladimir',
  '沃利贝尔': 'Volibear', 'Volibear': 'Volibear',
  '沃里克': 'Warwick', 'Warwick': 'Warwick',
  '霞': 'Xayah', 'Xayah': 'Xayah',
  '泽拉斯': 'Xerath', 'Xerath': 'Xerath',
  '赵信': 'XinZhao', 'XinZhao': 'XinZhao',
  '亚索': 'Yasuo', 'Yasuo': 'Yasuo',
  '永恩': 'Yone', 'Yone': 'Yone',
  '约里克': 'Yorick', 'Yorick': 'Yorick',
  '悠米': 'Yuumi', 'Yuumi': 'Yuumi',
  '扎克': 'Zac', 'Zac': 'Zac',
  '劫': 'Zed', 'Zed': 'Zed',
  '泽丽': 'Zeri', 'Zeri': 'Zeri',
  '吉格斯': 'Ziggs', 'Ziggs': 'Ziggs',
  '基兰': 'Zilean', 'Zilean': 'Zilean',
  '佐伊': 'Zoe', 'Zoe': 'Zoe',
  '婕拉': 'Zyra', 'Zyra': 'Zyra',
};

// 支持的图片格式
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'webp'];

/**
 * 根据用户名获取可能的头像文件名（中文名和英文名）
 */
function getPossibleAvatarNames(username) {
  if (!username) return [];
  
  const names = [username]; // 原始用户名
  
  // 如果用户名在映射中，添加对应的英文名或中文名
  if (HEROES_MAP[username]) {
    const mappedName = HEROES_MAP[username];
    if (mappedName !== username) {
      names.push(mappedName);
    }
  }
  
  // 尝试查找反向映射（英文名 -> 中文名）
  for (const [cnName, enName] of Object.entries(HEROES_MAP)) {
    if (enName === username && cnName !== username) {
      names.push(cnName);
      break;
    }
  }
  
  return [...new Set(names)]; // 去重
}

/**
 * 生成默认头像URL列表（按优先级排序）
 * 默认头像始终从前端静态资源获取（/avatar/），不依赖后端
 */
function getDefaultAvatarUrls(username) {
  const names = getPossibleAvatarNames(username);
  const urls = [];
  
  // 默认头像始终从前端静态资源获取（public/avatar/）
  // 使用 Vite 的 BASE_URL 确保包含 base 配置（/runeterra/）
  // import.meta.env.BASE_URL 在生产环境是 '/runeterra/'，开发环境是 '/'
  const baseUrl = typeof import !== 'undefined' && import.meta?.env?.BASE_URL || '/';
  const basePath = `${baseUrl}avatar`.replace(/\/+/g, '/');  // 确保路径正确拼接，移除多余的斜杠
  
  for (const name of names) {
    for (const ext of IMAGE_EXTENSIONS) {
      urls.push(`${basePath}/${name}.${ext}`);
    }
  }
  
  return urls;
}

/**
 * 获取头像URL
 * @param {string} avatar - 数据库中的头像路径（如 'avatars/xxx.jpg' 或 null）
 * @param {string} username - 用户名（用于查找默认头像）
 * @returns {string} 头像URL
 */
import { getUploadUrl, getApiBaseUrl } from './config';

export function getAvatarUrl(avatar, username) {
  // 如果数据库中有头像且不是默认头像，使用数据库中的头像（从后端获取）
  if (avatar && avatar !== 'avatars/default-avatar.png' && avatar !== '') {
    return getUploadUrl(avatar);
  }
  
  // 否则，尝试使用默认头像（从前端静态资源获取）
  const defaultUrls = getDefaultAvatarUrls(username);
  // 返回第一个可能的URL，让浏览器尝试加载
  // 如果第一个失败，会在 onError 中处理
  const baseUrl = typeof import !== 'undefined' && import.meta?.env?.BASE_URL || '/';
  const defaultFallback = `${baseUrl}avatar/default.jpg`.replace(/\/+/g, '/');
  return defaultUrls[0] || defaultFallback;
}

/**
 * 创建头像加载错误处理函数
 * 当图片加载失败时，尝试默认头像，如果默认头像也失败则显示首字母fallback
 * @param {string} username - 用户名
 * @param {string} initialAvatar - 初始头像URL（用于判断是否已经尝试过默认头像）
 * @returns {function} 错误处理函数
 */
export function createAvatarErrorHandler(username, initialAvatar) {
  const defaultUrls = getDefaultAvatarUrls(username);
  const API_BASE_URL = getApiBaseUrl();
  
  return function handleError(e) {
    const img = e.target;
    
    // 如果已经标记为完成，直接显示fallback
    if (img.dataset.avatarFinished === 'true') {
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback) {
        fallback.style.display = 'flex';
      }
      return;
    }
    
    // 初始化或获取当前尝试的索引
    let currentIndex = parseInt(img.dataset.avatarRetryIndex) || -1;
    
    // 如果初始头像是服务器路径（数据库中的头像），开始尝试默认头像列表（前端静态资源）
    const API_BASE_URL = getApiBaseUrl();
    if (initialAvatar && (initialAvatar.includes('localhost:3001') || initialAvatar.includes('/uploads/') || (API_BASE_URL && initialAvatar.includes(API_BASE_URL))) && currentIndex === -1) {
      if (defaultUrls.length > 0) {
        currentIndex = 0;
        img.dataset.avatarRetryIndex = '0';
        img.src = defaultUrls[0];
        return;
      } else {
        // 没有默认URL，直接完成
        img.dataset.avatarFinished = 'true';
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback) {
          fallback.style.display = 'flex';
        }
        return;
      }
    }
    
    // 如果初始头像是默认头像路径（/avatar/开头或包含/avatars/），找到当前URL在列表中的位置
    const isDefaultAvatarPath = initialAvatar && (
      initialAvatar.startsWith('/avatar/') || 
      (API_BASE_URL && initialAvatar.includes('/avatars/'))
    );
    if (isDefaultAvatarPath && currentIndex === -1) {
      const initialIndex = defaultUrls.indexOf(initialAvatar);
      if (initialIndex >= 0 && initialIndex < defaultUrls.length - 1) {
        currentIndex = initialIndex + 1;
        img.dataset.avatarRetryIndex = String(currentIndex);
        img.src = defaultUrls[currentIndex];
        return;
      } else {
        // 已经是最后一个URL或找不到，直接完成
        img.dataset.avatarFinished = 'true';
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback) {
          fallback.style.display = 'flex';
        }
        return;
      }
    }
    
    // 如果正在尝试默认头像列表，继续尝试下一个
    if (currentIndex >= 0 && currentIndex < defaultUrls.length - 1) {
      currentIndex++;
      img.dataset.avatarRetryIndex = String(currentIndex);
      img.src = defaultUrls[currentIndex];
      return;
    }
    
    // 如果所有默认头像都尝试过了，显示fallback并停止
    img.dataset.avatarFinished = 'true';
    img.style.display = 'none';
    const fallback = img.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };
}

