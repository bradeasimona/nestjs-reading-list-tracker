import { BookEntity, BookStatus } from '../book.entity';

describe('BookEntity', () => {
  it('should create an instance with all properties', () => {
    const mockBookEntity = {
      isbn: '9783161484104',
      id: '2288421b-3de3-4431-8f41-145766da4f3b',
      title: 'Test',
      authorId: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      totalPages: 100,
      currentPage: 0,
      status: BookStatus.NOT_STARTED,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dummyBookEntity = new BookEntity(mockBookEntity);

    expect(dummyBookEntity).toEqual(mockBookEntity);

    //choose one or the other, ^ already checks each propriety individually
    expect(dummyBookEntity.id).toBe(mockBookEntity.id);
    expect(dummyBookEntity.title).toBe(mockBookEntity.title);
    expect(dummyBookEntity.authorId).toBe(mockBookEntity.authorId);
    expect(dummyBookEntity.totalPages).toBe(mockBookEntity.totalPages);
    expect(dummyBookEntity.currentPage).toBe(mockBookEntity.currentPage);
    expect(dummyBookEntity.status).toBe(mockBookEntity.status);
    expect(dummyBookEntity.progress).toBe(mockBookEntity.progress);
    expect(dummyBookEntity.createdAt).toBe(mockBookEntity.createdAt);
    expect(dummyBookEntity.updatedAt).toBe(mockBookEntity.updatedAt);
  });

  describe('BookStatus enum', () => {
    it('should contain expected values', () => {
      expect(BookStatus.NOT_STARTED).toBe('NOT_STARTED');
      expect(BookStatus.READING).toBe('READING');
      expect(BookStatus.PAUSED).toBe('PAUSED');
      expect(BookStatus.FINISHED).toBe('FINISHED');
    });
  });
});
