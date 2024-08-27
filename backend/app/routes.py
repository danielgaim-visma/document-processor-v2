from flask import Blueprint, request, jsonify, current_app, send_file
from .utils import read_file_content, parse_content, extract_keywords, extract_and_structure_data
import os
import logging
import json
from datetime import datetime
import zipfile

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
            parsed_sections = parse_content(content)
            keywords = extract_keywords(content)

            return jsonify({
                'parsed_sections': parsed_sections,
                'keywords': keywords,
                'original_filename': filename
            }), 200
        except Exception as e:
            logger.error(f"Error in upload_and_parse: {str(e)}")
            return jsonify({'error': str(e)}), 500

    logger.error("File upload failed")
    return jsonify({'error': 'File upload failed'}), 400

@main.route('/api/process-sections', methods=['POST'])
def process_sections():
    data = request.json
    if not data or 'parsed_sections' not in data or 'keywords' not in data or 'original_filename' not in data:
        logger.error("Insufficient data provided")
        return jsonify({'error': 'Insufficient data provided'}), 400

    try:
        parsed_sections = data['parsed_sections']
        keywords = data['keywords']
        original_filename = data['original_filename']

        if not parsed_sections:
            logger.error("No sections to process")
            return jsonify({'error': 'No sections to process'}), 400

        output_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'processed_files')
        os.makedirs(output_dir, exist_ok=True)

        json_files = []
        errors = []
        for i, section in enumerate(parsed_sections, 1):
            try:
                logger.info(f"Processing section {i}")
                structured_data = extract_and_structure_data(section, keywords)
                structured_data['section_number'] = i
                file_name = f"section_{i:03d}.json"
                file_path = os.path.join(output_dir, file_name)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(structured_data, f, ensure_ascii=False, indent=2)
                json_files.append(file_path)
                logger.info(f"Successfully processed section {i}")
            except Exception as section_error:
                error_message = f"Error processing section {i}: {str(section_error)}"
                logger.error(error_message)
                errors.append(error_message)

        if not json_files:
            logger.error("No sections were successfully processed")
            return jsonify({'error': 'No sections were successfully processed', 'details': errors}), 500

        # Create a metadata file
        metadata = {
            "original_file": original_filename,
            "total_sections": len(parsed_sections),
            "processed_sections": len(json_files),
            "global_keywords": keywords,
            "processed_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "errors": errors
        }
        metadata_file = os.path.join(output_dir, "metadata.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        json_files.append(metadata_file)

        # Create a zip file
        zip_file_name = f"processed_files_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], zip_file_name)
        with zipfile.ZipFile(zip_file_path, 'w') as zipf:
            for file in json_files:
                zipf.write(file, arcname=os.path.basename(file))

        return jsonify({'zip_file': zip_file_name, 'errors': errors}), 200
    except Exception as e:
        logger.error(f"Error in process_sections: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_file(os.path.join(current_app.config['UPLOAD_FOLDER'], filename), as_attachment=True)
    except Exception as e:
        logger.error(f"Error in download_file: {str(e)}")
        return jsonify({'error': str(e)}), 500