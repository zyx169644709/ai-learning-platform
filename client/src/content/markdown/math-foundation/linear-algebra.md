# 线性代数基础

线性代数是机器学习与深度学习的语言。本节通过直观讲解与可运行示例，帮助你掌握向量、矩阵、线性变换与特征分解等核心概念。

## 向量与矩阵

- 向量：表示方向与大小，或一组有序数值。
- 矩阵：表示线性变换，或由向量按行/列堆叠而成。

```editor:python
# 基本向量与矩阵运算（纯 Python 实现）
from typing import List

Vector = List[float]
Matrix = List[List[float]]

def add_vectors(a: Vector, b: Vector) -> Vector:
    assert len(a) == len(b)
    return [x + y for x, y in zip(a, b)]

def scalar_mul(v: Vector, s: float) -> Vector:
    return [s * x for x in v]

def mat_vec_mul(A: Matrix, v: Vector) -> Vector:
    assert len(A[0]) == len(v)
    return [sum(a_ij * v_j for a_ij, v_j in zip(row, v)) for row in A]

v1 = [1, 2, 3]
v2 = [0.5, -1, 4]
A = [[1, 0, 2],
     [0, 1, -1]]

print("v1 + v2 =", add_vectors(v1, v2))
print("2 * v1 =", scalar_mul(v1, 2))
print("A @ v1 =", mat_vec_mul(A, v1))
```

## 线性变换与几何直觉

- 线性变换保持直线与原点，常见作用包括旋转、缩放、剪切。
- 组合变换对应矩阵相乘，先后顺序很重要。

```editor:javascript
// 二维向量的旋转与缩放
function multiplyMat2(a, b) {
  return [
    [a[0][0]*b[0][0] + a[0][1]*b[1][0], a[0][0]*b[0][1] + a[0][1]*b[1][1]],
    [a[1][0]*b[0][0] + a[1][1]*b[1][0], a[1][0]*b[0][1] + a[1][1]*b[1][1]]
  ];
}

function applyMat2(A, v) {
  return [A[0][0]*v[0] + A[0][1]*v[1], A[1][0]*v[0] + A[1][1]*v[1]];
}

const deg = 30;
const rad = deg * Math.PI / 180;
const R = [
  [Math.cos(rad), -Math.sin(rad)],
  [Math.sin(rad),  Math.cos(rad)]
];
const S = [
  [2, 0],
  [0, 0.5]
];

const RS = multiplyMat2(R, S); // 先缩放后旋转
const v = [1, 1];

console.log("R(S v) =", applyMat2(RS, v));
```

## 特征值与特征向量（直观）

- 特征向量在变换后仍保持方向不变。
- 特征值表示沿该方向的伸缩比例。

```editor:python
# 使用 numpy 演示 2x2 矩阵的特征分解
import numpy as np

A = np.array([[3, 1],
              [0, 2]], dtype=float)

w, V = np.linalg.eig(A)
print("特征值:", w)
print("特征向量列:\n", V)

# 验证 A v = λ v（取第一个特征对）
lambda0 = w[0]
v0 = V[:, 0]
print("Av:", A @ v0)
print("λv:", lambda0 * v0)
```

---

通过以上示例，你应能理解：
- 向量/矩阵的基本运算；
- 线性变换的几何意义；
- 特征分解揭示主方向与缩放比例。

建议继续学习“概率统计基础”，为后续机器学习模型打下坚实基础。
