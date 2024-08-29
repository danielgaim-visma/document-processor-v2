from flask import Blueprint, request, jsonify, current_app, send_file
from .utils import read_file_content, parse_content, extract_keywords, extract_and_structure_data
import os
import json
from datetime import datetime
import zipfile
import logging
from logging_config import log_api_request, log_api_response, log_error

main = Blueprint('main', __name__)
logger = logging.getLogger('api')

@main.route('/api')
def api_home():
    log_api_request(logger, '/api', 'GET')
    response = {"message": "Welcome to the Document Processor API"}
    log_api_response(logger, '/api', 200, response=response)
    return jsonify(response), 200

@main.route('/api/upload-and-parse', methods=['POST'])
def upload_and_parse():
    log_api_request(logger, '/api/upload-and-parse', 'POST', files=request.files, form=request.form)

    if 'file' not in request.files:
        log_error(logger, "No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        log_error(logger, "No selected file")
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

            response = {
                'parsed_sections': parsed_sections,
                'keywords': keywords,
                'original_filename': filename
            }
            log_api_response(logger, '/api/upload-and-parse', 200, response=response)
            return jsonify(response), 200
        except Exception as e:
            log_error(logger, f"Error in upload_and_parse: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    log_error(logger, "File upload failed")
    return jsonify({'error': 'File upload failed'}), 400

@main.route('/api/process-sections', methods=['POST'])
def process_sections():
    log_api_request(logger, '/api/process-sections', 'POST', data=request.json)
    data = request.json
    if not data or 'parsed_sections' not in data or 'keywords' not in data or 'original_filename' not in data:
        log_error(logger, "Insufficient data provided")
        return jsonify({'error': 'Insufficient data provided'}), 400

    try:
        parsed_sections = data['parsed_sections']
        keywords = data['keywords']
        original_filename = data['original_filename']

        if not parsed_sections:
            log_error(logger, "No sections to process")
            return jsonify({'error': 'No sections to process'}), 400

        output_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'processed_files')
        os.makedirs(output_dir, exist_ok=True)

        json_files = []
        errors = []
        for i, section in enumerate(parsed_sections, 1):
            try:
                logger.info(f"Processing section {i}")

                if not isinstance(section, str):
                    section = str(section)

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
                log_error(logger, error_message, exc_info=True)
                errors.append(error_message)

                fallback_data = {
                    "section_number": i,
                    "title": f"Error in Section {i}",
                    "body": f"Failed to process this section. Error: {str(section_error)}",
                    "tags": []
                }
                file_name = f"section_{i:03d}_error.json"
                file_path = os.path.join(output_dir, file_name)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(fallback_data, f, ensure_ascii=False, indent=2)
                json_files.append(file_path)

        if not json_files:
            log_error(logger, "No sections were successfully processed")
            return jsonify({'error': 'No sections were successfully processed', 'details': errors}), 500

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

        logger.info(f"Created zip file: {zip_file_name}")
        log_api_response(logger, '/api/process-sections', 200, zip_file=zip_file_name, errors=errors)
        return jsonify({'zip_file': zip_file_name, 'errors': errors}), 200
    except Exception as e:
        log_error(logger, f"Error in process_sections: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    log_api_request(logger, f'/api/download/{filename}', 'GET')
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        log_api_response(logger, f'/api/download/{filename}', 200)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        log_error(logger, f"Error in download_file: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500