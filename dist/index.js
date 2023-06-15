"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _fsextra = require('fs-extra'); var _fsextra2 = _interopRequireDefault(_fsextra);
var _fs = require('fs');
var _pathe = require('pathe'); var _pathe2 = _interopRequireDefault(_pathe);
var _imagemin = require('imagemin'); var _imagemin2 = _interopRequireDefault(_imagemin);
var _imageminpngquant = require('imagemin-pngquant'); var _imageminpngquant2 = _interopRequireDefault(_imageminpngquant);
var _unplugin = require('unplugin');
var _chalk = require('chalk'); var _chalk2 = _interopRequireDefault(_chalk);
var tinyMap = /* @__PURE__ */ new Map();
async function compressPNG(inputFilePath, options = {}) {
  const buffer = await _fsextra2.default.readFile(inputFilePath);
  const compressedBuffer = await _imagemin2.default.buffer(buffer, {
    plugins: [_imageminpngquant2.default.call(void 0, options)]
  });
  const size = compressedBuffer.byteLength, oldSize = buffer.byteLength;
  tinyMap.set(inputFilePath, {
    size: size / 1024,
    oldSize: oldSize / 1024,
    ratio: size / oldSize - 1,
    inputFilePath
  });
  await _fsextra2.default.writeFile(inputFilePath, compressedBuffer);
}
function handleOutputLogger(recordMap) {
  console.log(
    `
${_chalk2.default.cyan("\u2728 [vite-unplugin-imagemin]")}- compressed image resource successfully: `
  );
  const keyLengths = Array.from(recordMap.keys(), (name) => name.length);
  const valueLengths = Array.from(
    recordMap.values(),
    (value) => `${Math.floor(100 * value.ratio)}`.length
  );
  const maxKeyLength = Math.max(...keyLengths);
  const valueKeyLength = Math.max(...valueLengths);
  recordMap.forEach((value, name) => {
    let { ratio } = value;
    const { size, oldSize, inputFilePath } = value;
    ratio = Math.floor(100 * ratio);
    const fr = `${ratio}`;
    const denseRatio = ratio > 0 ? _chalk2.default.red(`+${fr}%`) : ratio <= 0 ? _chalk2.default.green(`${fr}%`) : "";
    const sizeStr = `${oldSize.toFixed(2)}kb / tiny: ${size.toFixed(2)}kb`;
    console.log(
      _chalk2.default.dim(
        inputFilePath + " --/> " + _chalk2.default.blueBright(name) + " ".repeat(2 + maxKeyLength - name.length) + _chalk2.default.gray(
          `${denseRatio} ${" ".repeat(valueKeyLength - fr.length)}`
        ) + " " + _chalk2.default.dim(sizeStr)
      )
    );
  });
  console.log("\n");
}
function listPNGFilesInFolder(folderPath) {
  const pngFiles = [];
  const files = _fs.readdirSync.call(void 0, folderPath);
  files.forEach((file) => {
    const filePath = _pathe2.default.join(folderPath, file);
    const stats = _fs.statSync.call(void 0, filePath);
    if (stats.isFile() && _pathe2.default.extname(filePath).toLowerCase() === ".png") {
      pngFiles.push(filePath);
    } else if (stats.isDirectory()) {
      const subfolderPNGFiles = listPNGFilesInFolder(filePath);
      pngFiles.push(...subfolderPNGFiles);
    }
  });
  return pngFiles;
}
var unplugin = _unplugin.createUnplugin.call(void 0, (options = {}) => {
  return {
    name: "unplugin-compressed-tinify",
    closeBundle: async () => {
      const { dirs } = options;
      const option = {
        // Specify compression options if needed
      };
      const pngLists = listPNGFilesInFolder(dirs);
      console.log(pngLists);
      try {
        for (const inputFilePath of pngLists) {
          await compressPNG(inputFilePath, option).catch((error) => {
            console.error("Error:", error);
          });
        }
        handleOutputLogger(tinyMap);
      } catch (error) {
        console.log(error);
      }
      console.log("**** closeBundle ****");
    }
  };
});
var src_default = unplugin.vite;



exports.default = src_default; exports.unplugin = unplugin;
