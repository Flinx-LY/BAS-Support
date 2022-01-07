// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
const path = require('path')
const express = require('express')
const app = express()
const port = 6541
let webview = require('./webview.js')

const attrAbbrs = {
  x: 'x',
  y: 'y',
  z: 'zIndex',
  s: 'scale',
  a: 'alpha',
  c: 'color',
  b: 'bold',
  ts: 'textShadow',
  ax: 'anchorX',
  ay: 'anchorY',
  rx: 'rotateX',
  ry: 'rotateY',
  rz: 'rotateZ',
  dt: 'duration',
  ct: 'content',
  fs: 'fontSize',
  ff: 'fontFamily',
  sw: 'strokeWidth',
  sc: 'strokeColor',
}
const attrCompletionItemList = Object.values(attrAbbrs).map((attr) => {
  return new vscode.CompletionItem(attr + ' = ', vscode.CompletionItemKind.Field)
})
const tagInit = {
  x: 0,
  y: 0,
  z: 0,
  s: 1,
  dt: '4s',
  ct: '请输入内容',
  a: 1,
  c: '0xffffff',
  ax: 0,
  ay: 0,
  an: 5,
  fs: '10%',
  ff: 'Arial',
  b: 1,
  ts: 1,
  sw: 0,
  sc: '0xffffff',
  rx: 0,
  ry: 0,
  rz: 0,
  parent: null,
}
let glstDocumentSymbol: vscode.DocumentSymbol[] | null = null

