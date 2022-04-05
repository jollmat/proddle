import { Routes } from '@angular/router';
import { AlertsComponent } from 'src/app/components/alerts/alerts.component';
import { RegisterComponent } from 'src/app/components/register/register.component';
import { AuthenticationNoneGuard } from 'src/app/guards/authentication-none.guard';
import { StatisticsComponent } from '../../components/data-analisis/statistics/statistics.component';
import { HomeComponent } from '../../components/home/home.component';
import { LoginComponent } from '../../components/login/login.component';
import { AddProductByBarcodeComponent } from '../../components/products/add-product-by-barcode/add-product-by-barcode.component';
import { ProductEditComponent } from '../../components/products/product-edit/product-edit.component';
import { ProductSearchComponent } from '../../components/products/product-search/product-search.component';
import { ShoppingCartComponent } from '../../components/shopping-cart/shopping-cart.component';
import { ShopCreateComponent } from '../../components/shops/shop-create/shop-create.component';
import { ShopEditComponent } from '../../components/shops/shop-edit/shop-edit.component';
import { ShopSearchComponent } from '../../components/shops/shop-search/shop-search.component';
import { UserDetailComponent } from '../../components/user-detail/user-detail.component';
import { ForbiddenComponent } from '../../components/utils/forbidden/forbidden.component';
import { PageNotFoundComponent } from '../../components/utils/page-not-found/page-not-found.component';
import { AuthenticationGuard } from '../../guards/authentication.guard';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthenticationGuard] },
  {
    path: 'user',
    component: UserDetailComponent,
    canActivate: [AuthenticationGuard],
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [AuthenticationNoneGuard] 
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [AuthenticationNoneGuard] },
  {
    path: 'scan',
    component: AddProductByBarcodeComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'search-products',
    component: ProductSearchComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'search-shops',
    component: ShopSearchComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'edit-shop/:id',
    component: ShopEditComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'new-shop',
    component: ShopCreateComponent,
    canActivate: [AuthenticationGuard],
  },
  { path: 'edit-product/:barcode', component: ProductEditComponent },
  {
    path: 'new-product',
    redirectTo: 'scan',
    pathMatch: 'full',
  },
  {
    path: 'shoppingCart',
    component: ShoppingCartComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'alerts',
    component: AlertsComponent,
    canActivate: [AuthenticationGuard],
  },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: PageNotFoundComponent },
];
