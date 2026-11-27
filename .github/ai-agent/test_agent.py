import unittest

from agent import safe_patch_paths


class PatchSafetyTests(unittest.TestCase):
    def test_accepts_normal_source_file(self):
        patch = "--- a/src/app.py\n+++ b/src/app.py\n@@ -1 +1 @@\n-old\n+new\n"
        self.assertEqual(safe_patch_paths(patch), ["src/app.py"])

    def test_rejects_parent_directory_traversal(self):
        patch = "--- a/../outside.txt\n+++ b/../outside.txt\n@@ -1 +1 @@\n-a\n+b\n"
        with self.assertRaises(ValueError):
            safe_patch_paths(patch)

    def test_rejects_workflow_changes(self):
        patch = "--- a/.github/workflows/ci.yml\n+++ b/.github/workflows/ci.yml\n@@ -1 +1 @@\n-a\n+b\n"
        with self.assertRaises(ValueError):
            safe_patch_paths(patch)

    def test_rejects_environment_files(self):
        patch = "--- a/.env\n+++ b/.env\n@@ -1 +1 @@\n-a\n+b\n"
        with self.assertRaises(ValueError):
            safe_patch_paths(patch)

    def test_rejects_service_account_files(self):
        patch = "--- a/config/firebase-adminsdk.json\\n+++ b/config/firebase-adminsdk.json\\n@@ -1 +1 @@\\n-a\\n+b\\n"
        with self.assertRaises(ValueError):
            safe_patch_paths(patch)

    def test_rejects_lockfiles(self):
        patch = "--- a/package-lock.json\n+++ b/package-lock.json\n@@ -1 +1 @@\n-a\n+b\n"
        with self.assertRaises(ValueError):
            safe_patch_paths(patch)

    def test_rejects_oversized_patch(self):
        with self.assertRaises(ValueError):
            safe_patch_paths(" " * 150_001)


if __name__ == "__main__":
    unittest.main()