function documentFormatting(text: string) {
  try {
    text = text.replace(/^\s*/gm, '')
    text = text.replace(/\s*{\s*/gm, ' {\n')
    text = text.replace(/\s*}/gm, '\n}')
    text = text.replace(/\s*(\w+)\s*=\s*/gm, '\n$1 = ')
    //字符串中不要有大括号
    text = text.replace(/\s*(?<!\".*)(def|let|set|then)(?!.*\")/gm, '\n$1')
    text = text.replace(/\s*set/gm, '\n\nset')
    text = text.replace(/\s*then\s*set/gm, '\nthen set')
    text = text.replace(/def\s+(\w+)/gm, 'def $1')
    text = text.replace(/(def \w+|let|set)\s+(\w+)/gm, '$1 $2')
    text = text.replace(/}\s*(\d+\.?\d*(s|ms))/gm, '} $1')
    text = text.replace(/}\s*(\d+\.?\d*(s|ms))\s*,\s*\"/gm, '} $1, "')
    let lines = text.split(/^/m)
    var indent = 0
    text = ''
    for (var i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (line.indexOf('}') != -1) {
        indent--
      }
      text = text + '    '.repeat(indent) + line + '\n'
      if (line.indexOf('{') != -1) {
        indent++
      }
    }
    // text = text.replace(/(?<={(.|\s)*)^\s*(?=(.|\s)*})/gm, "    ");
  } catch (e) {
    vscode.window.showInformationMessage(`[Error Format]:${e} \n`)
  }
  return text
}
function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
  const line = document.lineAt(position)
  let text = line.text.trim()
  let myCompletionItemList = []

  let textGenList = []
  if (/x([\-\d\.]+)/g.test(text)) {
    textGenList.push('    x = ' + RegExp.$1 + '%\n')
  }
  if (/y([\-\d\.]+)/g.test(text)) {
    textGenList.push('    y = ' + RegExp.$1 + '%\n')
  }
  if (/ax([\-\d\.]+)/g.test(text)) {
    textGenList.push('    anchorX = ' + RegExp.$1 + '\n')
  }
  if (/ay([\-\d\.]+)/g.test(text)) {
    textGenList.push('    anchorY = ' + RegExp.$1 + '\n')
  }
  if (/rx([\-\d\.]+)/g.test(text)) {
    textGenList.push('    rotateX = ' + RegExp.$1 + '\n')
  }
  if (/ry([\-\d\.]+)/g.test(text)) {
    textGenList.push('    rotateY = ' + RegExp.$1 + '\n')
  }
  if (/rz([\-\d\.]+)/g.test(text)) {
    textGenList.push('    rotateZ = ' + RegExp.$1 + '\n')
  }
  let textGen = textGenList.join('')

  let textTime = ''
  if (/t([\-\d\.]+)/g.test(text)) {
    textTime = ' ' + RegExp.$1 + 's'
  }
  // text = text.replace(/x([\-\d\.]+)/g, "x = $1%\n");
  // text = text.replace(/y([\-\d\.]+)/g, "y = $1%\n");
  // text = text.replace(/ax([\-\d\.]+)/g, "anchorX = $1\n");
  // text = text.replace(/ay([\-\d\.]+)/g, "anchorY = $1\n");
  // text = text.replace(/rx([\-\d\.]+)/g, "rotateX = $1\n");
  // text = text.replace(/ry([\-\d\.]+)/g, "rotateY = $1\n");
  // text = text.replace(/rz([\-\d\.]+)/g, "rotateZ = $1\n");
  // text = text.replace(/t([\-\d\.]+)/g, "} $1s\n");
  let myCompletionItem = new vscode.CompletionItem('set', vscode.CompletionItemKind.Field)
  myCompletionItem.insertText = new vscode.SnippetString('set ${1} {\n' + textGen + '}' + textTime)
  myCompletionItem.additionalTextEdits = [
    vscode.TextEdit.delete(
      line.range.with(position.with(undefined, line.firstNonWhitespaceCharacterIndex + 1), undefined)
    ),
  ]
  myCompletionItemList.push(myCompletionItem)

  myCompletionItem = new vscode.CompletionItem('def', vscode.CompletionItemKind.Field)
  myCompletionItem.insertText = new vscode.SnippetString('def text ${1} {\n' + textGen + '}')
  myCompletionItem.additionalTextEdits = [vscode.TextEdit.delete(line.range)]
  myCompletionItemList.push(myCompletionItem)

  myCompletionItem = new vscode.CompletionItem('int', vscode.CompletionItemKind.Field)
  myCompletionItem.insertText = new vscode.SnippetString(textGen)
  myCompletionItem.additionalTextEdits = [vscode.TextEdit.delete(line.range)]
  myCompletionItemList.push(myCompletionItem)

  return attrCompletionItemList.concat(myCompletionItemList)
}
function provideDocumentColors(document: vscode.TextDocument) {
  // console.log("provideDocumentColors");
  let colorInformationList = []
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    let line = document.lineAt(lineIndex)
    let result = /0x([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(line.text)
    if (result) {
      let range = new vscode.Range(lineIndex, result.index, lineIndex, result.index + 8)
      let colorInformation = new vscode.ColorInformation(
        range,
        new vscode.Color(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
          1.0
        )
      )
      // console.log(colorInformation);
      colorInformationList.push(colorInformation)
    }
  }
  // console.log("provideDocumentColors end");
  return colorInformationList
}
function provideColorPresentations(color: vscode.Color) {
  let colorStr =
    '0x' +
    Math.floor(color.red * 255)
      .toString(16)
      .padStart(2, '0') +
    Math.floor(color.green * 255)
      .toString(16)
      .padStart(2, '0') +
    Math.floor(color.blue * 255)
      .toString(16)
      .padStart(2, '0')
  return [new vscode.ColorPresentation(colorStr)]
}
function provideCodeLenses(document: vscode.TextDocument) {
  let lstCodeLenses = []
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    let line = document.lineAt(lineIndex)
    // let result = /\/\/\s*section/.exec(line.text)
    let result = /(\bdef\b\s+text|let)\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(line.text)
    if (result) {
      let codeLens = new vscode.CodeLens(line.range, {
        title: 'Hello',
        command: 'bas.helloWorld',
      })
      lstCodeLenses.push(codeLens)
    }
  }
  return lstCodeLenses
}
function provideDocumentSymbols(document: vscode.TextDocument) {
  let lstDocumentSymbol = []
  /**
   * @type {vscode.DocumentSymbol} symbolNow
   */
  let symbolNow = null
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    let line = document.lineAt(lineIndex)
    let res = /(\bdef\b\s+text|let)\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(line.text)
    if (res) {
      let indChar = res[0].search(res[2])
      let range = new vscode.Range(lineIndex, indChar, lineIndex, indChar + res[2].length)
      symbolNow = new vscode.DocumentSymbol(res[1], res[2], vscode.SymbolKind.Class, range, range)
    } else if ((res = /(\w+)\s*=\s*(.*)/.exec(line.text))) {
      let range = new vscode.Range(lineIndex, res.index, lineIndex, res.index + res[1].length)
      let kind = vscode.SymbolKind.String
      if (['x', 'y', 'zIndex', 'scale', 'duration', 'alpha', 'fontSize'].indexOf(res[1]) != -1)
        kind = vscode.SymbolKind.Number
      else if (['strokeWidth', 'anchorX', 'anchorY', 'rotateX', 'rotateY', 'rotateZ'].indexOf(res[1]) != -1)
        kind = vscode.SymbolKind.Number
      else if (['bold', 'textShadow'].indexOf(res[1]) != -1) kind = vscode.SymbolKind.Boolean

      let documentSymbol = new vscode.DocumentSymbol(res[1], res[2], kind, line.range, range)
      if (symbolNow) symbolNow.children.push(documentSymbol)
    } else if (/\}/.exec(line.text) && symbolNow) {
      // console.log(symbolNow)
      lstDocumentSymbol.push(symbolNow)
      symbolNow = null
    }
  }
  glstDocumentSymbol = lstDocumentSymbol
  return lstDocumentSymbol
}
function provideDefinition(document: vscode.TextDocument, position: vscode.Position) {
  if (!glstDocumentSymbol) return
  for (let index = 0; index < glstDocumentSymbol.length; index++) {
    const documentSymbol = glstDocumentSymbol[index]
    const word = document.getText(document.getWordRangeAtPosition(position))
    if (word == documentSymbol.detail) {
      return new vscode.Location(document.uri, documentSymbol.selectionRange)
    }
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "yo-code-ts" is now active!')

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
  app.use(express.static(path.join(context.extensionPath, 'out/view')))
  let workspaceFolders = vscode.workspace.workspaceFolders
  if (workspaceFolders) app.use(express.static(workspaceFolders[0].uri.fsPath))
  webview(context) // Webview
  context.subscriptions.push(
    vscode.commands.registerCommand('bas.helloWorld', function () {
      vscode.window.showInformationMessage('Hello World from BAS support for VSCode!')
    })
  )
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('bas', {
      provideDocumentFormattingEdits(document, options, token) {
        const start = new vscode.Position(0, 0)
        const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
        const range = new vscode.Range(start, end)
        return [new vscode.TextEdit(range, documentFormatting(document.getText(range)))]
      },
    })
  )
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'bas',
      {
        provideCompletionItems,
      },
      'abcdefghijklmnopqrstuvwxyz'
    )
  )
  context.subscriptions.push(
    vscode.languages.registerColorProvider('bas', {
      provideDocumentColors,
      provideColorPresentations,
    })
  )
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider('bas', {
      provideCodeLenses,
    })
  )
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider('bas', {
      provideDocumentSymbols,
    })
  )
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider('bas', {
      provideDefinition,
    })
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}
