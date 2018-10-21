import {Injectable} from '@angular/core';
import * as elasticsearch from 'elasticsearch-browser';
import {Client} from 'elasticsearch-browser';
import {Observable} from 'rxjs';
import {from} from 'rxjs';
import {SearchResponse} from 'elasticsearch';
import {FacetResponse} from '../model/facet.model';
import {map} from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class AlbumsSearchService {

  private client: Client;
  private aggregationsQuery = {
    'genres_terms': {
      'significant_terms': {
        'field': 'genres',
        'size': 8
      }
    },
    'styles_terms': {
      'significant_terms': {
        'field': 'styles',
        'size': 8
      }
    },
    'decade_ranges': {
      'range': {
        'field': 'year',
        'ranges': [
          {'to': 1970},
          {'from': 1970, 'to': 1980},
          {'from': 1980, 'to': 1990},
          {'from': 1990, 'to': 2000},
          {'from': 2000, 'to': 2010},
          {'from': 2010}
        ]
      }
    }
  };

  constructor() {
    if (!this.client) {
      this._connect();
    }
  }

  private connect() {
    this.client = new Client({
      host: 'http://localhost:9200',
      log: 'trace'
    });
  }

  private _connect() {
    this.client = new elasticsearch.Client({
      host: 'localhost:9200',
    });
  }

  isAvailable(): Observable<any> {
    return from(this.client.ping({
      requestTimeout: Infinity,
      body: 'Hello Richard'
    }));
  }

  getAlbumAggregations(): Observable<FacetResponse> {
    return from(this.client.search({
      index: 'albums',
      type: 'album',
      body: {
        'aggregations': this.aggregationsQuery
      }
    })).pipe(map((item: SearchResponse<any>) => item.aggregations));
  }


  searchFilterAlbums(
    searchText: string,
    facets: FacetResponse,
    pageIndex: number = 0,
    pageSize: number = 20
  ): Observable<SearchResponse<any>> {

    // Prepare filter query
    const filterQuery = [
      {
        'terms': {
          'genres': facets.genres_terms.buckets.filter(facet => facet.checked).map(item => item.key)
        }
      },
      {
        'terms': {
          'styles': facets.styles_terms.buckets.filter(facet => facet.checked).map(item => item.key)
        }
      },
      {
        'bool': {
          'should': facets.decade_ranges.buckets.filter(facet => facet.checked).map(facet => {
            const facetResp = {};
            if (facet.from) {
              facetResp['gte'] = facet.from;
            }
            if (facet.to) {
              facetResp['lte'] = facet.to;
            }
            return {'range': {'year': {...facetResp}}};
          })
        }
      }
    ];

    // Search query or match all if empty search
    let query = {};
    if (searchText === '') {
      query = {
        'bool': {
          'must': [
            {'match_all': {}}
          ],
          'filter': filterQuery
        }
      };
    } else {
      query = {
        'bool': {
          'must': [
            {'match': {'name': searchText}}
          ],
          'filter': filterQuery
        }
      };
    }


    return from(this.client.search({
      index: 'albums',
      type: 'album',
      body: {
        'from': pageIndex * pageSize,
        'size': pageSize,
        'query': query,
        'aggregations': this.aggregationsQuery
      }
    }));
  }

  searchFullText(searchText: string, pageIndex: number = 0, pageSize: number = 20): Observable<SearchResponse<any>> {

    // Search query or match all if empty search
    const query = {};
    if (searchText === '') {
      query['match_all'] = {};
    } else {
      query['multi_match'] = {
        'query': searchText,
        'fields': ['name^6', 'artist_name^3', 'song.title']
      };
    }

    return from(this.client.search({
      index: 'albums',
      type: 'album',
      body: {
        'from': pageIndex * pageSize,
        'size': pageSize,
        'query': query,
        'highlight': {
          'fields': {
            'name': {},
            'artist_name': {},
            'songs.title': {},
          }
        }
      },
      _source: ['name', 'artist_name', 'genres', 'image_url', 'styles', 'songs']
    }));
  }
}
