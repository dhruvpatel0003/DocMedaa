class Content:
    def __init__(self, author, title, body):
        self.author = author
        self.title = title
        self.body = body


def upload_content(author, title, body):
    return Content(author=author, title=title, body=body)
