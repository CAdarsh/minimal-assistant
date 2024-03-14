import logging

# Setup logging
logging.basicConfig(filename='responses.log', level=logging.INFO, format='%(asctime)s, %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def log(question: str,ip_address: str, result: str, attempt: int=1):
    if result == 'Yes':
        logging.info(f'IP: {ip_address}, Question: {question}, Response: {result}, no_of_attempts: {attempt}')
    elif result == 'No':
        logging.info(f'IP: {ip_address}, Question: {question}, Response: {result}, no_of_attempts: {attempt}')
    elif attempt == "3":
        logging.info(f'IP: {ip_address}, Question: {question}, Response: {result}, no_of_attempts: {attempt}')