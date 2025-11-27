---
title: 统一数据存储与API设计
date: 2025-11-12
hidden: true
tags: [dev, datasets]
---

## 目标

统一时间序列与分类数据的结构与访问方式，前端图表开箱即用。

## 数据模型

- Dataset：`id`、`type`、`name`、`tags[]`、`createdAt`、`updatedAt`、`version`
- Timeseries：`series[].points[]`（`{t,v}`）
- Categorical：`items[]`（`{key,label?,value,group?,color?}`）

## 存储布局

`src/data/datasets/<id>.json`；索引：`src/data/datasets/index.json`。

## API

- `GET /api/datasets` 列表与过滤
- `GET /api/datasets/:id` 详情与时间裁剪
- `PUT /api/datasets/:id/series/:key` 追加点位

## 约定

落盘仅在服务端进行，响应缓存 `s-maxage + swr`。

