/* Structured company content (zh/en) — derived 1:1 from 企业介绍.pdf.
   Rendered by the frontend so both languages always stay in sync. */
window.CONTENT = {
  stats: [
    { zh: '团队规模', en: 'Team', value: '138', unit: '人', enUnit: 'personnel' },
    { zh: '技术人员', en: 'Technical staff', value: '132', unit: '名', enUnit: 'staff' },
    { zh: '施工井队', en: 'Drilling crews', value: '21', unit: '支', enUnit: 'crews' },
    { zh: '项目验收通过', en: 'Projects passed', value: '19/19', unit: '', enUnit: '' },
    { zh: '累计合同额', en: 'Total contract value', value: '4500', unit: '万元', enValue: '¥45M', enUnit: '' },
  ],

  capability: [
    { zh: '矿种（6 类）', en: 'Commodities (6)', body: {
      zh: '盐湖（钾/锂/硼）、金矿、锂矿、多金属矿、石墨矿、脉石英矿',
      en: 'Salt lake (K/Li/B), gold, lithium, polymetallic, graphite, vein quartz',
    } },
    { zh: '勘查阶段（4 个）', en: 'Stages (4)', body: {
      zh: '普查、详查、勘探、储量核实',
      en: 'Reconnaissance, detailed survey, exploration, reserve verification',
    } },
    { zh: '施工类型（2 类）', en: 'Methods (2)', body: {
      zh: '钻探、槽探',
      en: 'Drilling, trenching',
    } },
    { zh: '复杂工况（3 类）', en: 'Conditions (3)', body: {
      zh: '高原、盐湖、深孔',
      en: 'Plateau, salt lake, deep hole',
    } },
  ],

  equipment: [
    { name: '徐工 XSL520B', qty: 5, ability: { zh: '深孔钻进', en: 'Deep-hole drilling' }, cond: { zh: '高原深孔', en: 'Plateau deep-hole' } },
    { name: '衡阳 XY-5', qty: 5, ability: { zh: '岩心钻探', en: 'Core drilling' }, cond: { zh: '矿产勘查', en: 'Mineral exploration' } },
    { name: '林泉一体钻机', qty: 3, ability: { zh: '全液压钻进', en: 'Full-hydraulic drilling' }, cond: { zh: '高原矿区', en: 'Plateau mine' } },
    { name: '梦迈模块钻机', qty: 3, ability: { zh: '模块化钻探', en: 'Modular drilling' }, cond: { zh: '高原矿区', en: 'Plateau mine' } },
    { name: '恒阳一体钻机', qty: 2, ability: { zh: '一体化钻探', en: 'Integrated drilling' }, cond: { zh: '复杂矿区', en: 'Complex mine' } },
    { name: '开峰 1000', qty: 3, ability: { zh: '岩心钻探', en: 'Core drilling' }, cond: { zh: '矿产勘查', en: 'Mineral exploration' } },
  ],

  projects: [
    { name: { zh: '察尔汗盐湖资源精细化、高效开发利用基础研究', en: 'Qarhan salt-lake resource utilisation fundamental study' }, commodity: { zh: '盐湖（钾/锂）', en: 'Salt lake (K/Li)' }, work: { zh: '钻探', en: 'Drilling' }, amount: 353.11, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '青海盐湖工业钾肥分公司东采区新建采卤井工程', en: 'East mining area brine-well project, Qinghai Salt Lake Ind.' }, commodity: { zh: '钾矿/盐湖', en: 'K / salt lake' }, work: { zh: '钻探', en: 'Drilling' }, amount: 123.35, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '都兰县瓦勒尕南金矿普查钻探、槽探工程', en: 'Walega South gold reconnaissance drilling & trenching' }, commodity: { zh: '金矿', en: 'Gold' }, work: { zh: '钻探+槽探', en: 'Drilling + trenching' }, amount: 227.61, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '大浪滩钾矿资源核查及动态监测', en: 'Dalangtan potassium resource check & monitoring' }, commodity: { zh: '钾矿', en: 'Potassium' }, work: { zh: '钻探', en: 'Drilling' }, amount: 160.00, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '东台吉乃尔湖锂硼钾矿资源储量核实钻探施工', en: 'East Taijinar Li-B-K reserve verification drilling' }, commodity: { zh: '锂/硼/钾', en: 'Li/B/K' }, work: { zh: '钻探', en: 'Drilling' }, amount: 107.58, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '甜水海锂矿普-详查项目钻探工程', en: 'Tianshuihai lithium reconnaissance-detailed drilling' }, commodity: { zh: '锂矿', en: 'Lithium' }, work: { zh: '钻探', en: 'Drilling' }, amount: 200, result: { zh: '通过甲方验收', en: 'Accepted' } },
    { name: { zh: '黄草湖苦水湖锂矿详查-勘探项目钻探技术服务', en: 'Huangcaohu-Kushuihu lithium exploration drilling services' }, commodity: { zh: '锂矿', en: 'Lithium' }, work: { zh: '钻探', en: 'Drilling' }, amount: 1013, result: { zh: '通过甲方验收', en: 'Accepted' } },
  ],

  clients: [
    { zh: '中化地质矿山总局地质研究院', en: 'Geological Research Inst., China Chemical Geology & Mine Bureau' },
    { zh: '中国建筑材料工业地质勘查中心（新疆/青海总队）', en: 'China Building Materials Geo-exploration Centre (XJ/QH)' },
    { zh: '中国冶金地质总局青海地勘院', en: 'Qinghai Geo-exploration Inst., China Metallurgical Geology Bureau' },
    { zh: '青海赣锋锂业有限公司', en: 'Qinghai Ganfeng Lithium Co., Ltd.' },
    { zh: '山东地矿新能源有限公司', en: 'Shandong Geo-mineral New Energy Co., Ltd.' },
    { zh: '青海昆仑黄金有限公司', en: 'Qinghai Kunlun Gold Co., Ltd.' },
    { zh: '青海煤炭地质勘查院', en: 'Qinghai Coal Geological Exploration Bureau' },
    { zh: '山金西部地质矿产勘查有限公司', en: 'Shanjin Western Geo-mineral Exploration Co., Ltd.' },
    { zh: '青海第三地质矿产勘查院', en: 'Qinghai Third Geo-mineral Exploration Inst.' },
    { zh: '新疆德汇隆旺矿业有限公司', en: 'Xinjiang Dehuilongwang Mining Co., Ltd.' },
    { zh: '青海省柴达木综合地质矿产勘查院', en: 'Qaidam Comprehensive Geo-mineral Exploration Inst. of Qinghai' },
  ],

  repeatClients: [
    { zh: '青海省柴达木综合地质矿产勘查院', en: 'Qaidam Comprehensive Geo-mineral Exploration Inst. of Qinghai' },
    { zh: '青海煤炭地质勘查院', en: 'Qinghai Coal Geological Exploration Bureau' },
    { zh: '中国建筑材料工业地质勘查中心', en: 'China Building Materials Geo-exploration Centre' },
  ],

  valuePoints: [
    { title: { zh: '更适应复杂工况', en: 'More adaptable to tough conditions' }, text: {
      zh: '专注高原、盐湖、深孔三类工况，具备对应设备体系与标准化保障流程，普通施工队难以复制。',
      en: 'Focused on plateau, salt-lake and deep-hole conditions with matched equipment and a standardised assurance process that ordinary crews cannot replicate.',
    } },
    { title: { zh: '更快项目响应', en: 'Faster response' }, text: {
      zh: '技术密集型团队 + 短组织链条 + 灵活合作模式（总包/工程单价），现场独立作业、响应敏捷。',
      en: 'Engineering-intensive teams + short management chain + flexible models (turnkey / unit price) enable autonomous, agile on-site response.',
    } },
    { title: { zh: '更稳定项目交付', en: 'More stable delivery' }, text: {
      zh: '19/19 验收通过，真实项目与客户验证；21 支井队提供多项目并行交付的组织基础。',
      en: '19/19 projects accepted and validated by real clients; 21 crews provide the organisational base for parallel delivery.',
    } },
    { title: { zh: '更可控综合成本', en: 'More controllable cost' }, text: {
      zh: '自有设备 + 技术人员密集 + 组织链条短 + 现场独立作业，在保障质量、安全与履约的基础上形成具竞争力的综合项目成本。',
      en: 'Owned equipment + dense technical staff + short chain + on-site autonomy yield competitive overall cost while safeguarding quality, safety and performance.',
    } },
  ],

  profileParas: {
    zh: [
      '青海凿研岩土工程有限公司成立于 2020 年 9 月，注册资本 100 万元，经营区域覆盖青海、甘肃、新疆 3 省区，法定代表人为王小俊（总经理）。',
      '公司聚焦西部高原、盐湖、深孔等复杂工况下的矿产勘查钻探与槽探施工，以技术密集型团队与多井队组织，为国有地勘单位及大型矿企提供从普查到储量核实的一站式施工服务。',
      '成立至今 37 个月累计合同额 4500 万元（2022 年 6 月—2025 年 7 月），可核验业绩项目验收通过率 100%（19/19）。',
    ],
    en: [
      'Founded in September 2020 with a registered capital of RMB 1.0M, the company operates across Qinghai, Gansu and Xinjiang, with legal representative Wang Xiaojun (General Manager).',
      'Focused on mineral-exploration drilling and trenching under complex Western-plateau, salt-lake and deep-hole conditions, we provide state survey units and large mining enterprises with one-stop services from reconnaissance to reserve verification.',
      'Over 37 months the cumulative contract value reached RMB 45M (Jun 2022 – Jul 2025), with a 100% acceptance rate across verifiable projects (19/19).',
    ],
  },

  orgParas: {
    zh: [
      '公司现有 138 人，其中 132 人为技术人员，技术人员占比 95.7%，形成以现场技术与施工人员为主体的项目组织结构。核心岗位由矿产勘查高级工程师担任总工；地质矿产、钻机操作、焊接与热切割 3 类人员持证齐全。',
      '依托 21 支井队的施工组织体系，公司可支撑多项目并行推进。设备与工况匹配能力覆盖高原深孔、岩心钻探、全液压钻进、模块化钻探、一体化钻探等，整体适配三类复杂工况。',
      '高原项目标准化保障体系涵盖出队前车辆检查、人员健康查体、安全培训、应急演练、劳保及高原药品配置、应急设备配备、属地备案配合与现场安全环保制度落地八个环节。',
    ],
    en: [
      'The company has 138 staff, of whom 132 (95.7%) are technical personnel, forming a project organisation centred on on-site technical and operational staff. The chief engineer is a senior mining-exploration engineer; geological, drilling and welding/cutting personnel hold complete certifications.',
      'Relying on 21 drilling crews, the company can run parallel projects. Equipment is matched to plateau deep-hole, core, full-hydraulic, modular and integrated drilling — overall suited to the three complex conditions.',
      'The plateau standardised safety system covers eight steps: pre-deployment vehicle checks, health screening, safety training, emergency drills, PPE & altitude-medicine provisioning, emergency-equipment readiness, local-filing coordination and on-site HSE implementation.',
    ],
  },
};

/* Contact details (single source — edit here). Email/phone/social shared by footer + contact section. */
window.CONTACT = {
  email: '12345678@zyyt.com',
  tel: '',                                  // 待补充 / TBD
  address: { zh: '青海省（具体地址待补充）', en: 'Qinghai (address TBD)' },
  hours: { zh: '周一至周五 9:00–18:00（待补充）', en: 'Mon–Fri 9:00–18:00 (TBD)' },
  linkedin: 'https://www.linkedin.com/company/zyyt',
  facebook: 'https://www.facebook.com/zyyt',
  tiktok: 'https://www.tiktok.com/@zyyt',
};
