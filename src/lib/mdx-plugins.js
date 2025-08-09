import { visit } from 'unist-util-visit';

/**
 * 自定义rehype插件，将文本节点中的换行符转换为<br/>标签，以保留Markdown中的空行
 * 但会跳过列表项内的文本节点，以避免列表项中的点和文字不在同一行
 */
export const rehypePreserveNewlines = () => {
  return (tree) => {
    // 首先处理文本节点中的换行符
    visit(tree, 'text', (node, index, parent) => {
      // 检查父节点是否是列表项，如果是则跳过处理
      if (parent && (parent.tagName === 'li' || (parent.parent && parent.parent.tagName === 'li'))) {
        return;
      }
      
      if (node.value.includes('\n')) {
        // 分割文本中的换行符
        const parts = node.value.split('\n');
        const newNodes = [];
        
        parts.forEach((part, i) => {
          // 添加文本节点
          if (part !== '') {
            newNodes.push({
              type: 'text',
              value: part
            });
          } else if (i > 0 || parts.length === 1) {
            // 如果是空字符串但不是第一个元素，或者只有一个空元素
            // 添加一个空文本节点以保留空行
            newNodes.push({
              type: 'text',
              value: ''
            });
          }
          
          // 在每个部分后添加<br/>元素，除了最后一个部分
          if (i < parts.length - 1) {
            newNodes.push({
              type: 'element',
              tagName: 'br',
              properties: {},
              children: []
            });
          }
        });
        
        // 替换当前文本节点
        if (newNodes.length > 0) {
          parent.children.splice(index, 1, ...newNodes);
          return [visit.SKIP, index];
        }
      }
    });
    
    // 然后处理连续的空行
    visit(tree, 'element', (node) => {
      if (node.tagName === 'p' && node.children.length === 0) {
        // 为空段落添加<br/>元素
        node.children.push({
          type: 'element',
          tagName: 'br',
          properties: {},
          children: []
        });
      }
    });
  };
};
/**
 * 自定义rehype插件，处理连续的空行
 * 这个插件会将连续的空行转换为多个<p><br/></p>标签
 */
export const rehypeHandleConsecutiveBlankLines = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'root' || node.type === 'element') {
        const newChildren = [];
        let consecutiveNewlines = 0;
        
        // 遍历子节点
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          
          // 检测连续的换行或空段落
          if (
            (child.type === 'element' && child.tagName === 'br') ||
            (child.type === 'element' && child.tagName === 'p' && 
             child.children.length === 1 && 
             child.children[0].type === 'element' && 
             child.children[0].tagName === 'br')
          ) {
            consecutiveNewlines++;
            // 跳过当前节点，不添加到newChildren
            continue;
          }
          
          // 处理之前累积的连续换行
          while (consecutiveNewlines > 0) {
            // 创建一个空段落，包含一个<br/>元素
            newChildren.push({
              type: 'element',
              tagName: 'p',
              properties: {},
              children: [{
                type: 'element',
                tagName: 'br',
                properties: {},
                children: []
              }]
            });
            consecutiveNewlines--;
          }
          
          // 添加当前非换行节点
          newChildren.push(child);
        }
        
        // 处理末尾的连续换行
        while (consecutiveNewlines > 0) {
          newChildren.push({
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [{
              type: 'element',
              tagName: 'br',
              properties: {},
              children: []
            }]
          });
          consecutiveNewlines--;
        }
        
        // 替换子节点
        node.children = newChildren;
      }
    });
  };
};