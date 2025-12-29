import requests
import platform
import sys
import os

def download_package(package_name):
    print(f"Fetching info for {package_name}...")
    try:
        r = requests.get(f"https://pypi.org/pypi/{package_name}/json", verify=False)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"Failed to fetch metadata: {e}")
        return None

    # Determine current python version and platform
    py_ver = f"cp{sys.version_info.major}{sys.version_info.minor}"
    plat = "win_amd64" if platform.machine().lower() == "amd64" else "win32"
    
    print(f"Looking for wheel for {py_ver} on {plat}...")

    found_url = None
    found_filename = None

    # Check releases (latest first)
    for version in sorted(data["releases"].keys(), reverse=True):
        for file_info in data["releases"][version]:
            filename = file_info["filename"]
            # Check for Windows AMD64 and compatible python version
            # We need win_amd64. We can accept cp313, or abi3 (which works for newer pythons)
            is_platform_ok = "win_amd64" in filename
            is_python_ok = py_ver in filename or "abi3" in filename or "py3" in filename
            
            if filename.endswith(".whl") and is_platform_ok and is_python_ok:
                found_url = file_info["url"]
                found_filename = filename
                print(f"Found compatible wheel: {filename}")
                break
        if found_url:
            break
    
    if not found_url:
        print("No compatible wheel found.")
        return None

    print(f"Downloading {found_filename}...")
    try:
        r = requests.get(found_url, verify=False, stream=True)
        r.raise_for_status()
        with open(found_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded {found_filename}")
        return found_filename
    except Exception as e:
        print(f"Failed to download: {e}")
        return None

if __name__ == "__main__":
    # Try pymupdf first, then pypdf if not found
    whl = download_package("pymupdf")
    if not whl:
        print("Trying pypdf...")
        whl = download_package("pypdf")
