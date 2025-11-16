class Bookmark:
    def __init__(self, content_id):
        self.content_id = content_id


def add_bookmark(user, content_id):
    # user is a simple dict with a 'bookmarks' list
    user["bookmarks"].append(Bookmark(content_id))
    return True


def get_bookmarks(user):
    return user["bookmarks"]
