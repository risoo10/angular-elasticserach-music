import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AlbumsSearchService} from './services/albums-search.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatInputModule, MatPaginatorModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlbumSearchComponent} from './pages/album-search/album-search.component';
import {MenuComponent} from './components/menu/menu.component';
import {FacetsComponent} from './pages/facets/facets.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: '', component: AlbumSearchComponent},
  {path: 'facets', component: FacetsComponent},
  {path: '*', pathMatch: 'full', redirectTo: '/', }
]


@NgModule({
  declarations: [
    AppComponent,
    AlbumSearchComponent,
    MenuComponent,
    FacetsComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatPaginatorModule,
    MatChipsModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
  ],
  providers: [AlbumsSearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
