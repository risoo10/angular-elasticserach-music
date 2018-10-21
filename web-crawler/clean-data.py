import json
import os
import datetime

data_path = "DATA"
files = os.listdir(data_path)

artist_files = list(filter(lambda x: x.startswith('artists'), files))
albums_files = list(filter(lambda x: x.startswith('albums'), files))
print(artist_files)
print(albums_files)


# ARTISTS
filtered_artists = {}
artists_urls = {}

with open('EXPORT/artists-02.json', 'w') as artist_output:
    x = 1

    for artist in artist_files:
        with open(os.path.join(data_path, artist)) as f:
            artist_data = json.load(f)
            for key, value in artist_data.items():
                short_key = key.split('discogs.com')[1]
                if short_key not in filtered_artists.keys() and type(value) is dict:
                    artists_urls[key] = key
                    value["key"] = short_key
                    filtered_artists[short_key] = value
                    index = {
                        "index": {
                            "_id": str(x)
                        }
                    }
                    artist_output.write(json.dumps(index) + '\n')
                    artist_output.write(json.dumps(value) + '\n')
                    x += 1

print("All Artists:", len(artists_urls))
with open("all-artists.json", "w") as artists_all:
    json.dump(artists_urls, artists_all)


def always_int(item, field):
    try:
        res = int(item[field])
    except:
        res= None

    return res


def always_double(item, field):
    try:
        res = float(item[field])
    except:
        res = None

    return res


def song_with_default_vals(song):
    if song['time'] == '':
        song['time'] = '0:00'

    return song




# ALBUMS
all_albums = {}


with open('EXPORT/albums-02.json', 'w') as album_out:
    id = 1
    for album in albums_files:
        with open(os.path.join(data_path, album)) as f:
            album_data = json.load(f)
            for album_item in album_data:
                index = {
                    "index": {
                        "_id": str(id)
                    }
                }

                author = album_item["author"]
                if author in filtered_artists:
                    artist = filtered_artists[album_item["author"]]
                    album_item["artist_name"] = artist['name'] if 'name' in artist.keys() else 'Unknown Artist'
                    album_item["artist_key"] = author
                    album_item["artist_real_name"] = artist['realName'] if 'realName' in artist.keys() else ''
                    album_item["artist_profile"] = artist['profile'] if 'profile' in artist.keys() else ''
                    album_item["artist_sites"] = artist['sites'] if 'sites' in artist.keys() else ''
                    album_item["artist_members"] = artist['members'] if 'members' in artist.keys() else ''
                else:
                    album_item["artist_name"] = ''
                    album_item["artist_key"] = author
                    album_item["artist_real_name"] = ''
                    album_item["artist_profile"] = ''
                    album_item["artist_sites"] = ''
                    album_item["artist_members"] = ''

                album_item["year"] = always_int(album_item, "year")
                album_item["stats_have"] = always_int(album_item, "stats_have")
                album_item["stats_want"] = always_int(album_item, "stats_want")
                album_item["stats_ratings_count"] = always_int(album_item, "stats_ratings_count")
                album_item["stats_rating"] = always_double(album_item, "stats_rating")

                today = datetime.date.today()
                album_item["created"] = "" + str(today)

                album_item["songs"] = list(map(lambda x: song_with_default_vals(x), album_item["songs"]))
                print(album_item["author"])

                key = album_item["author"] + "/" + album_item["name"] +'/'+ '-'.join(album_item["genres"])

                if key not in all_albums:
                    all_albums[key] = key
                    album_out.write(json.dumps(index) + '\n')
                    album_out.write(json.dumps(album_item) + '\n')

                    id += 1



print("Total albums size:", id)
