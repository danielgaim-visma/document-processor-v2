from flask import Blueprint, request, jsonify
from .utils import upload_and_parse, keyword_search, extract_and_structure

main = Blueprint('main', __name__)

@main.route('/api/upload-and-parse', methods=['POST'])
def api_upload_and_parse():
    # Implementation here

@main.route('/api/keyword-search', methods=['POST'])
def api_keyword_search():
    # Implementation here

@main.route('/api/extract-and-structure', methods=['POST'])
def api_extract_and_structure():
    # Implementation here