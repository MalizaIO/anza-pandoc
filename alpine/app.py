from flask import Flask, request, send_from_directory
import os
import subprocess

app = Flask(__name__)

@app.route('/', methods=['POST'])
def convert():
    input_file = request.files['file']
    input_filename = input_file.filename
    input_file.save(input_filename)

    output_filename = 'output.pdf'
    subprocess.run(['pandoc', input_filename, '-o', output_filename])

    return send_from_directory('.', output_filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
