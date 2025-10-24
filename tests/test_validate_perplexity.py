import json
from datetime import datetime

import pytest

from scripts import validate_perplexity as vp


def test_validate_fact_success():
    fact = {
        "statement": "Test fact",
        "source_url": "https://example.com",
        "published_at": datetime.utcnow().isoformat() + "Z",
    }
    result = vp.validate_fact(fact, max_age_days=365, banned_domains=[])
    assert result["statement"] == "Test fact"


def test_validate_fact_old_date_raises():
    fact = {
        "statement": "Old fact",
        "source_url": "https://example.com",
        "published_at": "2020-01-01T00:00:00Z",
    }
    with pytest.raises(ValueError):
        vp.validate_fact(fact, max_age_days=30, banned_domains=[])


def test_load_facts_handles_list(tmp_path):
    path = tmp_path / "facts.json"
    path.write_text(json.dumps([{"statement": "x", "source_url": "https://e.com", "published_at": "2024-01-01T00:00:00Z"}]))
    facts = vp.load_facts(str(path))
    assert len(facts) == 1
