import { Injectable } from '@nestjs/common';

@Injectable()
export class IsbnService {
  private currentIsbn = 9780000000000;

  generateIsbn(): string {
    const isbn = this.currentIsbn.toString();
    this.currentIsbn++;
    return isbn;
  }
}
