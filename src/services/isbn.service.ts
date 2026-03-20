import { Injectable } from '@nestjs/common';

@Injectable()
export class IsbnService {
    generateIsbn(): string {
        return '978' + Math.floor(1000000000 + Math.random() * 9000000000);
    }        
}