import { unlink, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Required for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteFile = (fileName) => {
  const filePath = path.join(__dirname, `../uploads/${fileName}`);
  unlink(filePath, (err) => {
    if (err) {
      console.log(`Could not delete file ${filePath}`);
    }
  });
};

export const makeRequiredDirectories = () => {
  const directories = ["uploads"];
  directories.forEach((directory) => {
    const dir = path.join(__dirname, `../${directory}`);
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
  });
};
