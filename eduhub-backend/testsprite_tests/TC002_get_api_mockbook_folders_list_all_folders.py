import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_get_mockbook_folders_list_all():
    url = f"{BASE_URL}/api/mockbook/folders"
    headers = {
        "Accept": "application/json",
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        # Assert status code is 200 OK
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()

        # Assert the response is a list or contains a list of folders
        assert isinstance(json_data, list), "Response is not a list"
        # Check at least one folder has typical folder keys and includes public/global or org folders
        # We assume folders have keys: id, name, path, orgId (based on PRD)
        assert any(
            isinstance(folder, dict) and
            all(k in folder for k in ("id", "name", "path", "orgId"))
            for folder in json_data
        ), "No folders with expected keys found"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_mockbook_folders_list_all()