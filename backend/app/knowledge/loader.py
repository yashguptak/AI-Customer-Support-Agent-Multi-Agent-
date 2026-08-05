from pypdf import PdfReader


class PDFLoader:

    @staticmethod
    def load(path: str):

        reader = PdfReader(path)

        text = ""

        for page in reader.pages:
            text += page.extract_text() + "\n"

        return text