import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {AlbumHits, AlbumSource} from '../../model/album.model';
import {FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent, MatPaginator} from '@angular/material';
import {debounceTime, map, switchMap} from 'rxjs/internal/operators';
import {Artist} from '../../model/artist.model';
import {AlbumsSearchService} from '../../services/albums-search.service';
import {CONSTANTS} from '../../constants';

@Component({
  selector: 'esm-artist-search',
  templateUrl: './artist-search.component.html',
  styleUrls: ['./artist-search.component.scss']
})
export class ArtistSearchComponent implements OnInit {

  page = 0;
  pageSize = 20;
  searchValue = '';

  CONSTANTS = CONSTANTS;
  sortOption = CONSTANTS.SORT_OPTIONS.RATING_HAVING;

  artistsCntrl = new FormControl();
  selectedArtists: Artist[] = [];

  // Async events
  searched$ = new Subject();
  sortChanged$ = new Subject();
  selectedArtist$ = new Subject();

  // Async data
  hitsTotal$: Observable<number>;
  results$: Observable<AlbumSource[]>;

  filteredArtists$: Observable<Artist[]>;

  @ViewChild('artistInput', { static: true }) artistInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(@Inject(AlbumsSearchService) private es: AlbumsSearchService) {
  }

  ngOnInit() {
    // Listen to input changes
    this.filteredArtists$ = this.artistsCntrl.valueChanges.pipe(
      debounceTime(200),
      switchMap(() => {
        return this.es.filterAlbumArtists(10, this.artistsCntrl.value, this.selectedArtists);
      })
    );

    // Setup album searching using selected artists and sorting option
    const hits$ = merge(this.searched$, this.sortChanged$, this.selectedArtist$, this.paginator.page).pipe(switchMap(() => {
      return this.es.searchFilteredAlbumsSort(
        this.searchValue,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.selectedArtists,
        this.sortOption
      );
    }));

    this.hitsTotal$ = hits$.pipe(map((hits: AlbumHits) => hits.total));
    this.results$ = hits$.pipe(map((results: AlbumHits) => results.hits));

    // Initialize first search
    this.searched$.next();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedArtists.push(event.option.value);
    this.artistInput.nativeElement.value = '';
    this.artistsCntrl.setValue('');
    this.selectedArtist$.next();
  }

  remove(artist: any): void {
    const index = this.selectedArtists.indexOf(artist);

    if (index >= 0) {
      this.selectedArtists.splice(index, 1);
    }

    this.selectedArtist$.next();
  }

  onSearch($event) {
    this.searchValue = $event;
    this.searched$.next();
  }

  onSortChanged() {
    this.sortChanged$.next();
  }

}
