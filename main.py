import base64
from flask import Flask, request, jsonify, render_template
import vertexai
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models

app = Flask(__name__)

vertexai.init(project="test-data-studio-365519", location="us-central1")
model = GenerativeModel("gemini-1.5-pro-001")

generation_config = {
    "max_output_tokens": 8192,
    "temperature": 1,
    "top_p": 0.95,
}

safety_settings = {
    generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

# Flask Route
@app.route('/generate', methods=['POST'])
def generate_response():
    try:
        user_prompt = request.json.get('prompt', [])

        responses = model.generate_content(
            user_prompt, 
            generation_config=generation_config,
            safety_settings=safety_settings,
            stream=True,
        )
        
        full_response = ""
        for response in responses:
            full_response += response.text
        print("Response generated. Sending..")
        return jsonify({"response": full_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Flask Routes
@app.route("/")
def index():
    return render_template("index.html")  # No need to pass terraform_examples

if __name__ == '__main__':
    app.run(debug=True, port=8080) 
