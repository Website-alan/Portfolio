import os
from bs4 import BeautifulSoup

def verify_links():
    root = "c:\\Users\\alanb\\OneDrive\\Desktop\\Projects\\New folder"
    html_files = [f for f in os.listdir(root) if f.endswith(".html")]
    
    errors = []
    
    for html_file in html_files:
        with open(os.path.join(root, html_file), "r", encoding="utf-8") as f:
            content = f.read()
            soup = BeautifulSoup(content, "html.parser")
            
            # Check all links (a tags)
            for a in soup.find_all("a", href=True):
                href = a["href"]
                
                # Skip external links and anchors
                if href.startswith("http") or href.startswith("mailto:") or href.startswith("#") or href.startswith("javascript"):
                    continue
                
                # Split at # to verify only the file path
                file_part = href.split("#")[0]
                if not file_part: # This handles cases like "#contact" if it wasn't caught earlier
                    continue

                file_path = os.path.join(root, file_part)
                if not os.path.exists(file_path):
                    errors.append(f"In {html_file}: Broken link '{href}'")
                else:
                    print(f"OK: {html_file} -> {href}")

    if errors:
        print("\nERRORS FOUND:")
        for err in errors:
            print(err)
    else:
        print("\nAll internal links verified successfully!")

if __name__ == "__main__":
    verify_links()
