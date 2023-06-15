import fs from "fs-extra";
import { readdirSync, statSync } from "fs";
import path from "pathe";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { createUnplugin } from "unplugin";
import chalk from "chalk";
export interface PluginOptions {
  dirs?: string;
}
let tinyMap = new Map<
  string,
  { size: number; oldSize: number; ratio: number; inputFilePath: string }
>();

async function compressPNG(inputFilePath, options = {}) {
  const buffer = await fs.readFile(inputFilePath);

  const compressedBuffer = await imagemin.buffer(buffer, {
    plugins: [imageminPngquant(options)],
  });

  const size = compressedBuffer.byteLength,
    oldSize = buffer.byteLength;

  tinyMap.set(inputFilePath, {
    size: size / 1024,
    oldSize: oldSize / 1024,
    ratio: size / oldSize - 1,
    inputFilePath: inputFilePath,
  });

  await fs.writeFile(inputFilePath, compressedBuffer);
}

// Packed output logic
function handleOutputLogger(
  recordMap: Map<
    string,
    { size: number; oldSize: number; ratio: number; inputFilePath: string }
  >
) {
  console.log(
    `\n${chalk.cyan("✨ [vite-unplugin-imagemin]")}` +
      "- compressed image resource successfully: "
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

    const denseRatio =
      ratio > 0
        ? chalk.red(`+${fr}%`)
        : ratio <= 0
        ? chalk.green(`${fr}%`)
        : "";

    const sizeStr = `${oldSize.toFixed(2)}kb / tiny: ${size.toFixed(2)}kb`;
    console.log(
      chalk.dim(
        inputFilePath +
          " --/> " +
          chalk.blueBright(name) +
          " ".repeat(2 + maxKeyLength - name.length) +
          chalk.gray(
            `${denseRatio} ${" ".repeat(valueKeyLength - fr.length)}`
          ) +
          " " +
          chalk.dim(sizeStr)
      )
    );
  });
  console.log("\n");
}
function listPNGFilesInFolder(folderPath) {
  const pngFiles: any[] = [];

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
export const unplugin = createUnplugin((options: PluginOptions = {}) => {
  return {
    name: "unplugin-compressed-tinify",
    generateBundle: async (_, bundler) => {
      
    },
    closeBundle: async () => {
      // Usage example
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
    },
  };
});

export default unplugin.vite;
