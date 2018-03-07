export class Version {
  version: string;
  versionMajor: number;
  versionMinor: number = 0;

  constructor(version: string) {
    this.version = version;

    const vmLength = version.indexOf('.') === -1 ? version.length : version.indexOf('.');
    this.versionMajor = parseInt(version.substr(0, vmLength), 10);
    this.versionMinor = parseInt(version.substr(vmLength + 1), 10);
    if (isNaN(this.versionMinor)) {
      this.versionMinor = 0;
    }
  }

  newerThan(version: string): boolean {
    const v = new Version(version);

    if (this.versionMajor > v.versionMajor) {
      return true;
    } else if (this.versionMajor === v.versionMajor && this.versionMinor > v.versionMinor) {
      return true;
    } else {
      return false;
    }
  }

  equalOrHigher(version: string): boolean {
    const v = new Version(version);

    if (this.versionMajor > v.versionMajor) {
      return true;
    } else if (this.versionMajor === v.versionMajor && this.versionMinor >= v.versionMinor) {
      return true;
    } else {
      return false;
    }
  }

  upTo(version: string): boolean {
    return !this.newerThan(version);
  }
}
