# 让每一次起飞，都有证据。

**飞行汽车技术基础（选修）· 第二次作业 / CASE 02**

以汇天（ARIDGE）「陆地航母」X3-F 为对象，完成 **全方位安全分析**：运行域、危险识别、STPA、FMEA、FTA、SOTIF、TARA、坠撞/火灾、地面/接口、安全架构、GSN 安全论证与 V&V。

- **作者**：XLALA18 / 15230104
- **仓库**：https://github.com/XLALA18/Flying-car-coursework2
- **页面**：https://XLALA18.github.io/Flying-car-coursework2/
- **截止**：2026-11-26 18:00

> 本页是教学性安全分析，不是官方安全评估、适航结论或投资建议。  
> 风险评分、FMEA RPN、FTA、STPA、GSN 均为教学性重构；公开资料没有故障率与 fleet hours。

---

## 1. 本地预览

双击 `index.html` 即可。

如果浏览器限制本地文件，可在当前目录启动静态服务器：

```bash
python -m http.server 8000
# 访问 http://localhost:8000/
```

无需安装依赖，无构建步骤，无外部图片/字体/CDN。

---

## 2. 部署到 GitHub Pages

1. 新建 **Public** 仓库：`Flying-car-coursework2`。
2. 把本目录全部文件上传到仓库 **根目录**：
   - `index.html`
   - `styles.css`
   - `safety.css`
   - `safety-modules.css`
   - `safety-layout.css`
   - `app.js`
   - `README.md`
3. 打开 **Settings → Pages**。
4. **Build and deployment → Source** 选 **Deploy from a branch**。
5. Branch 选 `main`，Folder 选 `/ (root)`，保存。
6. 等 1–2 分钟，访问：

```text
https://XLALA18.github.io/Flying-car-coursework2/
```

7. 把该链接填进课程作业收集表。

> 必须是**根目录** `index.html`，不要变成 `仓库名/aeroht-safety/index.html`。  
> 如果 404：先确认仓库 Public、文件在 `main` 根目录、Pages 已保存。

---

## 3. 页面结构

| 区块 | 内容 |
| --- | --- |
| Hero | 六层防御图、关键数字、研究边界 |
| 00 摘要 | 三条安全判断：冗余、ODD、接口 |
| 01 边界 | 飞行体 / 陆行体 / 接口 / 组织；任务链；官方安全主张 |
| 02 方法 | 0–8 步 V 模型、六层防御、标准与框架 |
| 03 ODD | 昼间目视、120 m、20 km、2 座、私人/培训；越界清单 |
| 04 危险 | 16 个危险源、可交互 5×5 风险矩阵、筛选与详情 |
| 05 STPA | 控制结构、7 条 UCA、5 个损失场景 |
| 06 FMEA/FTA | 10 条 FMEA、定性故障树、最小割集 |
| 07 SOTIF | 感知—决策—执行—人；场景表与可预见误用 |
| 08 安全/EMC | 7 个攻击面、TARA、800V SiC 干扰 |
| 09 坠撞/火灾 | 垂直/纵向/横向、电池热失控链、伞降、撤离 |
| 10 地面/接口 | 接口 FMEA、两套安全 case、现场运行 |
| 11 架构 | Bow-tie、5 个失效情景推演、GSN、安全需求链 |
| 12 验证 | V&V 矩阵、建议指标、六道安全门 |
| 13 结论 | 五条判断、作业对齐 |
| 14 证据 | 10 条证据矩阵、局限、21 条参考、AI 使用记录 |

交互点：

- 风险矩阵：点击编号看详情；按类别筛选。
- STPA：控制结构 / UCA / 损失场景 tabs。
- 失效情景推演：单旋翼、GNSS、电池、飞行员失能、对接锁。
- 数字滚动、滚动进度、移动端目录、打印样式。

---

## 4. 提交前检查

- [ ] 页脚作者是 `XLALA18 / 15230104`
- [ ] 页脚网页链接是 `https://XLALA18.github.io/Flying-car-coursework2/`
- [ ] 仓库是 Public，根目录有 `index.html`
- [ ] Pages 已启用，链接能打开
- [ ] 手机宽度 390 px 下无横向滚动（风险矩阵已改成自适应）
- [ ] 通读“局限”一节，能解释“为什么不做定量概率”

---

## 5. 文件说明

```text
.
├── index.html            # 入口；全部内容与 SVG 图解
├── styles.css            # 第一版基础视觉系统（复用）
├── safety.css            # 安全主题、Hero、边界/方法/ODD
├── safety-modules.css    # 危险/STPA/FMEA/SOTIF/安全/坠撞/地面
├── safety-layout.css     # 架构/验证/结论/响应式/打印
├── app.js                # 导航、tabs、风险矩阵、筛选、情景推演
└── README.md
```

所有系统图、风险矩阵、故障树、bow-tie、GSN 均为原创 SVG/HTML，不使用未授权官方图片。

---

## 6. AI 使用与学术诚信

本页使用 AI 辅助完成资料检索、安全分析结构化、SVG 图解、前端编码与文案整理。关键事实回溯至参考文献；评分、FTA、STPA、GSN 均明确标注为教学性分析，不冒充企业或局方结论。

提交前请作者至少通读一遍，能解释：为什么 ODD 是最强屏障、为什么共因失效是冗余的隐形杀手、为什么接口是第三安全域。
