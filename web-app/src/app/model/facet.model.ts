export interface Facet {
  key: string;
  doc_count: number;
  checked?: boolean;
}

export interface RangeFacet extends Facet {
  from: number;
  to: number;
}

export interface FacetGroup {
  buckets: Facet[];
}

export  interface RangeFacetGroup extends FacetGroup{
  buckets: RangeFacet[];
}

export interface FacetResponse {
  genres_terms: FacetGroup;
  styles_terms: FacetGroup;
  decade_ranges: RangeFacetGroup;
}
