export type StatusType = 'READING' | 'FINISHED';

export class BookEntity {
  id!: string;
  title!: string;
  author!: string;
  totalPages!: number;
  currentPage!: number;
  status!: StatusType;
  progress!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: BookEntity) {
    Object.assign(this, data);
  }
}

