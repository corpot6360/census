import { Routes } from '@angular/router';
import { CensusPageComponent } from './census-page/census-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'census-create' },
  { path: 'census-create', component: CensusPageComponent },
  { path: '**', redirectTo: 'census-create' }
];