import { IsbnGeneratorService } from "../isbn-generator.service";

describe('IsbnGeneratorService', () => {
    it('should create a singleton instance',() => {
        const instance = IsbnGeneratorService.getInstance();

        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(IsbnGeneratorService);
    });

    it('should return the same instance every time', () => {
        const instance1 = IsbnGeneratorService.getInstance();
        const instance2 = IsbnGeneratorService.getInstance();

        expect(instance1).toBe(instance2);
    });

    it('should generate incrementing ISBN values', () => {
        const generator = IsbnGeneratorService.getInstance();
        const isbn1 = generator.generate();
        const isbn2 = generator.generate();

        expect(isbn1).toBe('9780000000000');
        expect(isbn2).toBe('9780000000001');
    })
})