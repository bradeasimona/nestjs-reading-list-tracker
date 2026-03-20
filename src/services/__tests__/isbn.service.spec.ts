import { IsbnService } from '../isbn.service';

describe('IsbnService', () => {
  let service: IsbnService;

  beforeEach(() => {
    service = new IsbnService();
  });

  it('should generate an ISBN starting with 978', () => {
    const isbn = service.generateIsbn();

    expect(isbn.startsWith('978')).toBe(true);
  });

  it('should generate a 13 digit ISBN', () => {
    const isbn = service.generateIsbn();

    expect(isbn.length).toBe(13);
  });
});
