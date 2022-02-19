import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenFoodProductInterface } from '../model/interfaces/openfood-product.interface';

@Injectable({ providedIn: 'root' })
export class OpenFoodService {
  constructor(private http: HttpClient) {}

  loadProduct(codeBar: string): Observable<OpenFoodProductInterface> {
    return this.http.get<OpenFoodProductInterface>(
      'https://es.openfoodfacts.org/api/v0/product/' + codeBar + '.json'
    );
  }
}
