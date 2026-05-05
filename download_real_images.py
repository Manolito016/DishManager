import urllib.request
import os

def download_image(url, filename):
    filepath = os.path.join(r"C:\Projects\Personal Cooking System\backend\storage\app\public\photos", filename)
    print(f"Downloading {url} to {filepath}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
        with urllib.request.urlopen(req, timeout=15) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Successfully downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

images = {
    'https://upload.wikimedia.org/wikipedia/commons/3/38/Chicken_adobo.jpg': 'chicken-adobo.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Chicken_tinola.jpg/1024px-Chicken_tinola.jpg': 'chicken-tinola.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a1/Chicken_Afritada_on_white_rice_with_pineapple_tidbits_%28Philippines%29.jpg': 'chicken-afritada.jpg',
    'https://www.kawalingpinoy.com/wp-content/uploads/2018/01/chicken-caldereta-1.jpg': 'chicken-caldereta.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_inasal.jpg': 'chicken-inasal.jpg'
}

for url, filename in images.items():
    download_image(url, filename)
