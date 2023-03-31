from flask import Flask, request, send_from_directory, abort
import os
import subprocess
import tempfile

app = Flask(__name__)

@app.route('/', methods=['POST'])
def convert():
    input_file = request.files.get('file')
    if input_file is None:
        abort(400, "No file found in the request")

    input_format = request.form.get('input_format')
    if input_format is None:
        abort(400, "No input format specified")

    output_format = request.form.get('output_format')
    if output_format is None:
        abort(400, "No output format specified")

    input_filename = input_file.filename
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(input_filename)[1], delete=False) as temp_input_file:
        input_file.save(temp_input_file.name)
        output_filename = f'output.{output_format}'
        try:
            subprocess.run(['pandoc', '-f', input_format, '-t', output_format, temp_input_file.name, '-o', output_filename], check=True)
        except subprocess.CalledProcessError as e:
            os.remove(temp_input_file.name)
            abort(500, f"Pandoc conversion failed: {e}")

    os.remove(temp_input_file.name)
    return send_from_directory('.', output_filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
