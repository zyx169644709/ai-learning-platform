# 主要分支与应用

人工智能已经渗透到我们生活的方方面面，从日常使用的手机应用到前沿的科学研究。

## 自然语言处理 (NLP)

### 文本分类示例

下面是一个简单的文本分类器，可以识别文本的情感倾向：

```python
import re
from collections import Counter

class SimpleSentimentAnalyzer:
    def __init__(self):
        # 定义情感词汇
        self.positive_words = {
            '好', '棒', '优秀', '喜欢', '爱', '开心', '快乐', '满意', '精彩', '完美'
        }
        self.negative_words = {
            '坏', '差', '讨厌', '恨', '难过', '痛苦', '失望', '糟糕', '可怕', '恶心'
        }
    
    def analyze(self, text):
        # 清理文本
        text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z]', ' ', text)
        words = text.lower().split()
        
        # 统计情感词
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        
        # 判断情感
        if positive_count > negative_count:
            return '正面', positive_count - negative_count
        elif negative_count > positive_count:
            return '负面', negative_count - positive_count
        else:
            return '中性', 0

# 测试
analyzer = SimpleSentimentAnalyzer()

test_texts = [
    "这个产品真的很好用，我非常喜欢！",
    "质量太差了，完全不满意",
    "一般般吧，没什么特别的"
]

for text in test_texts:
    sentiment, score = analyzer.analyze(text)
    print(f"文本: {text}")
    print(f"情感: {sentiment}, 分数: {score}")
    print("-" * 40)
```

## 计算机视觉

### 图像处理基础

这里展示一些基本的图像处理操作：

```editor:javascript
// 简单的图像滤镜实现
class ImageFilter {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  // 灰度滤镜
  grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // 红色
      data[i + 1] = gray; // 绿色
      data[i + 2] = gray; // 蓝色
    }
    return imageData;
  }
  
  // 反转滤镜
  invert(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // 红色
      data[i + 1] = 255 - data[i + 1]; // 绿色
      data[i + 2] = 255 - data[i + 2]; // 蓝色
    }
    return imageData;
  }
  
  // 亮度调整
  adjustBrightness(imageData, factor) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + factor));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + factor));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + factor));
    }
    return imageData;
  }
}

console.log("图像滤镜类已创建，包含以下方法：");
console.log("- grayscale(): 转换为灰度");
console.log("- invert(): 颜色反转");
console.log("- adjustBrightness(factor): 调整亮度");

// 创建滤镜实例
const filter = new ImageFilter();
console.log("滤镜实例已创建:", filter);
```

## 机器学习

### 决策树分类器

实现一个简单的决策树算法：

```python
import numpy as np
from collections import Counter

class DecisionTree:
    def __init__(self, max_depth=5):
        self.max_depth = max_depth
        self.tree = None
    
    def fit(self, X, y):
        self.tree = self._build_tree(X, y, depth=0)
    
    def _build_tree(self, X, y, depth):
        # 停止条件
        if depth >= self.max_depth or len(set(y)) == 1:
            return {'type': 'leaf', 'value': Counter(y).most_common(1)[0][0]}
        
        # 找到最佳分割点
        best_feature, best_threshold = self._find_best_split(X, y)
        
        if best_feature is None:
            return {'type': 'leaf', 'value': Counter(y).most_common(1)[0][0]}
        
        # 分割数据
        left_mask = X[:, best_feature] <= best_threshold
        right_mask = ~left_mask
        
        # 递归构建子树
        left_tree = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right_tree = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        
        return {
            'type': 'split',
            'feature': best_feature,
            'threshold': best_threshold,
            'left': left_tree,
            'right': right_tree
        }
    
    def _find_best_split(self, X, y):
        best_gain = -1
        best_feature = None
        best_threshold = None
        
        for feature in range(X.shape[1]):
            thresholds = np.unique(X[:, feature])
            for threshold in thresholds:
                gain = self._information_gain(X, y, feature, threshold)
                if gain > best_gain:
                    best_gain = gain
                    best_feature = feature
                    best_threshold = threshold
        
        return best_feature, best_threshold
    
    def _information_gain(self, X, y, feature, threshold):
        # 计算信息增益
        parent_entropy = self._entropy(y)
        
        left_mask = X[:, feature] <= threshold
        right_mask = ~left_mask
        
        if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
            return 0
        
        left_entropy = self._entropy(y[left_mask])
        right_entropy = self._entropy(y[right_mask])
        
        left_weight = np.sum(left_mask) / len(y)
        right_weight = np.sum(right_mask) / len(y)
        
        return parent_entropy - (left_weight * left_entropy + right_weight * right_entropy)
    
    def _entropy(self, y):
        counts = Counter(y)
        probs = [count / len(y) for count in counts.values()]
        return -sum(p * np.log2(p) for p in probs if p > 0)
    
    def predict(self, X):
        return [self._predict_single(x) for x in X]
    
    def _predict_single(self, x):
        node = self.tree
        while node['type'] == 'split':
            if x[node['feature']] <= node['threshold']:
                node = node['left']
            else:
                node = node['right']
        return node['value']

# 测试决策树
print("决策树分类器已创建！")
print("包含以下主要方法：")
print("- fit(X, y): 训练模型")
print("- predict(X): 预测新数据")
print("- 支持最大深度限制和自动特征选择")
```

## 实际应用场景

### 1. 智能客服

- **自动回答常见问题**：基于知识图谱和NLP技术
- **情感分析**：识别用户情绪，提供个性化服务
- **智能路由**：将复杂问题转接给人工客服

### 2. 推荐系统

- **个性化内容推荐**：基于用户行为和偏好
- **商品推荐**：协同过滤和深度学习算法
- **音乐/视频推荐**：内容相似性和用户兴趣匹配

### 3. 自动驾驶

- **图像识别**：识别道路、车辆、行人等
- **路径规划**：实时计算最优行驶路径
- **决策制定**：基于多传感器数据做出驾驶决策

### 4. 医疗诊断

- **医学图像分析**：X光片、CT、MRI等影像诊断
- **疾病预测**：基于患者数据和历史病例
- **药物发现**：分子设计和药物筛选

## 技术架构

### 系统组成

```javascript
// AI系统架构示例
class AISystem {
  constructor() {
    this.nlp = new NLPModule();
    this.vision = new ComputerVisionModule();
    this.ml = new MachineLearningModule();
    this.decision = new DecisionEngine();
  }
  
  process(input) {
    // 多模态输入处理
    const text = this.nlp.analyze(input.text);
    const image = this.vision.analyze(input.image);
    
    // 综合决策
    return this.decision.make(text, image);
  }
}
```

### 数据流

1. **数据输入** → 多模态数据收集
2. **预处理** → 数据清洗和标准化
3. **特征提取** → 算法特征工程
4. **模型推理** → AI算法处理
5. **结果输出** → 决策和行动

---

通过这些示例，你可以看到AI技术如何在实际应用中发挥作用。每个代码编辑器都可以让你亲身体验这些算法的实现过程。
