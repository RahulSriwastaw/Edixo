
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** eduhub-backend
- **Date:** 2026-03-11
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC002 get api mockbook folders list all folders
- **Test Code:** [TC002_get_api_mockbook_folders_list_all_folders.py](./TC002_get_api_mockbook_folders_list_all_folders.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 30, in <module>
  File "<string>", line 14, in test_get_mockbook_folders_list_all
AssertionError: Expected status 200, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/2820f80f-beb8-4fb8-9183-3d83506ad6f4/b0e19807-8c99-44fb-b442-75337cd942f8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 get api super admin mockbook orgid tests list tests with superadmin authorization
- **Test Code:** [TC005_get_api_super_admin_mockbook_orgid_tests_list_tests_with_superadmin_authorization.py](./TC005_get_api_super_admin_mockbook_orgid_tests_list_tests_with_superadmin_authorization.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 28, in <module>
  File "<string>", line 16, in test_get_superadmin_mockbook_orgid_tests_list
AssertionError: Expected status 200, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/2820f80f-beb8-4fb8-9183-3d83506ad6f4/e0a23e93-0117-43f1-a233-38e6ec37ec68
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---