from flask import Blueprint, request, jsonify, current_app
from .utils import read_file_content, parse_content, extract_keywords, extract_and_structure_data
import os
import logging

main = Blueprint('main', __name__)
logger = logging.getLogger(__name__)


@main.route('/api/upload-and-parse', methods=['POST'])
def upload_and_parse():
    if 'file' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        logger.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400

    if file:
        try:
            filename = file.filename
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            logger.info(f"File saved: {file_path}")

            content = read_file_content(file_path)
            parsed_data = parse_content(content)
            return jsonify({'parsed_data': parsed_data}), 200
        except Exception as e:
            logger.error(f"Error in upload_and_parse: {str(e)}")
            return jsonify({'error': str(e)}), 500

    logger.error("File upload failed")
    return jsonify({'error': 'File upload failed'}), 400


@main.route('/api/keyword-search', methods=['POST'])
def keyword_search():
    data = request.json
    if not data or 'parsed_data' not in data:
        logger.error("No parsed data provided")
        return jsonify({'error': 'No parsed data provided'}), 400

    try:
        keywords = extract_keywords(' '.join(data['parsed_data']))
        return jsonify({'keywords': keywords}), 200
    except Exception as e:
        logger.error(f"Error in keyword_search: {str(e)}")
        return jsonify({'error': str(e)}), 500


@main.route('/api/extract-and-structure', methods=['POST'])
def extract_and_structure():
    data = request.json
    if not data or 'parsed_data' not in data or 'keywords' not in data:
        logger.error("Insufficient data provided")
        return jsonify({'error': 'Insufficient data provided'}), 400

    try:
        content = ' '.join(data['parsed_data'])
        structured_data = extract_and_structure_data(content, data['keywords'])
        return jsonify({'extracted_data': structured_data}), 200
    except Exception as e:
        logger.error(f"Error in extract_and_structure: {str(e)}")
        return jsonify({'error': str(e)}), 500