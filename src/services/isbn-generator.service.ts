export class IsbnGeneratorService {

  private static instance: IsbnGeneratorService;
  private currentIsbn = 9780000000000;

  private constructor() {}

  static getInstance(): IsbnGeneratorService {
    if (!IsbnGeneratorService.instance) {
      IsbnGeneratorService.instance = new IsbnGeneratorService();
    }
    return IsbnGeneratorService.instance;
  }

  generate(): string {
    const isbn = this.currentIsbn.toString();
    this.currentIsbn++;
    return isbn;
  }
}