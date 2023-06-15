// src/index.ts
import fs from "fs-extra";
import { readdirSync, statSync } from "fs";
import path from "pathe";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { createUnplugin } from "unplugin";
import chalk from "chalk";
var tinyMap = /* @__PURE__ */ new Map();
async function compressPNG(inputFilePath, options = {}) {
  const buffer = await fs.readFile(inputFilePath);
  const compressedBuffer = await imagemin.buffer(buffer, {
    plugins: [imageminPngquant(options)]
  });
  const size = compressedBuffer.byteLength, oldSize = buffer.byteLength;
  tinyMap.set(inputFilePath, {
    size: size / 1024,
    oldSize: oldSize / 1024,
    ratio: size / oldSize - 1,
    inputFilePath
  });
  await fs.writeFile(inputFilePath, compressedBuffer);
}
function handleOutputLogger(recordMap) {
  console.log(
    `
${chalk.cyan("\u2728 [vite-unplugin-imagemin]")}- compressed image resource successfully: `
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
    const denseRatio = ratio > 0 ? chalk.red(`+${fr}%`) : ratio <= 0 ? chalk.green(`${fr}%`) : "";
    const sizeStr = `${oldSize.toFixed(2)}kb / tiny: ${size.toFixed(2)}kb`;
    console.log(
      chalk.dim(
        inputFilePath + " --/> " + chalk.blueBright(name) + " ".repeat(2 + maxKeyLength - name.length) + chalk.gray(
          `${denseRatio} ${" ".repeat(valueKeyLength - fr.length)}`
        ) + " " + chalk.dim(sizeStr)
      )
    );
  });
  console.log("\n");
}
function listPNGFilesInFolder(folderPath) {
  const pngFiles = [];
  const files = readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = statSync(filePath);
    if (stats.isFile() && path.extname(filePath).toLowerCase() === ".png") {
      pngFiles.push(filePath);
    } else if (stats.isDirectory()) {
      const subfolderPNGFiles = listPNGFilesInFolder(filePath);
      pngFiles.push(...subfolderPNGFiles);
    }
  });
  return pngFiles;
}
var unplugin = createUnplugin((options = {}) => {
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
export {
  src_default as default,
  unplugin
};
