import requests

BASE_URL = "http://localhost:4000"
ORG_ID = "GK-ORG-00234"
SUPERADMIN_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SuperAdminMockToken"  # Replace with valid SuperAdmin JWT for testing
TIMEOUT = 30


def test_get_superadmin_mockbook_orgid_tests_list():
    url = f"{BASE_URL}/api/super-admin/mockbook/{ORG_ID}/tests"
    headers = {
        "Authorization": f"Bearer {SUPERADMIN_JWT}"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response data is not a list"
        # Further validation can include checking keys in mock test objects if needed
        for item in data:
            assert isinstance(item, dict), "Mock test item is not a dict"
            assert "testId" in item or "id" in item or "title" in item, "Mock test item missing expected keys"
        print("Test passed: SuperAdmin mockbook orgId tests list retrieved successfully.")
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"


test_get_superadmin_mockbook_orgid_tests_list()