# 概率统计基础

概率与统计用于刻画不确定性，是机器学习模型训练、评估与推断的基石。本节通过直观示例介绍随机变量、分布、估计与评估。

## 随机变量与分布

- 离散型：如伯努利、二项分布。
- 连续型：如正态分布。

```editor:python
# 蒙特卡洛估计硬币正面概率与置信区间（简化）
import random
import math

def simulate_coin(p_true=0.6, n=1000):
    samples = [1 if random.random() < p_true else 0 for _ in range(n)]
    p_hat = sum(samples) / n
    # 正态近似 95% 置信区间
    se = math.sqrt(p_hat * (1 - p_hat) / n)
    ci = (p_hat - 1.96*se, p_hat + 1.96*se)
    return p_hat, ci

p_hat, ci = simulate_coin()
print("频率估计=", round(p_hat, 3))
print("95% 置信区间=", (round(ci[0], 3), round(ci[1], 3)))
```

## 极大似然估计（MLE）

- 思想：选择使观测数据概率最大的参数。
- 示例：伯努利参数的 MLE 为样本均值。

```editor:python
# 伯努利分布参数的极大似然估计
from typing import List

def mle_bernoulli(data: List[int]) -> float:
    # data 取值 {0,1}
    return sum(data) / len(data)

print("MLE 示例:", mle_bernoulli([1,1,0,1,0,1]))
```

## 假设检验与评价指标

- 假设检验：控制第一类错误率（显著性水平）。
- 模型评价：分类常用准确率、精确率、召回率、F1；回归常用 MSE、MAE。

```editor:javascript
// 二分类混淆矩阵与常见指标
function metricsFromConfusion(tp, fp, fn, tn) {
  const accuracy = (tp + tn) / (tp + fp + fn + tn);
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1 = 2 * precision * recall / (precision + recall);
  return { accuracy, precision, recall, f1 };
}

console.log(metricsFromConfusion(50, 10, 5, 35));
```

---

你已经了解：
- 用蒙特卡洛直观理解估计与置信区间；
- MLE 的基本思想与实现；
- 常见检验与评价指标。

建议继续学习“微积分与优化理论”，理解损失函数的梯度与最优化方法。
