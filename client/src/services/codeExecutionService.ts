// 代码执行服务
export interface ExecutionResult {
  success: boolean
  output: string[]
  errors: string[]
  executionTime: number
  memoryUsage: number
  language: string
}

export interface CodeExecutionOptions {
  language: string
  code: string
  timeout?: number
}

class CodeExecutionService {
  private readonly defaultTimeout = 5000 // 5秒超时
  private pyodide: any | null = null
  private pyodideLoading: Promise<any> | null = null

  private async initPyodide(): Promise<any> {
    if (this.pyodide) return this.pyodide
    if (this.pyodideLoading) return this.pyodideLoading

    const loader = async () => {
      const g: any = globalThis as any
      if (!g.loadPyodide) {
        throw new Error('Pyodide 脚本未加载。请确认 index.html 已引入 pyodide.js')
      }
      const py = await g.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })
      // 可选：预载常用包（注释掉以加快首开）
      // await py.loadPackage(['micropip'])
      this.pyodide = py
      this.pyodideLoading = null
      return py
    }

    this.pyodideLoading = loader()
    return this.pyodideLoading
  }

  // 执行代码
  async executeCode(options: CodeExecutionOptions): Promise<ExecutionResult> {
    const { language, code, timeout = this.defaultTimeout } = options
    const startTime = performance.now()
    
    try {
      switch (language) {
        case 'javascript':
          return await this.executeJavaScript(code, timeout)
        case 'typescript':
          return await this.executeTypeScript(code, timeout)
        case 'python':
          return await this.executePython(code, timeout)
        case 'java':
          return await this.executeJava(code, timeout)
        case 'cpp':
          return await this.executeCpp(code, timeout)
        case 'csharp':
          return await this.executeCSharp(code, timeout)
        case 'go':
          return await this.executeGo(code, timeout)
        case 'rust':
          return await this.executeRust(code, timeout)
        default:
          return {
            success: false,
            output: [],
            errors: [`不支持的语言: ${language}`],
            executionTime: 0,
            memoryUsage: 0,
            language
          }
      }
    } catch (error) {
      const executionTime = performance.now() - startTime
      return {
        success: false,
        output: [],
        errors: [error instanceof Error ? error.message : '执行出错'],
        executionTime: Math.round(executionTime),
        memoryUsage: 0,
        language
      }
    }
  }

  // 执行 JavaScript 代码
  private async executeJavaScript(code: string, timeout: number): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      const output: string[] = []
      const errors: string[] = []
      let timeoutId: NodeJS.Timeout | null = null
      
      // 创建安全的执行环境
      const sandbox = {
        console: {
          log: (...args: any[]) => output.push(args.join(' ')),
          error: (...args: any[]) => errors.push(args.join(' ')),
          warn: (...args: any[]) => output.push(`[警告] ${args.join(' ')}`),
          info: (...args: any[]) => output.push(`[信息] ${args.join(' ')}`)
        },
        setTimeout: (fn: Function, delay: number) => setTimeout(fn, delay),
        setInterval: (fn: Function, delay: number) => setInterval(fn, delay),
        clearTimeout: (id: number) => clearTimeout(id),
        clearInterval: (id: number) => clearInterval(id),
        Math: Math,
        Date: Date,
        JSON: JSON,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Boolean: Boolean,
        RegExp: RegExp,
        Error: Error,
        Promise: Promise
      }

      try {
        // 设置超时
        timeoutId = setTimeout(() => {
          errors.push('执行超时')
          const executionTime = performance.now() - startTime
          resolve({
            success: false,
            output,
            errors,
            executionTime: Math.round(executionTime),
            memoryUsage: this.getRandomMemoryUsage(),
            language: 'javascript'
          })
        }, timeout)

        // 执行代码
        const safeEval = new Function(...Object.keys(sandbox), code)
        safeEval(...Object.values(sandbox))
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        const executionTime = performance.now() - startTime
        resolve({
          success: errors.length === 0,
          output,
          errors,
          executionTime: Math.round(executionTime),
          memoryUsage: this.getRandomMemoryUsage(),
          language: 'javascript'
        })
        
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        errors.push(error instanceof Error ? error.message : '执行出错')
        const executionTime = performance.now() - startTime
        resolve({
          success: false,
          output,
          errors,
          executionTime: Math.round(executionTime),
          memoryUsage: this.getRandomMemoryUsage(),
          language: 'javascript'
        })
      }
    })
  }

  // 执行 TypeScript 代码
  private async executeTypeScript(code: string, timeout: number): Promise<ExecutionResult> {
    // 简单的 TypeScript 到 JavaScript 转换
    const jsCode = this.transpileTypeScript(code)
    return this.executeJavaScript(jsCode, timeout)
  }

  // 执行 Python 代码（Pyodide）
  private async executePython(code: string, timeout: number): Promise<ExecutionResult> {
    const startTime = performance.now()
    const py = await this.initPyodide()

    const stdout: string[] = []
    const stderr: string[] = []

    const restoreStdout = py.setStdout({ batched: (s: string) => stdout.push(s) })
    const restoreStderr = py.setStderr({ batched: (s: string) => stderr.push(s) })

    const run = (async () => {
      try {
        await py.runPythonAsync(code)
      } finally {
        // 恢复 stdout/stderr 钩子
        if (restoreStdout) restoreStdout()
        if (restoreStderr) restoreStderr()
      }
    })()

    const timer = new Promise((_, reject) => setTimeout(() => reject(new Error('执行超时')), timeout))

    try {
      await Promise.race([run, timer])
      const executionTime = Math.round(performance.now() - startTime)
      return {
        success: stderr.length === 0,
        output: stdout.join('\n').split('\n').filter(Boolean),
        errors: stderr.join('\n').split('\n').filter(Boolean),
        executionTime,
        memoryUsage: this.getRandomMemoryUsage(),
        language: 'python'
      }
    } catch (e) {
      const executionTime = Math.round(performance.now() - startTime)
      return {
        success: false,
        output: stdout.join('\n').split('\n').filter(Boolean),
        errors: [e instanceof Error ? e.message : '执行失败'],
        executionTime,
        memoryUsage: this.getRandomMemoryUsage(),
        language: 'python'
      }
    }
  }

  // 执行 Java 代码（模拟）
  private async executeJava(code: string, timeout: number): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const output: string[] = [
      'Java 代码模拟执行:',
      code,
      '',
      '注意：这是模拟执行，实际项目中需要集成 Java 运行时',
      '建议：',
      '- 使用 JVM 在线执行服务',
      '- 集成 Maven/Gradle 依赖管理',
      '- 添加单元测试支持'
    ]
    
    return {
      success: true,
      output,
      errors: [],
      executionTime: 200,
      memoryUsage: this.getRandomMemoryUsage(),
      language: 'java'
    }
  }

  // 执行 C++ 代码（模拟）
  private async executeCpp(code: string, timeout: number): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const output: string[] = [
      'C++ 代码模拟执行:',
      code,
      '',
      '注意：这是模拟执行，实际项目中需要集成 C++ 编译器',
      '建议：',
      '- 使用 Emscripten 编译到 WebAssembly',
      '- 集成 Clang 在线编译服务',
      '- 添加调试和性能分析工具'
    ]
    
    return {
      success: true,
      output,
      errors: [],
      executionTime: 150,
      memoryUsage: this.getRandomMemoryUsage(),
      language: 'cpp'
    }
  }

  // 执行 C# 代码（模拟）
  private async executeCSharp(code: string, timeout: number): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 180))
    
    const output: string[] = [
      'C# 代码模拟执行:',
      code,
      '',
      '注意：这是模拟执行，实际项目中需要集成 .NET 运行时',
      '建议：',
      '- 使用 Blazor WebAssembly',
      '- 集成 .NET 在线编译服务',
      '- 添加 NuGet 包管理支持'
    ]
    
    return {
      success: true,
      output,
      errors: [],
      executionTime: 180,
      memoryUsage: this.getRandomMemoryUsage(),
      language: 'csharp'
    }
  }

  // 执行 Go 代码（模拟）
  private async executeGo(code: string, timeout: number): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 120))
    
    const output: string[] = [
      'Go 代码模拟执行:',
      code,
      '',
      '注意：这是模拟执行，实际项目中需要集成 Go 运行时',
      '建议：',
      '- 使用 TinyGo 编译到 WebAssembly',
      '- 集成 Go Playground API',
      '- 添加 Go modules 支持'
    ]
    
    return {
      success: true,
      output,
      errors: [],
      executionTime: 120,
      memoryUsage: this.getRandomMemoryUsage(),
      language: 'go'
    }
  }

  // 执行 Rust 代码（模拟）
  private async executeRust(code: string, timeout: number): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 160))
    
    const output: string[] = [
      'Rust 代码模拟执行:',
      code,
      '',
      '注意：这是模拟执行，实际项目中需要集成 Rust 编译器',
      '建议：',
      '- 使用 wasm-pack 编译到 WebAssembly',
      '- 集成 Rust Playground API',
      '- 添加 Cargo 依赖管理支持'
    ]
    
    return {
      success: true,
      output,
      errors: [],
      executionTime: 160,
      memoryUsage: this.getRandomMemoryUsage(),
      language: 'rust'
    }
  }

  // TypeScript 转 JavaScript（简单实现）
  private transpileTypeScript(code: string): string {
    return code
      .replace(/:\s*\w+/g, '') // 移除类型注解
      .replace(/:\s*string/g, '') // 移除 string 类型
      .replace(/:\s*number/g, '') // 移除 number 类型
      .replace(/:\s*boolean/g, '') // 移除 boolean 类型
      .replace(/:\s*any/g, '') // 移除 any 类型
      .replace(/:\s*\[\]/g, '') // 移除数组类型
      .replace(/:\s*\{[^}]*\}/g, '') // 移除对象类型
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // 移除接口定义
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // 移除类型别名
      .replace(/import\s+[^;]+;/g, '') // 移除 import 语句
      .replace(/export\s+/g, '') // 移除 export 关键字
  }

  // 获取随机内存使用量（模拟）
  private getRandomMemoryUsage(): number {
    return Math.round(Math.random() * 20 + 5) // 5-25MB
  }

  // 获取支持的语言列表
  getSupportedLanguages(): string[] {
    return ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust']
  }

  // 获取语言信息
  getLanguageInfo(language: string) {
    const languageInfo = {
      javascript: {
        name: 'JavaScript',
        extension: '.js',
        description: 'Web 开发的主要语言，支持浏览器和 Node.js 环境'
      },
      typescript: {
        name: 'TypeScript',
        extension: '.ts',
        description: 'JavaScript 的超集，添加了静态类型检查'
      },
      python: {
        name: 'Python',
        extension: '.py',
        description: '简洁易读的编程语言，广泛应用于 AI 和数据分析'
      },
      java: {
        name: 'Java',
        extension: '.java',
        description: '面向对象的编程语言，跨平台兼容性好'
      },
      cpp: {
        name: 'C++',
        extension: '.cpp',
        description: '高性能的系统编程语言，支持面向对象编程'
      },
      csharp: {
        name: 'C#',
        extension: '.cs',
        description: '微软开发的现代编程语言，主要用于 .NET 平台'
      },
      go: {
        name: 'Go',
        extension: '.go',
        description: 'Google 开发的系统编程语言，并发性能优秀'
      },
      rust: {
        name: 'Rust',
        extension: '.rs',
        description: '系统编程语言，内存安全且性能优异'
      }
    }
    
    return languageInfo[language as keyof typeof languageInfo] || null
  }
}

export const codeExecutionService = new CodeExecutionService()
