// src/components/StructuredData.jsx
// 结构化数据组件，用于注入JSON-LD到页面头部

import Script from 'next/script';

/**
 * 结构化数据组件
 * @param {Object} props - 组件属性
 * @param {Object} props.data - 结构化数据对象
 * @param {string} props.id - 脚本标签ID（可选）
 * @returns {JSX.Element} Script组件
 */
export default function StructuredData({ data, id }) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return (
    <Script
      id={id || 'structured-data'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}

/**
 * 多个结构化数据组件
 * @param {Object} props - 组件属性
 * @param {Array} props.dataList - 结构化数据对象数组
 * @returns {JSX.Element} 多个Script组件
 */
export function MultipleStructuredData({ dataList }) {
  if (!Array.isArray(dataList) || dataList.length === 0) {
    return null;
  }

  return (
    <>
      {dataList.map((data, index) => (
        <StructuredData
          key={index}
          data={data}
          id={`structured-data-${index}`}
        />
      ))}
    </>
  );
}