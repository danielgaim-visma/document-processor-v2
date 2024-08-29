import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(log_level=logging.INFO):
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logger = logging.getLogger()
    logger.setLevel(log_level)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_format)

    file_handler = RotatingFileHandler(os.path.join(log_dir, 'app.log'), maxBytes=1024 * 1024, backupCount=10)
    file_handler.setLevel(log_level)
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    setup_file_processing_logger(log_dir)
    setup_api_logger(log_dir)

    return logger

def setup_file_processing_logger(log_dir):
    file_logger = logging.getLogger('file_processing')
    file_logger.setLevel(logging.DEBUG)
    file_handler = RotatingFileHandler(os.path.join(log_dir, 'file_processing.log'), maxBytes=1024 * 1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    file_logger.addHandler(file_handler)

def setup_api_logger(log_dir):
    api_logger = logging.getLogger('api')
    api_logger.setLevel(logging.INFO)
    file_handler = RotatingFileHandler(os.path.join(log_dir, 'api.log'), maxBytes=1024 * 1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    api_logger.addHandler(file_handler)

def log_function_call(logger, func_name, **kwargs):
    logger.debug(f"Called {func_name} with args: {kwargs}")

def log_api_request(logger, endpoint, method, **kwargs):
    logger.info(f"API Request: {method} {endpoint}, Args: {kwargs}")

def log_api_response(logger, endpoint, status_code, **kwargs):
    logger.info(f"API Response: {endpoint}, Status: {status_code}, Data: {kwargs}")

def log_error(logger, message, exc_info=False):
    logger.error(message, exc_info=exc_info)