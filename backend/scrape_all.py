import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urldefrag

BASE_URL = "https://docs.smartflo.tatatelebusiness.com/"
VISITED = set()
DOCS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "smartflo_docs.txt")

def fetch_and_extract(url, f_out):
    url, _ = urldefrag(url) # remove fragments
    # skip auth redirects to save time
    if "/login" in url or "redirect_uri" in url:
        return
        
    if url in VISITED or not url.startswith(BASE_URL):
        return
    VISITED.add(url)
    
    try:
        print(f"Scraping: {url}")
        res = requests.get(url, timeout=5)
        if res.status_code != 200:
            return
        
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Extract main content
        main_content = soup.find("article") or soup.find("main") or soup.find("div", class_="theme-doc-markdown") or soup.body
        if main_content:
            text = main_content.get_text(separator="\n", strip=True)
            if text:
                f_out.write(f"\n\n=== SOURCE: {url} ===\n\n{text}\n\n")
                f_out.flush()
        
        # Scrape links to crawl deeper
        all_links = soup.find_all("a", href=True)
        links_to_visit = []
        for a in all_links:
            next_url = urljoin(url, a["href"])
            if next_url.startswith(BASE_URL) and next_url not in VISITED:
                links_to_visit.append(next_url)
                
        # Recurse
        for next_url in links_to_visit:
            fetch_and_extract(next_url, f_out)
            
    except Exception as e:
        print(f"Error scraping {url}: {e}")

def main():
    print("Starting specialized scrape for Smartflo API Reference...")
    # Do NOT clear the file, we append to existing documentation
    # open(DOCS_FILE, "w", encoding="utf-8").close()
    
    with open(DOCS_FILE, "a", encoding="utf-8") as f_out:
        fetch_and_extract("https://docs.smartflo.tatatelebusiness.com/reference/introduction-to-apis-1", f_out)
        
    print(f"✅ API Reference appended to {DOCS_FILE}")

if __name__ == "__main__":
    main()
