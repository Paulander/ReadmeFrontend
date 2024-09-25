import requests
import os

def get_user_repositories(username):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)
    
    if response.status_code == 200:
        repos = response.json()
        return [{"name": repo["name"], "url": repo["html_url"]} for repo in repos]
    else:
        return []

def generate_readme(username, repo_name, folder_name):
    # In a real-world scenario, you would use the GitHub API to get repository details
    # and generate a README based on that information. For this example, we'll create a simple README.
    repo_url = f"https://github.com/{username}/{repo_name}"
    readme_content = f"""# {repo_name}

This is an automatically generated README for the repository {repo_name}.

## Repository Information
- Owner: {username}
- Repository: [{repo_name}]({repo_url})
- Folder: {folder_name}

## Description
Add your project description here.

## Installation
```
git clone {repo_url}
cd {repo_name}/{folder_name}
# Add installation steps here
```

## Usage
Add usage instructions here.

## Contributing
If you'd like to contribute to this project, please follow these steps:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
"""
    return readme_content
