// 高亮@用户名的工具函数
// 在HTML内容中查找@用户名并添加样式

// 使用正则表达式替换文本内容（不破坏HTML标签）
export const highlightMentionsSimple = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;
  
  // 匹配@用户名，但需要确保不在HTML标签内
  // 使用负向前瞻来避免匹配HTML标签内的@
  // 匹配模式：@后跟中英文、数字、下划线，但不在HTML标签内
  const mentionRegex = /@([\u4e00-\u9fa5a-zA-Z0-9_]+)(?![^<]*>)/g;
  
  // 替换@用户名为带样式的span
  return htmlContent.replace(mentionRegex, '<span class="mention-highlight">@$1</span>');
};

