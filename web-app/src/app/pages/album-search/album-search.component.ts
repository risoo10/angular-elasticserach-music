import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material';
import {merge, Observable, Subject} from 'rxjs';
import {AlbumHits, AlbumSource} from '../../model/album.model';
import {AlbumsSearchService} from '../../services/albums-search.service';
import {debounceTime, map, switchMap, take} from 'rxjs/internal/operators';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'esm-album-search',
  templateUrl: 'album-search.component.html',
  styleUrls: ['album-search.component.scss']
})

export class AlbumSearchComponent implements OnInit, AfterViewInit {

  page = 0;
  pageSize = 20;
  searchValue = '';

  searched$ = new Subject();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  hitsTotal$: Observable<number>;
  results$: Observable<AlbumSource[]>;


  constructor(
    @Inject(AlbumsSearchService) private es: AlbumsSearchService
  ) {

  }

  ngAfterViewInit(): void {
    const hits$ = merge(this.searched$, this.paginator.page).pipe(
      switchMap((res) => {
        return this.es.searchFullText(this.searchValue, this.paginator.pageIndex, this.paginator.pageSize);
      }),
      map((val) => val.hits)
    );
    this.hitsTotal$ = hits$.pipe(map((hits: AlbumHits) => hits.total));
    this.results$ = hits$.pipe(map((results: AlbumHits) => results.hits));
  }

  ngOnInit(): void {
    // Ping Elastic searchs ervice
    this.es.isAvailable().pipe(take(1))
      .subscribe((resp) => {
          console.log(resp);
        }, error => {
          console.error('Server is down', error);
        },
        () => {
          console.log('Completed');
        });
  }

  onSearch(searchValue) {
    this.searchValue = searchValue;
    this.searched$.next();
  }
}
