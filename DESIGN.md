# DESIGN.md — 苍月草 · 夜息

## 1. Objective

把「苍月草 + 花瓣」做成助眠工具的环境层，而不是装饰角花：访问者打开就能调一条夜声混音、看花瓣慢慢落下、跟着呼吸球把注意力从白天挪开。质量线是可公开使用的安静工具页——功能清楚，视觉不吵。

## 2. Product Context

- **What the product does:** 浏览器端白噪音助眠台——草风、远雨、夜虫、瓣落四路可混，带定时入睡与呼吸引导；苍月草铺底，花瓣持续飘落。
- **Who it's for:** 睡前需要环境声、又不想开 App/看推荐流的人；喜欢植物夜色美学、对刺眼 UI 敏感的 20–40 岁用户。
- **Adjacent brands:** myNoise（可混层）、Endel（氛围驱动）、Aesop（材质克制）。
- **Distant brand:** 抖音式高频动效与游戏化打卡——会把助眠做成另一种刺激。
- **Cultural register:** 安静、可关掉屏幕也能听、少文案多控件。

## 3. Visual Foundations

### 3a. Color

| Token | Hex | 用途 |
|---|---|---|
| `--ink` | `#080F14` | 最深底 |
| `--night` | `#0D1A22` | 主背景 |
| `--haze` | `#162832` | 面板 |
| `--leaf` | `#2F6B55` | 草叶深 |
| `--celadon` | `#7FB89A` | 苍青强调 |
| `--mist` | `#A8C9B8` | 次级文字 |
| `--moon` | `#E9F2EA` | 主文字 |
| `--gold` | `#C9B48A` | 唯一暖强调（开始/选中） |
| `--petal` | `#D4B8C4` | 花瓣淡粉灰（低饱和） |

**Usage rules:** 「开始夜息」与选中定时/声道用 `--gold`；播放中的呼吸环用 `--celadon`。花瓣禁止艳粉，必须压在夜色里。

### 3b. Typography

- **Display:** `"Songti SC", "STSong", "SimSun", "Noto Serif SC", Georgia, serif`
- **Body:** `"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`
- **Utility:** `"SF Mono", "Cascadia Code", Consolas, monospace`
- **Scale:** `12 / 14 / 16 / 18 / 24 / 32 / 48 / 72`
- **Weight:** 标题 600–700，正文 400，控件标签 400

### 3c. Spacing & rhythm

- **Base:** 8px；Scale 8–128
- **Generous:** 桌面分区 padding ≥ 80px；混音面板与呼吸区左右留白，避免控件贴边
- **Density:** 声道行高 44px+，滑杆拇指可点区域 ≥ 44px

### 3d. Component seeds

- **Button:** `ghost` / `gold` 两种；播放态主按钮可变为「暂停夜息」ghost
- **Slider:** 自定义轨道 `2px` 发丝线，拇指圆点 `--gold` 或 `--celadon`
- **Petal:** 低饱和 SVG/Canvas 花瓣，缓慢下落 + 轻微旋转
- **Grass:** 保留三层草海；分区底缘矮丛；辅加蕨叶/穗状剪影
- **Breathing ring:** 圆环按吸气-屏息-呼息缩放，reduce-motion 时只改文案不缩放

## 4. Accessibility

- 正文对比 ≥ 4.5:1；控件标签 ≥ 3:1
- `prefers-reduced-motion`: 花瓣静态少量、呼吸环不缩放、草海不摇曳；音频仍可播
- Focus: `2px solid var(--gold)` offset 3px
- 音频状态用 `aria-live` 文案播报（「夜息已开始」「定时结束」）
- 装饰草/瓣 `aria-hidden`

## 5. Voice & Tone

- **Register:** 安静、短句、可执行（「把草风调到 40%」）
- **Refuses:** 赋能、沉浸式极致、无缝、助你腾飞、一站式
- **Uses:** 夜息、声层、草风、远雨、夜虫、瓣落、定时、呼息
- **Address:** 「你」

## 6. Implementation Practices

- **Tokens:** CSS 变量
- **Audio:** Web Audio API 合成噪声/滤波，无外链音频文件
- **Petals:** Canvas 粒子，数量随窗口宽度
- **Grid:** 非对称——左混音、右呼吸；顶栏极简
- **Motion:** `cubic-bezier(0.22, 0.61, 0.36, 1)`；无弹跳
- **Files:** `index.html` + `styles.css` + `app.js`
- **Storage:** 仅记上次声道音量（localStorage），不上传

## 7. Anti-Patterns

- **No 紫青渐变英雄区。** 夜色实色 + 草海 + 花瓣。
- **No 圆角阴影六宫格。** 声道是列表滑杆，不是功能卡墙。
- **No emoji。** 花瓣/草/月全部绘制。
- **No 自动播放。** 必须用户点击才创建 AudioContext。
- **No 多主按钮。** 「开始夜息」唯一填充金按钮。
- **No 空话。** 控件旁只写具体状态与建议值。

## 8. Decision-Making

1. **音频可用性高于氛围。** 合成噪声必须可听且可静音，视觉服从控件。
2. **花瓣是环境不是彩蛋。** 常驻低密度飘落，可随 reduce-motion 降到静帧。
3. **苍月草仍是地基。** 不用花瓣替换草海；草在底，瓣在中景飘。
4. **唯一金色。** 开始/选中态用金；播放呼吸用青。
5. **减法。** 拿不准的控件不进首屏。

## 9. Workflow

1. 读 Objective / Product Context / Voice
2. 先定声层模型与定时，再排混音面板
3. 草海 + 花瓣 Canvas 叠在内容之下
4. 套用色板与 44px 触控
5. Anti-patterns + 对比度 + reduced-motion
6. 交付 `index.html`
