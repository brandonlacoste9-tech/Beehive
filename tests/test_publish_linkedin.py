import pytest

from scripts import publish_linkedin as pl


def test_build_payload_requires_author(monkeypatch):
    monkeypatch.delenv("CONTENT_AGENT_LINKEDIN_AUTHOR", raising=False)
    with pytest.raises(RuntimeError):
        pl.build_payload({"title": "t", "body": "b", "cta": "c"})


def test_build_payload_success(monkeypatch):
    monkeypatch.setenv("CONTENT_AGENT_LINKEDIN_AUTHOR", "123")
    payload = pl.build_payload({"title": "Title", "body": "Body", "cta": "CTA"})
    assert payload["author"].endswith("123")
    assert "Body" in payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareCommentary"]["text"]


def test_build_payload_rejects_banned_phrase(monkeypatch):
    monkeypatch.setenv("CONTENT_AGENT_LINKEDIN_AUTHOR", "123")
    with pytest.raises(ValueError):
        pl.build_payload({"title": "A game changer", "body": "Body", "cta": "CTA"})
