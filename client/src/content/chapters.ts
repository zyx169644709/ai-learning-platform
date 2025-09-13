export interface TocNode {
  id: string
  title: string
  slug: string
  children?: TocNode[]
}

export const chapters: TocNode[] = [
  {
    id: '1-ai',
    title: '人工智能概述',
    slug: 'ai-overview',
    children: [
      { id: '1.1', title: '什么是人工智能', slug: 'what-is-ai' },
      { id: '1.2', title: '发展历程', slug: 'history' },
      { id: '1.3', title: '主要分支与应用', slug: 'applications' },
    ]
  },
  {
    id: '2-math',
    title: '数学基础',
    slug: 'math-foundation',
    children: [
      { id: '2.1', title: '线性代数基础', slug: 'linear-algebra' },
      { id: '2.2', title: '概率统计基础', slug: 'probability-statistics' },
      { id: '2.3', title: '微积分与优化理论', slug: 'calculus-optimization' }
    ]
  },
  {
    id: '3-ml',
    title: '机器学习',
    slug: 'ml-foundation',
    children: [
      { id: '3.1', title: '监督学习', slug: 'supervised-learning' },
      { id: '3.2', title: '无监督学习', slug: 'unsupervised-learning' },
      { id: '3.3', title: '强化学习基础', slug: 'reinforcement-learning' }
    ]
  },
  {
    id: '4-dl',
    title: '深度学习',
    slug: 'deep-learning',
    children: [
      { id: '4.1', title: '神经网络基础', slug: 'neural-networks' },
      { id: '4.2', title: '深度学习框架', slug: 'dl-frameworks' },
      { id: '4.3', title: '卷积神经网络', slug: 'cnn' },
      { id: '4.4', title: '循环神经网络', slug: 'rnn' }
    ]
  },
  {
    id: '5-nlp',
    title: '自然语言处理',
    slug: 'nlp',
    children: [
      { id: '5.1', title: 'NLP基础', slug: 'nlp-basics' },
      { id: '5.2', title: '文本生成技术', slug: 'text-generation' },
      { id: '5.3', title: '大型语言模型', slug: 'large-language-models' }
    ]
  },
  {
    id: '6-cv',
    title: '计算机视觉',
    slug: 'computer-vision',
    children: [
      { id: '6.1', title: '图像识别基础', slug: 'image-recognition' },
      { id: '6.2', title: '图像生成技术', slug: 'image-generation' },
      { id: '6.3', title: '目标检测与分割', slug: 'detection-segmentation' }
    ]
  },
  {
    id: '7-genai',
    title: '生成式AI应用',
    slug: 'gen-ai-apps',
    children: [
      { id: '7.1', title: '文本生成应用开发', slug: 'gen-text-app' },
      { id: '7.2', title: '图像生成应用开发', slug: 'gen-image-app' },
      { id: '7.3', title: '多模态生成技术', slug: 'multimodal-generation' }
    ]
  },
  {
    id: '8-ethics',
    title: 'AI伦理与安全',
    slug: 'ai-ethics-security',
    children: [
      { id: '8.1', title: 'AI伦理问题', slug: 'ethics' },
      { id: '8.2', title: '算法偏见与公平性', slug: 'fairness-bias' },
      { id: '8.3', title: 'AI安全与治理', slug: 'ai-safety-governance' }
    ]
  },
  {
    id: '9-projects',
    title: '实战项目',
    slug: 'practical-projects',
    children: [
      { id: '9.1', title: '机器学习项目实战', slug: 'ml-project' },
      { id: '9.2', title: '深度学习项目实战', slug: 'dl-project' },
      { id: '9.3', title: '生成式AI应用项目', slug: 'genai-project' }
    ]
  }
]

export function flatToc(nodes: TocNode[]): TocNode[] {
  const out: TocNode[] = []
  const walk = (arr: TocNode[]) => arr.forEach(n => { out.push(n); if (n.children) walk(n.children) })
  walk(nodes)
  return out
}


