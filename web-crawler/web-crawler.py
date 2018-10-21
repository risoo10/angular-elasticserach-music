from selenium import webdriver
from bs4 import BeautifulSoup
import json
import time

# create a new Firefox session
driver = webdriver.Chrome(executable_path="C:\chromedriver/chromedriver")
driver.implicitly_wait(2)

base_url = "https://www.discogs.com/"
search_url = "search/?sort=want%2Cdesc&genre_exact=Hip+Hop&page="
start_page = 1
driver.get(base_url + search_url + str(start_page))
batch_size = 50

filtered_albums = []

excluded_artists = ["https://www.discogs.com/artist/Unknown+Artist?anv=", 'https://www.discogs.com/artist/Various?anv=', 'https://www.discogs.com/artist/355-Unknown-Artist']

with open("all-artists.json") as filtered_artist_data:
    filtered_artists = json.load(filtered_artist_data)


try:
    # Page Level
    for page in range(batch_size):

        print("On Page " + str(start_page + page) + " =============== ")

        albums = driver.find_elements_by_css_selector('#search_results .shortcut_navigable')
        albums_ids = list(map(lambda album: album.get_attribute("data-id"), albums))

        # Album LEVEL
        for element_id in albums_ids:
            print("   Working on Album id: " + element_id + " .......")

            # Click album page
            try:
                album_button = driver.find_element_by_css_selector(
                "div[data-id=" + element_id + "].shortcut_navigable h4 > a.search_result_title")

                album_button.click()
            except:
                print("Error ... skiping album")
                continue

            driver.implicitly_wait(2)

            soup = BeautifulSoup(driver.page_source, "lxml")

            # Parse data from page
            # print(soup)
            album = {}
            album_title = soup.select('h1#profile_title > span')
            album["name"] = getattr(album_title[1], 'text', '').strip(' \t\n\r') if len(album_title) >= 2 else ''
            album["author"] = getattr(soup.select_one('h1#profile_title span > a'), 'attrs', {"href": ''})["href"]
            album_contents = soup.select('.profile > .content')
            album["genres"] = list(map(lambda x: x.text, album_contents[0].select('a'))) if len(
                album_contents) >= 1 else ''
            album["styles"] = list(map(lambda x: x.text, album_contents[1].select('a'))) if len(
                album_contents) >= 2 else ''
            album["year"] = getattr(album_contents[2].select('a')[0], 'text', '').strip(' \t\n\r') if len(
                album_contents) >= 3 and len(album_contents[2].select('a')) >= 1 else ''
            album["image_url"] = \
                getattr(soup.select_one('.thumbnail_size_large.thumbnail_orientation_nocrop .thumbnail_center img'),
                        'attrs', {"src": ''})["src"]
            statistics = soup.select_one('#statistics')
            if statistics :
                album["stats_have"] = getattr(statistics.select_one('.section_content .coll_num'), 'text', '').strip(
                    ' \t\n\r')
                album["stats_want"] = getattr(statistics.select_one('.section_content .want_num'), 'text', '').strip(
                    ' \t\n\r')
                album["stats_rating"] = getattr(statistics.select_one('.section_content .rating_value'), 'text',
                                                '').strip(
                    ' \t\n\r')
                album["stats_ratings_count"] = getattr(statistics.select_one('.section_content .rating_count'), 'text',
                                                       '').strip(' \t\n\r')

            tracks = map(lambda x: {
                "title": getattr(x.select_one('.tracklist_track_title .tracklist_track_title'), 'text', '').strip(
                    ' \t\n\r'),
                "time": getattr(x.select_one('.tracklist_track_duration > span'), 'text', '').strip(' \t\n\r'),
            }, soup.select('#tracklist .playlist .tracklist_track'))

            album["songs"] = list(tracks)

            comments = map(lambda x: {
                "name": getattr(x.select_one('.user'), 'text', '').strip(' \t\n\r'),
                "date": getattr(x.select_one('.date'), 'text', '').strip(' \t\n\r'),
                "text": getattr(x.select_one('.review_comment'), 'text', '').strip(' \t\n\r'),

            }, soup.select('#reviews .review'))
            album["comments"] = list(comments)

            filtered_albums.append(album)

            # Go Back to listings page
            driver.implicitly_wait(2)
            driver.execute_script("window.history.go(-1)")
            time.sleep(1)

            # Artist LEVEL
            # Filter only unique artists
            try:
                artist_button = driver.find_element_by_css_selector(
                "div[data-id=" + element_id + "].shortcut_navigable h5 > span > a")
            except:
                print("Error ... skiping ARTIST")
                continue


            # Check if new artist
            artist_url = artist_button.get_attribute('href')
            if (artist_url not in filtered_artists and artist_url not in excluded_artists):

                print("   Working on Artist " + str(artist_url))

                # Click artist page
                try:
                    artist_button.click()
                except:
                    print("Error ... skiping ARTIST")
                    continue

                soup = BeautifulSoup(driver.page_source, "lxml")
                driver.implicitly_wait(2)

                # Parse data from page
                # print(soup)
                artist = {}
                profile_block = soup.select_one('#page_content .body .profile')
                artist["name"] = getattr(profile_block.select_one('h1.hide_mobile'), 'text', '').strip(' \t\n\r')
                profile_contents = profile_block.select('.content')
                profile_headers = profile_block.select('.head')
                artist["imageUrl"] = getattr(soup.select_one('#page_content .body .image_gallery a.thumbnail_link img'),
                                             'src', '')

                for index, head in enumerate(profile_headers):
                    if (len(profile_headers) >= index + 1):
                        header_text = getattr(head, 'text', '')
                        if (header_text == 'Real Name:'):
                            artist["realName"] = getattr(profile_contents[index], 'text', '').strip(' \t\n\r')
                        elif (header_text == 'Profile:'):
                            artist["profile"] = getattr(profile_contents[index].select_one('#profile'), 'text',
                                                        '').strip(' \t\n\r')
                        elif (header_text == 'Sites:'):
                            sites = profile_contents[index].select('a')
                            artist["sites"] = list(map(lambda x: getattr(x, 'text', ''), sites))
                        elif (header_text == 'Members:'):
                            members = profile_contents[index].select('div.readmore > a')
                            artist["members"] = list(map(lambda x: getattr(x, 'text', ''), members))

                # Save data using url index
                filtered_artists[artist_url] = artist

            # Go Back to listings page
                driver.execute_script("window.history.go(-1)")

        # Next page button
        next_button = driver.find_element_by_css_selector('.pagination .pagination_page_links li a[rel=next]')
        next_button.click()
        time.sleep(6)

finally:
    with open('albums-latin' + str(start_page) + '-' + str(start_page + page) + '-' + str(time.time()) + '.json',
              'w') as albumfile:
        json.dump(filtered_albums, albumfile)

    with open('artists-latin' + str(start_page) + '-' + str(start_page + page) + '-' + str(time.time()) + '.json',
              'w') as artistfile:
        json.dump(filtered_artists, artistfile)
