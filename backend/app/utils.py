import os
import re
import docx
import openpyxl
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import openai
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

openai.api_key = os.getenv("OPENAI_API_KEY")

def read_file_content(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()

    try:
        if file_extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
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
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        raise

def parse_content(content):
    try:
        sections = re.split(r'\n(?=#{1,3}\s)', content)  # Split on headings
        if len(sections) <= 1:
            # If no headings found, split by word count
            words = content.split()
            sections = [' '.join(words[i:i + 500]) for i in range(0, len(words), 500)]
        return sections
    except Exception as e:
        logger.error(f"Error parsing content: {str(e)}")
        raise

def extract_keywords(text):
    try:
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(text.lower())
        filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
        word_freq = nltk.FreqDist(filtered_words)
        return [word for word, _ in word_freq.most_common(10)]
    except Exception as e:
        logger.error(f"Error extracting keywords: {str(e)}")
        raise

def extract_and_structure_data(content, keywords):
    prompt = f"Given the following content and keywords, extract and structure the main points:\n\nContent: {content}\n\nKeywords: {', '.join(keywords)}\n\nStructured output:"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts and structures information from text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        logger.error(f"Error in OpenAI API call: {str(e)}")
        raise Exception(f"Error in OpenAI API call: {str(e)}")