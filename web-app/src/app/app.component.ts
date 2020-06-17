import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AlbumsSearchService} from './services/albums-search.service';
import {FormControl} from '@angular/forms';
import {debounceTime, switchMap} from 'rxjs/operators';
import {merge, Observable} from 'rxjs';
import {map, take} from 'rxjs/internal/operators';
import {Album, AlbumHits, AlbumSource} from './model/album.model';
import {MatPaginator} from '@angular/material';

@Component({
  selector: 'esm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor() {

  }

  ngOnInit(): void {
  }


}
