from backend_mock.content import upload_content, Content


def test_doctor_can_upload_content():
    doctor = {"role": "doctor", "name": "Dr. Smith"}
    content = upload_content(
        author=doctor,
        title="Managing Type 2 Diabetes",
        body="Sample text."
    )

    assert isinstance(content, Content)
    assert content.title == "Managing Type 2 Diabetes"
    assert content.author["role"] == "doctor"

