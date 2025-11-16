from backend_mock.bookmarks import add_bookmark, get_bookmarks


def test_user_can_bookmark_content():
    user = {"role": "patient", "name": "Alex", "bookmarks": []}

    add_bookmark(user, content_id=1)
    bookmarks = get_bookmarks(user)

    assert len(bookmarks) == 1
    assert bookmarks[0].content_id == 1

