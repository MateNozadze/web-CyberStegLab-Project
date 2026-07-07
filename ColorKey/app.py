import os
from dotenv import load_dotenv
from io import BytesIO
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from core import hide, reveal, hide_file, reveal_file
from urllib.parse import quote  

app = Flask(__name__)
CORS(app, expose_headers=["X-Color-Key", "X-PSNR", "X-Filename"])

ALLOWED_EXT = {"png", "jpg", "jpeg", "bmp", "tiff"}

load_dotenv()
API_KEY = os.getenv("API_KEY")

def check_api_key():
    """
    ამოწმებს, აქვს თუ არა მოთხოვნას სწორი API Key.
    გამოიყენება ყველა დაცულ Endpoint-ზე.
    """
    return request.headers.get("X-API-Key") == API_KEY

def allowed(filename):
    """
    ამოწმებს ფაილის გაფართოებას.
    აბრუნებს True-ს მხოლოდ იმ შემთხვევაში,
    თუ ფაილის ფორმატი მხარდაჭერილია.
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/hide", methods=["POST"])
def api_hide():
    if not check_api_key():
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "სურათი არ მოიძებნა"}), 400
    file     = request.files["image"]
    password = request.form.get("password", "")
    text     = request.form.get("text", "")
    
    if not password or not text:
        return jsonify({"error": "პაროლი და ტექსტი სავალდებულოა"}), 400
    if not allowed(file.filename):
        return jsonify({"error": "მხოლოდ PNG/JPG/BMP ფორმატია დაშვებული"}), 400
        
    input_bytes  = BytesIO(file.read())
    output_bytes = BytesIO()
    try:
        result = hide(input_bytes, text, password, output_bytes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    output_bytes.seek(0)
    response = send_file(output_bytes, mimetype="image/png", as_attachment=True, download_name="stego.png")
    response.headers["X-Color-Key"] = result["color_key_hex"]
    response.headers["X-PSNR"]      = str(result["psnr"])
    return response

@app.route("/api/reveal", methods=["POST"])
def api_reveal():
    if not check_api_key():
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "სურათი არ მოიძებნა"}), 400
    file          = request.files["image"]
    color_key_hex = request.form.get("password", "")
    
    if not color_key_hex:
        return jsonify({"error": "Color-Key სავალდებულოა"}), 400
    if not allowed(file.filename):
        return jsonify({"error": "მხოლოდ PNG/JPG/BMP ფორმატია დაშვებული"}), 400
        
    stego_bytes = BytesIO(file.read())
    try:
        if len(color_key_hex) != 64:
            return jsonify({"error": "Color-Key უნდა იყოს 64-სიმბოლოიანი hex"}), 400
        secret = reveal(stego_bytes, color_key_hex)
    except Exception as e:
        return jsonify({"error": f"ამოღება ვერ მოხერხდა: {str(e)}"}), 500
        
    return jsonify({"secret": secret})

@app.route("/api/hide-file", methods=["POST"])
def api_hide_file():
    if not check_api_key():
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files or "file" not in request.files:
        return jsonify({"error": "სურათი და ფაილი სავალდებულოა"}), 400
    image    = request.files["image"]
    file     = request.files["file"]
    password = request.form.get("password", "")
    
    if not password:
        return jsonify({"error": "პაროლი სავალდებულოა"}), 400
    if not allowed(image.filename):
        return jsonify({"error": "მხოლოდ PNG/JPG/BMP ფორმატია დაშვებული"}), 400
        
    input_bytes  = BytesIO(image.read())
    input_bytes.seek(0)
    output_bytes = BytesIO()
    file_bytes   = file.read()
    try:
        print("image size:", len(input_bytes.getvalue()))
        print("image position:", input_bytes.tell())
        result = hide_file(input_bytes, file_bytes, file.filename, password, output_bytes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    output_bytes.seek(0)
    response = send_file(output_bytes, mimetype="image/png", as_attachment=True, download_name="stego.png")
    response.headers["X-Color-Key"] = result["color_key_hex"]
    response.headers["X-PSNR"]      = str(result["psnr"])
    return response

@app.route("/api/reveal-file", methods=["POST"])
def api_reveal_file():
    if not check_api_key():
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "სურათი არ მოიძებნა"}), 400
    image         = request.files["image"]
    color_key_hex = request.form.get("password", "")
    
    if not color_key_hex:
        return jsonify({"error": "Color-Key სავალდებულოა"}), 400
    if not allowed(image.filename):
        return jsonify({"error": "მხოლოდ PNG/JPG/BMP ფორმატია დაშვებული"}), 400
        
    stego_bytes = BytesIO(image.read())
    try:
        if len(color_key_hex) != 64:
            return jsonify({"error": "Color-Key უნდა იყოს 64-სიმბოლოიანი hex"}), 400
        file_bytes, filename = reveal_file(stego_bytes, color_key_hex)
    except Exception as e:
        return jsonify({"error": f"ამოღება ვერ მოხერხდა: {str(e)}"}), 500
        
    output = BytesIO(file_bytes)
    output.seek(0)
    
    # შესწორებული ნაწილი ქართული ფაილის სახელის მხარდასაჭერად:
    response = send_file(output, as_attachment=True, download_name=filename)
    # ვიყენებთ UTF-8 მეთოდს Content-Disposition ჰედერში
    response.headers["Content-Disposition"] = f"attachment; filename*=UTF-8''{quote(filename)}"
    response.headers["X-Filename"] = quote(filename) # აქვე კოდირებული სახელი მიდის JavaScript-თან
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5050)