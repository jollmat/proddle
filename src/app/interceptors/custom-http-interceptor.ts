import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CustomHTTPInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('CustomHTTPInterceptor.intercept():', httpRequest);
    return next.handle(httpRequest);
  }
}