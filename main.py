from flask import Flask, render_template, request, jsonify
from github_api import get_user_repositories, generate_readme
import os
import re

app = Flask(__name__)

def validate_username(username):
    return re.match(r'^[a-zA-Z0-9-]+$', username) is not None

def validate_folder_name(folder_name):
    return re.match(r'^[a-zA-Z0-9-_]+$', folder_name) is not None

# Very instructive comment
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_repositories", methods=["POST"])
def get_repositories():
    username = request.json.get("username")
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    if not validate_username(username):
        return jsonify({"error": "Invalid username format"}), 400

    try:
        repositories = get_user_repositories(username)
        if not repositories:
            return jsonify({"error": "No repositories found for this user"}), 404
        return jsonify(repositories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/preview_readme", methods=["POST"])
def preview_readme():
    data = request.json
    username = data.get("username")
    repo_name = data.get("repo_name")
    folder_name = data.get("folder_name")

    if not all([username, repo_name, folder_name]):
        return jsonify({"error": "Username, repository name, and folder name are required"}), 400

    if not validate_username(username):
        return jsonify({"error": "Invalid username format"}), 400

    if not validate_folder_name(folder_name):
        return jsonify({"error": "Invalid folder name format"}), 400

    try:
        readme_content = generate_readme(username, repo_name, folder_name)
        return jsonify({"success": True, "readme_content": readme_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate_readme", methods=["POST"])
def generate_readme_route():
    data = request.json
    username = data.get("username")
    repo_name = data.get("repo_name")
    folder_name = data.get("folder_name")

    if not all([username, repo_name, folder_name]):
        return jsonify({"error": "Username, repository name, and folder name are required"}), 400

    if not validate_username(username):
        return jsonify({"error": "Invalid username format"}), 400

    if not validate_folder_name(folder_name):
        return jsonify({"error": "Invalid folder name format"}), 400

    try:
        readme_content = generate_readme(username, repo_name, folder_name)
        return jsonify({"success": True, "readme_content": readme_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
