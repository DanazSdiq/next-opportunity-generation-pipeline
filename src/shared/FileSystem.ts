import fs from "fs";

export class FileSystem {
  static createFileIfNotExists(fileName: string, content: string) {
    const fullPath = this.getFullPath(fileName);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
    }
  }

  static createDirectoryIfNotExists(directoryName: string) {
    const fullPath = this.getFullPath(directoryName);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  }

  static readFileContent(fileName: string): string {
    const fullPath = this.getFullPath(fileName);
    return fs.readFileSync(fullPath, "utf-8");
  }

  static readDirectoryContent(directoryName: string): string[] {
    const fullPath = this.getFullPath(directoryName);
    return fs.readdirSync(fullPath);
  }

  static doesFileExist(name: string) {
    const fullPath = this.getFullPath(name);
    return fs.existsSync(fullPath);
  }

  private static getFullPath(name: string): string {
    return process.cwd() + "/" + name;
  }
}
