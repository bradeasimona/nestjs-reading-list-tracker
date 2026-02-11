export enum BookStatus {
  READING = 'READING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}
export class BookEntity {
  id!: string;
  title!: string;
  author!: string;
  totalPages!: number;
  currentPage!: number;
  status!: BookStatus;
  progress!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: BookEntity) {
    Object.assign(this, data);
  }
}
