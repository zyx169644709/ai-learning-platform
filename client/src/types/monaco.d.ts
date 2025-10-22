// Monaco Editor 类型定义
declare module 'monaco-editor' {
  export interface IStandaloneCodeEditor {
    getValue(): string
    setValue(value: string): void
    getModel(): ITextModel | null
    updateOptions(options: IStandaloneEditorConstructionOptions): void
    onDidChangeModelContent(listener: (e: IModelContentChangedEvent) => void): IDisposable
    onDidChangeCursorPosition(listener: (e: ICursorPositionChangedEvent) => void): IDisposable
    onDidFocusEditorWidget(listener: () => void): IDisposable
    onDidBlurEditorWidget(listener: () => void): IDisposable
    addCommand(keybinding: number, handler: () => void): string | null
    dispose(): void
  }

  export interface ITextModel {
    getValue(): string
    setValue(value: string): void
  }

  export interface IModelContentChangedEvent {
    changes: IModelContentChange[]
  }

  export interface IModelContentChange {
    range: IRange
    text: string
  }

  export interface ICursorPositionChangedEvent {
    position: IPosition
  }

  export interface IPosition {
    lineNumber: number
    column: number
  }

  export interface IRange {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }

  export interface IDisposable {
    dispose(): void
  }

  export interface IStandaloneEditorConstructionOptions {
    value?: string
    language?: string
    theme?: string
    readOnly?: boolean
    automaticLayout?: boolean
    minimap?: { enabled: boolean }
    scrollBeyondLastLine?: boolean
    fontSize?: number
    lineHeight?: number
    fontFamily?: string
    tabSize?: number
    insertSpaces?: boolean
    wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
    lineNumbers?: 'off' | 'on' | 'relative' | 'interval'
    renderLineHighlight?: 'none' | 'gutter' | 'line' | 'all'
    selectOnLineNumbers?: boolean
    roundedSelection?: boolean
    cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin'
    cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
    cursorWidth?: number
    folding?: boolean
    foldingStrategy?: 'auto' | 'indentation'
    showFoldingControls?: 'always' | 'mouseover'
    unfoldOnClickAfterEnd?: boolean
    bracketPairColorization?: { enabled: boolean }
    guides?: {
      bracketPairs?: boolean
      indentation?: boolean
    }
    suggest?: {
      showKeywords?: boolean
      showSnippets?: boolean
      showFunctions?: boolean
      showConstructors?: boolean
      showFields?: boolean
      showVariables?: boolean
      showClasses?: boolean
      showStructs?: boolean
      showInterfaces?: boolean
      showModules?: boolean
      showProperties?: boolean
      showEvents?: boolean
      showOperators?: boolean
      showUnits?: boolean
      showValues?: boolean
      showConstants?: boolean
      showEnums?: boolean
      showEnumMembers?: boolean
      showColors?: boolean
      showFiles?: boolean
      showReferences?: boolean
      showFolders?: boolean
      showTypeParameters?: boolean
      showIssues?: boolean
      showUsers?: boolean
      showWords?: boolean
    }
    quickSuggestions?: {
      other?: boolean
      comments?: boolean
      strings?: boolean
    }
    parameterHints?: {
      enabled?: boolean
    }
    hover?: {
      enabled?: boolean
    }
    contextmenu?: boolean
    mouseWheelZoom?: boolean
    multiCursorModifier?: 'ctrlCmd' | 'alt'
    formatOnPaste?: boolean
    formatOnType?: boolean
  }

  export namespace editor {
    function create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions): IStandaloneCodeEditor
    function setModelLanguage(model: ITextModel, languageId: string): void
    function setTheme(theme: string): void
    // Extend typing for theme definition used in our project
    function defineTheme(themeName: string, themeData: any): void
  }

  export namespace KeyMod {
    const CtrlCmd: number
  }

  export namespace KeyCode {
    const KeyS: number
    const Enter: number
  }
}
