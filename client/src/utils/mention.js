// @功能工具函数

// 解析内容中的@用户名，返回格式化后的HTML
export const parseMentions = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  // 匹配@用户名，支持中英文、数字、下划线
  // 格式：@用户名 或 @用户名@（如果后面还有@）
  const mentionRegex = /@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g;
  
  return htmlContent.replace(mentionRegex, (match, username) => {
    return `<span class="mention-user" data-username="${username}">@${username}</span>`;
  });
};

// 从纯文本中提取@用户名列表
export const extractMentions = (text) => {
  if (!text) return [];
  const mentionRegex = /@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // 去重
};

// 检查文本中是否包含@符号（用于触发用户列表显示）
export const checkMentionTrigger = (text, cursorPosition) => {
  if (!text || cursorPosition === null) return null;
  
  // 从光标位置向前查找@符号
  const textBeforeCursor = text.substring(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');
  
  if (lastAtIndex === -1) return null;
  
  // 检查@后面是否有空格或其他分隔符（如果有，说明@已经完成）
  const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
  if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
    return null;
  }
  
  // 返回@后的搜索关键词
  return textAfterAt;
};

