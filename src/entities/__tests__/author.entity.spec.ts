import { AuthorEntity } from '../author.entity';

describe('AuthorEntity', () => {
  it('should create an instance with all properties', () => {
    const mockAuthorEntity = {
      id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-19'),
      email: 'john.doe@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dummyAuthorEntity = new AuthorEntity(mockAuthorEntity);

    expect(dummyAuthorEntity).toEqual(mockAuthorEntity);

    //choose one or the other, ^ already checks each propriety individually
    expect(dummyAuthorEntity.id).toBe(mockAuthorEntity.id);
    expect(dummyAuthorEntity.firstName).toBe(mockAuthorEntity.firstName);
    expect(dummyAuthorEntity.lastName).toBe(mockAuthorEntity.lastName);
    expect(dummyAuthorEntity.dateOfBirth).toBe(mockAuthorEntity.dateOfBirth);
    expect(dummyAuthorEntity.createdAt).toBe(mockAuthorEntity.createdAt);
    expect(dummyAuthorEntity.updatedAt).toBe(mockAuthorEntity.updatedAt);
  });
});
