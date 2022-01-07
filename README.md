# BAS Support

为VS Code提供BAS弹幕文件格式支持

## 功能

1. 语法高亮
2. 代码格式化（暂不支持let语法）
3. 自动补全
4. 提供VSCode调色板
5. 大纲列表
6. 跳转到定义
7. Code Lens（开发中）
8. 内置BAS实验室（支持时间跳转）

## 使用方法

1. 在当前工作目录下提供video.mp4文件，打开BAS实验室时会自动加载
2. 打开BAS文件
3. 点击右上角“锥形瓶”图标打开BAS实验室
4. 点击右上角“代码”图标传送BAS文件内容到BAS实验室中
5. 点击BAS实验室中视频播放器左下角的“播放”按钮开始播放
6. 再次点击右上角“锥形瓶”图标可以刷新BAS实验室页面

## 配置
> 参考`https://github.com/nondanee/vsc-netease-music`

VS Code 使用的 Electron 版本不包含 ffmpeg，需替换自带的 ffmpeg 动态链接库才能正常播放**音频** (每次更新 VS Code 都需重新替换)

通过 VS Code 版本在 `https://raw.githubusercontent.com/Microsoft/vscode/%version%/.yarnrc` 查看其使用的 Electron 版本，并于 `https://github.com/electron/electron/releases/tag/%version%` 下载对应的 Electron 完整版本进行替换

### Windows

下载 electron-%version%-win32-%arch%.zip

替换 `./ffmpeg.dll`

### macOS

下载 electron-%version%-darwin-x64.zip

替换 `./Electron.app/Contents/Frameworks/Electron\ Framework.framework/Libraries/libffmpeg.dylib`

### Linux

下载 electron-%version%-linux-%arch%.zip

替换 `./libffmpeg.so`

### 详细步骤

   1. 在VS Code中打开菜单`帮助->关于`，查看VS Code版本，如`1.63.2`
   2. 浏览器访问`https://raw.githubusercontent.com/Microsoft/vscode/1.63.2/.yarnrc`，其内容如下
```
disturl "https://electronjs.org/headers"
target "13.5.2"
runtime "electron"
build_from_source "true"
```
   3. 浏览器访问`https://github.com/electron/electron/releases`，在右侧搜索框中输入`v13.5.2`，按Enter键搜索
   4. 浏览页面，找到`electron v13.5.2`，展开下方的Assets，点击下载所需zip文件
   5. 按前述说明替换文件。以Windows为例，复制zip文件中的ffmpeg.dll到VS Code安装目录中替换对应文件