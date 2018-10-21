
export interface Song {
  title: string;
  time: Date;
}

export interface Album {
  name: string;
  artist_name: string;
  genres: string[];
  styles: string[];
  image_url: string;
  songs: Song[];
  year: number;
  stats_rating: number;
  stats_want: number;
}

export interface AlbumSource {
  _source: Album;
  highlight: any;
}

export interface AlbumHits {
  hits: AlbumSource[];
  total: number;
}
