import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { merge, Observable, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/internal/operators';
import { AlbumHits, AlbumSource } from '../../model/album.model';
import { FacetGroup, FacetResponse, RangeFacetGroup } from '../../model/facet.model';
import { AlbumsSearchService } from '../../services/albums-search.service';

@Component({
  selector: 'esm-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements OnInit, AfterViewInit, OnDestroy {

  page = 0;
  pageSize = 20;
  searchValue = '';

  destroyed$ = new Subject();
  searched$ = new Subject();
  facetChanged$ = new Subject();
  initialized$ = new Subject();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  hitsTotal$: Observable<number>;
  results$: Observable<AlbumSource[]>;

  facets: FacetResponse;

  constructor(@Inject(AlbumsSearchService) private es: AlbumsSearchService) {
  }

  ngOnInit() {
    // Initialize facets
    this.es.getAlbumAggregations().pipe(take(1)).subscribe((res) => {
      this.facets = this.enableAllFacets(res);
      this.initialized$.next();
    });

    // Start search query
    this.initialized$.pipe(take(1)).subscribe(() => {
      const response$ = merge(this.searched$, this.paginator.page, this.facetChanged$).pipe(
        switchMap((res) => {
          return this.es.searchFilterAlbums(this.searchValue, this.facets, this.paginator.pageIndex, this.paginator.pageSize);
        })
      );

      // Subscribe to update facets
      response$.pipe(takeUntil(this.destroyed$)).subscribe(resp => {
        this.updateFacets(resp.aggregations);
      });

      const hits$ = response$.pipe(map(item => item.hits));
      this.hitsTotal$ = hits$.pipe(map((hits: AlbumHits) => hits.total));
      this.results$ = hits$.pipe(map((results: AlbumHits) => results.hits));
    });
  }

  ngAfterViewInit() {
    this.searched$.next();
  }

  onSearch($event) {
    this.searchValue = $event;
    this.searched$.next();
  }

  enableAllFacets(facets: FacetResponse): FacetResponse {
    facets.decade_ranges = this.enableFacetsForGroup(facets.decade_ranges) as RangeFacetGroup;
    facets.genres_terms = this.enableFacetsForGroup(facets.genres_terms);
    facets.styles_terms = this.enableFacetsForGroup(facets.styles_terms);
    return facets;
  }

  enableFacetsForGroup(group: FacetGroup): FacetGroup | RangeFacetGroup {
    group.buckets = group.buckets.map((facet) => {
      return {
        ...facet,
        checked: true
      };
    });

    return group;
  }

  onFacetsChange() {
    this.facetChanged$.next();
  }

  updateFacets(newAggs: FacetResponse) {
    for (const key of Object.keys(newAggs)) {
      const facetGroup = newAggs[key];
      this.facets[key].buckets = this.facets[key].buckets.map(item => {
        item.doc_count = 0;
        const newFacet = facetGroup.buckets.find((facet) => item.key === facet.key);
        if (newFacet && newFacet.hasOwnProperty('doc_count')) {
          item.doc_count = newFacet.doc_count;
        }
        return item;
      });
    }
  }

  ngOnDestroy(): void {
    console.log('Destroyed component');
    this.destroyed$.next();
  }

}
