import json

from scripts.utils import formatting


def test_canonicalize_trim():
    draft = formatting.Draft(
        title="  Title  with   spaces ",
        body=" Line one \n Line two ",
        cta=" Respond now "
    )
    canonical = draft.canonicalize()
    assert canonical["title"] == "Title with spaces"
    assert canonical["body"] == "Line one\nLine two"
    assert canonical["cta"] == "Respond now"


def test_emit_log_writes_json(tmp_path, monkeypatch):
    log_path = tmp_path / "scrolls" / "latest.ndjson"
    monkeypatch.setattr(formatting, "LOG_PATH", log_path)
    formatting.emit_log(job_id="job-1", stage="test", status="success", payload={"hello": "world"}, checksum_source="abc")
    content = log_path.read_text().strip()
    record = json.loads(content)
    assert record["jobId"] == "job-1"
    assert record["checksum"]
    assert record["payload"] == {"hello": "world"}


def test_enforce_banned_phrases_detects():
    violations = list(formatting.enforce_banned_phrases("This is a game changer for us"))
    assert violations == ["game changer"]
