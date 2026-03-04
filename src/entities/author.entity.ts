export class AuthorEntity {
  id!: string;
  firstName!: string;
  lastName!: string;
  dateOfBirth!: Date;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: AuthorEntity) {
    Object.assign(this, data);
  }
}
