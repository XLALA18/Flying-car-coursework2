(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const number = new Intl.NumberFormat("zh-CN");

  /* ------------------------------------------------------------
     Header, progress, mobile navigation
     ------------------------------------------------------------ */
  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  const navToggle = $("#navToggle");
  const navLinks = $$("#siteNav a");
  let ticking = false;

  function updateScrollUI() {
    const top = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", top > 40);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
      progress.style.width = `${ratio * 100}%`;
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollUI();

  function closeNav() {
    if (!header) return;
    header.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.forEach((link) => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) return;
      if (!header.contains(event.target)) closeNav();
    });
  }

  const navMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) navMap.set(href.slice(1), link);
  });

  if ("IntersectionObserver" in window && navMap.size) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => link.classList.remove("is-active"));
          const link = navMap.get(entry.target.id);
          if (link) link.classList.add("is-active");
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    navMap.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------ */
  const revealElements = $$("[data-reveal]");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------
     Number count-up
     ------------------------------------------------------------ */
  function countUp(el) {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";
    const target = Number.parseFloat(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    const duration = prefersReducedMotion ? 0 : 850;
    const start = performance.now();

    function render(value) {
      el.innerHTML = `${number.format(Math.round(value))}${suffix ? `<small>${suffix}</small>` : ""}`;
    }

    if (duration === 0) {
      render(target);
      return;
    }

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      render(target * eased);
      if (p < 1) window.requestAnimationFrame(frame);
      else render(target);
    }
    window.requestAnimationFrame(frame);
  }

  const counters = $$(".count");
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(countUp);
  }

  /* ------------------------------------------------------------
     Generic tabs (STPA)
     ------------------------------------------------------------ */
  const tabs = $$(".tab");
  const panels = $$(".tab-panel");

  function activateTab(tab) {
    const target = tab.dataset.tab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === `panel-${target}`;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      const current = tabs.indexOf(tab);
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(current + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(current - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        activateTab(next);
        next.focus();
      }
    });
  });

  /* ------------------------------------------------------------
     Hazard register / risk matrix
     ------------------------------------------------------------ */
  const hazards = [
    {
      id: "H01", title: "非指令抬升 / 推力不对称", category: "control",
      s: 4, l: 2, triggers: "姿态估计错误、单侧旋翼失效、控制律瞬态、传感器漂移",
      consequences: "非指令滚转/偏航、悬停失稳、迫降或碰撞",
      barriers: ["三余度 FCC 投票", "旋翼反馈与差动限制", "包线保护", "飞行员手动接管"],
      evidence: "共因/独立性分析、故障注入、全包线试飞", residual: "目标：中（S4×L1）"
    },
    {
      id: "H02", title: "单旋翼 / 电机失效", category: "control",
      s: 4, l: 3, triggers: "桨叶损伤、电机堵转、电调功率管失效、线束断路",
      consequences: "推力不对称、姿态扰动、失控或迫降",
      barriers: ["6 旋翼冗余", "失效重构", "振动/电流监测", "整机伞"],
      evidence: "全包线单点/多点失效试验、瞬态响应", residual: "目标：中（S4×L2）"
    },
    {
      id: "H03", title: "飞控共因 / 投票失效", category: "control",
      s: 5, l: 1, triggers: "同源软件缺陷、共用电/传感器、共模干扰、维护配置错误",
      consequences: "三套飞控同时错误、失控",
      barriers: ["异构/独立飞控", "独立电源与传感器", "看门狗", "手动/伞降"],
      evidence: "共因分析、软件独立性、故障注入", residual: "目标：低（S5×L1）"
    },
    {
      id: "H04", title: "包线保护 / 控制律失效", category: "control",
      s: 4, l: 2, triggers: "高度/速度/姿态超限、能量预测错误、模式切换瞬态",
      consequences: "超包线、失速/失控、迫降",
      barriers: ["地理围栏", "能量预测", "模式预选", "强制告警"],
      evidence: "边界试飞、HIL、模式切换试验", residual: "目标：中（S4×L1）"
    },
    {
      id: "H05", title: "动力电池热失控", category: "energy",
      s: 5, l: 2, triggers: "内短路、挤压、过充、外部火烧、冷却失效",
      consequences: "起火、有毒烟气、动力丧失、结构损伤",
      barriers: ["BMS 多级保护", "熔断/隔离", "热隔离与泄压", "整机伞/迫降"],
      evidence: "整包热失控传播、碰撞后绝缘、循环老化", residual: "目标：中（S5×L1）"
    },
    {
      id: "H06", title: "高压绝缘 / 触电", category: "energy",
      s: 4, l: 2, triggers: "线束磨损、涉水、碰撞、维修误操作",
      consequences: "电击、起火、系统失效",
      barriers: ["绝缘监测", "高压互锁", "熔断", "维修断电程序"],
      evidence: "绝缘/耐压/涉水/碰撞后试验", residual: "目标：中（S4×L1）"
    },
    {
      id: "H07", title: "充电 / 补能热失控", category: "energy",
      s: 4, l: 2, triggers: "过充、接触不良、冷却失效、充电桩故障",
      consequences: "起火、营地人员伤害、资产损失",
      barriers: ["充电桩+BMS 双监测", "温度联锁", "消防隔离", "人员培训"],
      evidence: "充电故障注入、热失控、消防演练", residual: "目标：中（S4×L1）"
    },
    {
      id: "H08", title: "结构 / 对接锁失效", category: "structure",
      s: 5, l: 1, triggers: "疲劳、腐蚀、假锁、未按顺序锁止",
      consequences: "飞行体位移/掉落、结构损伤、失控",
      barriers: ["三取二锁止传感器", "机械互锁", "顺序控制", "起飞前物理确认"],
      evidence: "疲劳/振动/误操作试验、接口 FMEA", residual: "目标：低（S5×L1）"
    },
    {
      id: "H09", title: "整机伞失效 / 开伞超包线", category: "structure",
      s: 5, l: 1, triggers: "弹射失败、伞绳缠绕、姿态/速度/高度不在包线",
      consequences: "减速失败、高速触地",
      barriers: ["包线判断", "冗余弹射", "定期打包/检测", "伞降试验"],
      evidence: "全包线开伞、重复可靠性、伞绳缠绕", residual: "目标：低（S5×L1）"
    },
    {
      id: "H10", title: "起降场人员 / 障碍侵入", category: "structure",
      s: 4, l: 3, triggers: "观众越线、地勤误入、车辆/无人机闯入、FOD",
      consequences: "旋翼/人员伤害、起降失败、第三方伤亡",
      barriers: ["隔离区", "现场指挥", "净空检查", "互锁/告警"],
      evidence: "场地演练、人员动线、FOD 程序", residual: "目标：中（S4×L2）"
    },
    {
      id: "H11", title: "低空阵风 / 风切变", category: "human",
      s: 4, l: 3, triggers: "山谷/湖边/建筑间风场突变、阵风、下洗",
      consequences: "姿态偏差、漂移、迫降",
      barriers: ["风速限制", "阵风抑制", "备降点", "现场观测"],
      evidence: "风洞/试飞包线、气象决策程序", residual: "目标：中（S4×L2）"
    },
    {
      id: "H12", title: "飞行员模式混淆 / 超负荷", category: "human",
      s: 4, l: 3, triggers: "自动/手动切换、告警过载、低空短窗口、训练不足",
      consequences: "错误操纵、失去情景意识、失控",
      barriers: ["模式预选", "明确 HMI", "训练/复训", "语音告警"],
      evidence: "HMI 评估、模拟机、航线训练", residual: "目标：中（S4×L2）"
    },
    {
      id: "H13", title: "维护差错 / 放行错误", category: "human",
      s: 4, l: 3, triggers: "故障未排除、软件配置错误、伞/旋翼安装错误",
      consequences: "带病飞行、空中失效",
      barriers: ["双签", "配置管理", "功能检查", "飞行前自检"],
      evidence: "维修差错率、审计、事件报告", residual: "目标：中（S4×L2）"
    },
    {
      id: "H14", title: "超范围 / 商业载客运行", category: "human",
      s: 5, l: 2, triggers: "营地商业压力、夜航、超程、载客、复杂空域",
      consequences: "进入未验证包线、事故、监管失效",
      barriers: ["ODD 锁定", "合同/保险", "现场停飞权", "SMS"],
      evidence: "运行审计、事件报告、监管许可", residual: "目标：低（S5×L1）"
    },
    {
      id: "H15", title: "GNSS / 通信干扰 / 欺骗", category: "cyber",
      s: 4, l: 2, triggers: "压制、欺骗、重放、链路劫持、EMC 干扰",
      consequences: "定位错误、返航错误、失控",
      barriers: ["多源融合", "认证/跳频", "惯导兜底", "地理围栏"],
      evidence: "场景注入、渗透测试、EMC 试验", residual: "目标：中（S4×L1）"
    },
    {
      id: "H16", title: "地面运输 / 6×6 碰撞", category: "ground",
      s: 3, l: 3, triggers: "急刹、侧翻、追尾、涉水、固定失效",
      consequences: "电池/结构损伤、接口变形、起火",
      barriers: ["固定/限位", "限速/路线", "碰撞传感器", "运输后检查"],
      evidence: "运输振动/碰撞、固定失效试验", residual: "目标：中（S3×L2）"
    }
  ];

  const categoryLabels = {
    control: "飞行控制",
    energy: "能源/电池",
    structure: "结构/接口",
    human: "运行/人因",
    cyber: "网络/EMC",
    ground: "地面/接口"
  };

  const bandFor = (score) => {
    if (score >= 15) return "extreme";
    if (score >= 8) return "high";
    if (score >= 4) return "medium";
    return "low";
  };

  const riskMatrix = $("#riskMatrix");
  const hazardTableBody = $("#hazardTableBody");
  const hazardDetailBody = $("#hazardDetailBody");
  const hazardFilters = $$("#hazardFilters .chip");
  let activeHazardFilter = "all";
  let selectedHazardId = null;

  function filteredHazards() {
    return activeHazardFilter === "all"
      ? hazards
      : hazards.filter((hazard) => hazard.category === activeHazardFilter);
  }

  function renderRiskMatrix() {
    if (!riskMatrix) return;
    const rows = [5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5];
    let html = '<div class="risk-axis-label">S ↓<br>L →</div>';
    cols.forEach((l) => {
      html += `<div class="risk-col-label">L${l}</div>`;
    });

    rows.forEach((s) => {
      html += `<div class="risk-row-label">S${s}</div>`;
      cols.forEach((l) => {
        const score = s * l;
        const band = bandFor(score);
        const items = filteredHazards().filter((hazard) => hazard.s === s && hazard.l === l);
        html += `<div class="risk-cell risk-${band}" data-score="${score}">`;
        items.forEach((hazard) => {
          html += `<button class="risk-node${hazard.id === selectedHazardId ? " is-selected" : ""}" type="button" data-hazard="${hazard.id}" aria-label="${hazard.id} ${hazard.title}">${hazard.id}</button>`;
        });
        html += "</div>";
      });
    });

    riskMatrix.innerHTML = html;
    $$(".risk-node", riskMatrix).forEach((button) => {
      button.addEventListener("click", () => selectHazard(button.dataset.hazard));
    });
  }

  function renderHazardTable() {
    if (!hazardTableBody) return;
    const list = filteredHazards();
    hazardTableBody.innerHTML = list.map((hazard) => {
      const score = hazard.s * hazard.l;
      const band = bandFor(score);
      return `
        <tr data-hazard="${hazard.id}">
          <td>${hazard.id}</td>
          <td><b>${hazard.title}</b></td>
          <td>${categoryLabels[hazard.category]}</td>
          <td>${hazard.s}</td>
          <td>${hazard.l}</td>
          <td><span class="risk-pill risk-${band}">${score} · ${band === "extreme" ? "极高" : band === "high" ? "高" : band === "medium" ? "中" : "低"}</span></td>
          <td>${hazard.barriers.slice(0, 2).join(" · ")}</td>
          <td>${hazard.residual}</td>
        </tr>`;
    }).join("");

    $$("tr[data-hazard]", hazardTableBody).forEach((row) => {
      row.addEventListener("click", () => selectHazard(row.dataset.hazard));
      row.style.cursor = "pointer";
    });
  }

  function selectHazard(id) {
    const hazard = hazards.find((item) => item.id === id);
    if (!hazard || !hazardDetailBody) return;
    selectedHazardId = id;
    const score = hazard.s * hazard.l;
    const band = bandFor(score);
    hazardDetailBody.innerHTML = `
      <div class="detail-top">
        <span class="detail-id">${hazard.id} / ${categoryLabels[hazard.category]}</span>
        <span class="detail-risk risk-${band}">S${hazard.s} × L${hazard.l} = ${score}</span>
      </div>
      <h3>${hazard.title}</h3>
      <div class="detail-block"><span>触发条件</span><p>${hazard.triggers}</p></div>
      <div class="detail-block"><span>可能后果</span><p>${hazard.consequences}</p></div>
      <div class="detail-block"><span>现有 / 建议屏障</span><ul>${hazard.barriers.map((barrier) => `<li>${barrier}</li>`).join("")}</ul></div>
      <div class="detail-block"><span>需要什么证据</span><p>${hazard.evidence}</p></div>
      <div class="detail-block"><span>目标残余风险</span><p>${hazard.residual}（教学性目标，不是已验证结果）</p></div>
    `;
    $$(".risk-node", riskMatrix || document).forEach((node) => {
      node.classList.toggle("is-selected", node.dataset.hazard === id);
    });
  }

  function updateHazardFilterCounts() {
    const counts = { all: hazards.length };
    hazards.forEach((hazard) => {
      counts[hazard.category] = (counts[hazard.category] || 0) + 1;
    });
    hazardFilters.forEach((chip) => {
      const filter = chip.dataset.hazardFilter || "all";
      const span = chip.querySelector("span");
      if (span) span.textContent = String(counts[filter] || 0);
    });
  }

  hazardFilters.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeHazardFilter = chip.dataset.hazardFilter || "all";
      hazardFilters.forEach((item) => {
        const active = item === chip;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderRiskMatrix();
      renderHazardTable();
      if (selectedHazardId) {
        const stillVisible = filteredHazards().some((hazard) => hazard.id === selectedHazardId);
        if (!stillVisible) {
          selectedHazardId = null;
          if (hazardDetailBody) {
            hazardDetailBody.innerHTML = '<p class="detail-placeholder">当前筛选下没有选中的危险。点击矩阵中的编号继续查看。</p>';
          }
        }
      }
    });
  });

  updateHazardFilterCounts();
  renderRiskMatrix();
  renderHazardTable();

  /* ------------------------------------------------------------
     Scenario simulator
     ------------------------------------------------------------ */
  const simData = {
    rotor: {
      title: "单旋翼失效",
      verdict: "可控（设计目标）",
      statusClass: "status-green",
      chain: [
        ["触发", "单旋翼 / 电机失效", "桨叶损伤、堵转、电调故障"],
        ["检测", "转速 / 电流 / 振动异常", "FCC 识别推力损失"],
        ["响应", "推力重构与配平", "剩余 5 旋翼提高推力，抑制滚转"],
        ["屏障", "包线保护 + 迫降", "限制姿态/高度，选择备降点"],
        ["结果", "可控迫降 / 返航", "人员与第三方风险受控"]
      ],
      note: "官方称 1–2 个旋翼失效仍可安全迫降；但全包线组合、瞬态响应与共因未公开，不能把“设计目标”当成“已验证”。"
    },
    gnss: {
      title: "GNSS 丢失 / 受扰",
      verdict: "降级",
      statusClass: "status-orange",
      chain: [
        ["触发", "GNSS 压制 / 欺骗", "定位跳变或丢失"],
        ["检测", "多源一致性检查", "惯导/视觉/气压交叉校验"],
        ["响应", "切换导航源", "降级到惯导 + 目视"],
        ["屏障", "地理围栏 + 返航", "限制空域，选择已知场地"],
        ["结果", "返航 / 迫降", "依赖飞行员与备用导航"]
      ],
      note: "如果惯导也漂移、目视条件又差，降级就会变成高风险；需要场景注入与真实干扰试验。"
    },
    battery: {
      title: "电池热失控",
      verdict: "高风险",
      statusClass: "status-red",
      chain: [
        ["触发", "内短路 / 挤压 / 过充", "单体升温、产气"],
        ["检测", "BMS 温度/电压/气体", "识别异常并告警"],
        ["响应", "隔离 / 熔断 / 泄压", "阻止传播，保留控制"],
        ["屏障", "迫降 + 消防", "尽快落地，人员撤离"],
        ["结果", "起火 / 伤害", "取决于传播速度与逃生"]
      ],
      note: "15.2 m 坠落测试是包级证据，不等于整机热失控传播被控制；这是最需要整机级试验的场景之一。"
    },
    pilot: {
      title: "飞行员失能",
      verdict: "证据缺口",
      statusClass: "status-orange",
      chain: [
        ["触发", "失能 / 丧失情景意识", "单驾驶、低空、短窗口"],
        ["检测", "无可靠失能检测", "缺少生理/操纵响应监测"],
        ["响应", "自动模式 / 乘客求助", "依赖自动返航或伞降"],
        ["屏障", "包线保护 + 伞", "降低后果，但不等于安全"],
        ["结果", "不确定", "需要专门设计与验证"]
      ],
      note: "官方只说明手动/自动两种驾驶模式，未公开失能检测与自动处置逻辑；不能默认“自动模式”能兜住人。"
    },
    dock: {
      title: "对接锁未锁定",
      verdict: "应禁止起飞",
      statusClass: "status-red",
      chain: [
        ["触发", "假锁 / 未锁死 / 传感器故障", "机械未到位但显示正常"],
        ["检测", "三取二锁止传感器", "独立确认机械状态"],
        ["响应", "互锁禁止起飞", "顺序控制 + 物理确认"],
        ["屏障", "地面排查", "重新对接/维修"],
        ["结果", "避免空中释放", "接口安全的关键门槛"]
      ],
      note: "接口安全最危险的状态是“显示正常、物理没锁住”。单点传感器不可信，必须三取二 + 机械互锁。"
    }
  };

  const simButtons = $$(".sim-btn");
  const simTitle = $("#simTitle");
  const simVerdict = $("#simVerdict");
  const simChain = $("#simChain");
  const simNote = $("#simNote");

  function selectSimulation(key) {
    const data = simData[key];
    if (!data) return;
    simButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.sim === key));
    if (simTitle) simTitle.textContent = data.title;
    if (simVerdict) {
      simVerdict.textContent = data.verdict;
      simVerdict.className = `status ${data.statusClass}`;
    }
    if (simChain) {
      simChain.innerHTML = data.chain.map(([label, title, desc], index) => `
        <div class="sim-step ${index === 4 ? (data.statusClass === "status-red" ? "is-alert" : "is-ok") : ""}">
          <span>${String(index + 1).padStart(2, "0")} / ${label}</span>
          <b>${title}</b>
          <p>${desc}</p>
        </div>`).join("");
    }
    if (simNote) simNote.textContent = data.note;
  }

  simButtons.forEach((button) => {
    button.addEventListener("click", () => selectSimulation(button.dataset.sim));
  });
  selectSimulation("rotor");
})();
