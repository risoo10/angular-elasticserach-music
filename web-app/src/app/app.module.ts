import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AlbumsSearchService} from './services/albums-search.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlbumSearchComponent} from './pages/album-search/album-search.component';
import {MenuComponent} from './components/menu/menu.component';
import {FacetsComponent} from './pages/facets/facets.component';
import {RouterModule, Routes} from '@angular/router';
import { ArtistSearchComponent } from './pages/artist-search/artist-search.component';

const routes: Routes = [
  {path: '', component: AlbumSearchComponent},
  {path: 'facets', component: FacetsComponent},
  {path: 'artists', component: ArtistSearchComponent},
  {path: '*', pathMatch: 'full', redirectTo: '/', }
]


@NgModule({
  declarations: [
    AppComponent,
    AlbumSearchComponent,
    MenuComponent,
    FacetsComponent,
    ArtistSearchComponent,
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
    MatAutocompleteModule,
    MatIconModule,
    MatButtonToggleModule,
    FormsModule,
  ],
  providers: [AlbumsSearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
