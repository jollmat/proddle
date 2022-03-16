import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageCacheService {
  _cachedImages: { url: string; blob: Blob }[] = [];

  constructor(private http: HttpClient) {}

  getImageUrl(url: string) {
    const index = this._cachedImages.findIndex((image) => image.url === url);
    if (index > -1) {
      const image = this._cachedImages[index];
      return of(URL.createObjectURL(image.blob));
    }
    return this.http
      .get(url, { responseType: 'blob' })
      .pipe(tap((blob) => this.checkAndCacheImage(url, blob)));
  }

  private checkAndCacheImage(imageUrl: string, blob: Blob) {
    const image = this._cachedImages.find((_image) => {
      return _image.url === imageUrl;
    });
    if (!image) {
      this._cachedImages.push({ url: imageUrl, blob });
    }
  }
}
