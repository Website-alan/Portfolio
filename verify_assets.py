import os
import re
from pathlib import Path

def verify_paths():
    root = Path(r"c:\Users\alanb\OneDrive\Desktop\Projects\New folder")
    html_files = list(root.glob("*.html"))
    
    # Regex to find src="..." or url('...')
    src_pattern = re.compile(r'(src|--thumb: url)\s*[:=]\s*["\']([^"\']+)["\']')
    
    errors = []
    
    for html_file in html_files:
        content = html_file.read_text(encoding='utf-8')
        matches = src_pattern.findall(content)
        
        for attr, path in matches:
            # Clean path (remove url('') if present)
            clean_path = path.strip()
            
            # Skip external links
            if clean_path.startswith("http") or clean_path.startswith("https") or clean_path.startswith("javascript"):
                continue
                
            file_path = root / clean_path
            if not file_path.exists():
                errors.append(f"In {html_file.name}: {clean_path} does not exist at {file_path}")
            else:
                print(f"OK: {html_file.name} -> {clean_path}")

    if errors:
        print("\nERRORS FOUND:")
        for err in errors:
            print(err)
    else:
        print("\nAll internal assets verified successfully!")

if __name__ == "__main__":
    verify_paths()
