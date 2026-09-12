# 苍月草 · 夜息

月下白噪音助眠台：草风 / 远雨 / 夜虫 / 瓣落可混，带定时与呼吸引导。

## 打开

本地直接用浏览器打开 `index.html` 即可（无需构建）。

## 部署网站（GitHub Pages）

1. 进入仓库 `Settings -> Pages`
2. 在 **Build and deployment** 里将 **Source** 设为 **GitHub Actions**
3. 推送到 `main` 分支后会自动触发部署
4. 部署完成后，站点地址为：`https://<你的用户名>.github.io/cangyuecao-night/`

## 功能

- 四路 Web Audio 合成夜声（无外链音频文件）
- 板块切换：草海 / 声层 / 呼息 / 叠层
- 多层草海、花瓣飘落、鼠标拖尾瓣、萤火
- 定时关闭、4–7–8 呼吸引导
- 声景音量保存在浏览器 localStorage

## 技术

纯静态：`index.html` + `styles.css` + `app.js`
