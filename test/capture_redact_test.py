import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from capture_redact import redact_body, redact_headers, redact_path


class CaptureRedactionTest(unittest.TestCase):
    def test_account_values_do_not_leave_the_shape(self):
        source = (
            b'{"xuid":"1234567890123456","authorization":"secret-token",'
            b'"party":{"members":[{"gamertag":"Someone","role":"member"}],"active":true}}'
        )
        result = redact_body(source, "application/json")
        self.assertEqual(result["xuid"], "<string>")
        self.assertEqual(result["authorization"], "<string>")
        self.assertEqual(result["party"]["members"]["items"][0]["role"], "member")
        self.assertNotIn("Someone", str(result))
        self.assertNotIn("secret-token", str(result))

    def test_path_and_headers_hide_ids_and_tokens(self):
        self.assertEqual(
            redact_path("/worlds/12345/stories/settings?secret=token"),
            "/worlds/<value>/stories/settings?secret=<value>",
        )
        self.assertEqual(
            redact_headers(
                {"Authorization": "secret", "Content-Type": "application/json"}
            ),
            {"content-type": "application/json"},
        )

    def test_id_keyed_maps_and_query_keys_hide_account_values(self):
        source = (
            b'{"result":{"2535412345678901":{"state":"online"},'
            b'"someone@example.com":[]},"@odata.context":"https://example.com"}'
        )
        self.assertEqual(
            redact_body(source, "application/json"),
            {
                "result": {"<key>": {"state": "online"}},
                "@odata.context": "<string>",
            },
        )
        self.assertEqual(
            redact_path("/users?2535412345678901=1&max=2"),
            "/users?<key>=<value>&max=<value>",
        )


if __name__ == "__main__":
    unittest.main()
