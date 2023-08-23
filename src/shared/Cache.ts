import { createHash } from "crypto";
import { format, startOfDay } from "date-fns";
import { FileSystem } from "./FileSystem";

export class Cache {
  readFromCache(url: string): string {
    this.prepareCacheDirectory();
    const fileName = this.getFileName(url);
    if (FileSystem.doesFileExist(fileName)) {
      return FileSystem.readFileContent(fileName);
    }

    return "";
  }

  cacheContent(content: string, url: string) {
    this.prepareCacheDirectory();
    const fileName = this.getFileName(url);
    FileSystem.createFileIfNotExists(fileName, content);
  }

  private getFileName(url: string) {
    const date = this.getTodayDate();
    return (
      this.getCacheDirectoryName() +
      "/" +
      this.getHashOfFileName(date, url) +
      ".html"
    );
  }

  private prepareCacheDirectory() {
    const directoryName = this.getCacheDirectoryName();
    FileSystem.createDirectoryIfNotExists(directoryName);
  }

  private getTodayDate(): string {
    const today = startOfDay(new Date());
    return format(today, "yyyy-MM-dd");
  }

  private getHashOfFileName(date: string, url: string): string {
    return createHash("md5")
      .update(date + url)
      .digest("hex");
  }

  private getCacheDirectoryName() {
    return "/cache";
  }
}
