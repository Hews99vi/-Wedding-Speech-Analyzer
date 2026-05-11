import json
import pytest
from unittest.mock import MagicMock, patch

from services.gemini import _clean_json_response, analyze_transcript_highlights


def test_clean_json_strips_code_fence():
    raw = "```json\n{\"key\": \"val\"}\n```"
    assert _clean_json_response(raw) == '{"key": "val"}'


def test_clean_json_strips_plain_fence():
    raw = "```\n{\"key\": \"val\"}\n```"
    assert _clean_json_response(raw) == '{"key": "val"}'


def test_clean_json_plain_passthrough():
    raw = '{"key": "val"}'
    assert _clean_json_response(raw) == '{"key": "val"}'


def test_clean_json_strips_whitespace():
    raw = "  \n  {\"key\": \"val\"}  \n  "
    assert _clean_json_response(raw) == '{"key": "val"}'


def _make_gemini_response(payload: dict) -> MagicMock:
    mock_response = MagicMock()
    mock_response.text = json.dumps(payload)
    return mock_response


@patch("services.gemini.genai.configure")
@patch("services.gemini.genai.GenerativeModel")
def test_analyze_highlights_builds_correct_index(mock_model_cls, mock_configure):
    segments_input = [
        {"index": 0, "start_time": 0.0, "end_time": 5.0, "text": "Hello"},
        {"index": 1, "start_time": 5.0, "end_time": 10.0, "text": "World"},
    ]
    gemini_payload = {
        "segments": [
            {"index": 0, "highlight_score": 7.5, "highlight_label": "Toast"},
            {"index": 1, "highlight_score": 3.0, "highlight_label": None},
        ]
    }
    mock_model_cls.return_value.generate_content.return_value = _make_gemini_response(gemini_payload)

    result = analyze_transcript_highlights(segments_input)

    assert 0 in result
    assert 1 in result
    assert result[0]["highlight_score"] == 7.5
    assert result[0]["highlight_label"] == "Toast"
    assert result[1]["highlight_score"] == 3.0


@patch("services.gemini.genai.configure")
@patch("services.gemini.genai.GenerativeModel")
def test_analyze_highlights_raises_on_invalid_json(mock_model_cls, mock_configure):
    mock_response = MagicMock()
    mock_response.text = "not valid json at all"
    mock_model_cls.return_value.generate_content.return_value = mock_response

    with pytest.raises(ValueError, match="invalid highlight JSON"):
        analyze_transcript_highlights([{"index": 0, "start_time": 0.0, "end_time": 5.0, "text": "Hi"}])


@patch("services.gemini.genai.configure")
@patch("services.gemini.genai.GenerativeModel")
def test_analyze_highlights_handles_missing_segments_key(mock_model_cls, mock_configure):
    mock_response = MagicMock()
    mock_response.text = "{}"
    mock_model_cls.return_value.generate_content.return_value = mock_response

    result = analyze_transcript_highlights([])
    assert result == {}


@patch("services.gemini.genai.configure")
@patch("services.gemini.genai.GenerativeModel")
def test_analyze_highlights_english_prompt_includes_language(mock_model_cls, mock_configure):
    mock_response = MagicMock()
    mock_response.text = '{"segments": []}'
    mock_model_cls.return_value.generate_content.return_value = mock_response

    analyze_transcript_highlights([], language="en")

    call_args = mock_model_cls.return_value.generate_content.call_args
    prompt = call_args[0][0]
    assert "English" in prompt


@patch("services.gemini.genai.configure")
@patch("services.gemini.genai.GenerativeModel")
def test_analyze_highlights_sinhala_prompt_includes_language(mock_model_cls, mock_configure):
    mock_response = MagicMock()
    mock_response.text = '{"segments": []}'
    mock_model_cls.return_value.generate_content.return_value = mock_response

    analyze_transcript_highlights([], language="si")

    call_args = mock_model_cls.return_value.generate_content.call_args
    prompt = call_args[0][0]
    assert "Sinhala" in prompt
