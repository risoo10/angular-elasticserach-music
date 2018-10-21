
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
}

export interface AlbumSource {
  _source: Album;
  highlight: any;
}

export interface AlbumHits {
  hits: AlbumSource[];
  total: number;
}
