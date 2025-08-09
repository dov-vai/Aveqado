export class TextUtils {
  private constructor() {}

  static removeFileExtension(fileName?: string) {
    return fileName?.replace(/\.[^/.]+$/, '');
  }
}
