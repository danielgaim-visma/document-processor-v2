import os
import docx
import openpyxl
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from openai import OpenAI

nltk.download('punkt')
nltk.download('stopwords')

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def read_file_content(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == '.txt':
        with open(file_path, 'r') as file:
            return file.read()
    elif file_extension == '.docx':
        doc = docx.Document(file_path)
        return ' '.join([para.text for para in doc.paragraphs])
    elif file_extension == '.xlsx':
        workbook = openpyxl.load_workbook(file_path)
        sheet = workbook.active
        return '\n'.join([' '.join([str(cell.value) for cell in row]) for row in sheet.iter_rows()])
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")


def parse_content(content):
    # Split content into sections based on headings or word count
    sections = re.split(r'\n(?=#{1,3}\s)', content)  # Split on headings
    if len(sections) <= 1:
        # If no headings found, split by word count
        words = content.split()
        sections = [' '.join(words[i:i + 500]) for i in range(0, len(words), 500)]
    return sections


def extract_keywords(text):
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(text.lower())
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
    word_freq = nltk.FreqDist(filtered_words)
    return [word for word, _ in word_freq.most_common(10)]


def extract_and_structure_data(content, keywords):
    prompt = f"Given the following content and keywords, extract and structure the main points:\n\nContent: {content}\n\nKeywords: {', '.join(keywords)}\n\nStructured output:"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "You are a helpful assistant that extracts and structures information from text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error in OpenAI API call: {str(e)}")