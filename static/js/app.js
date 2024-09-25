"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    const repoForm = document.getElementById('repoForm');
    const repoList = document.getElementById('repoList');
    const repoSelect = document.getElementById('repoSelect');
    const generateReadme = document.getElementById('generateReadme');
    const previewReadme = document.getElementById('previewReadme');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const readmePreviewModal = document.getElementById('readmePreviewModal');
    const readmeContent = document.getElementById('readmeContent');
    const closePreviewModal = document.getElementById('closePreviewModal');
    let currentUsername = '';
    function showError(message) {
        alert(message);
    }
    function validateUsername(username) {
        return /^[a-zA-Z0-9-]+$/.test(username);
    }
    function validateFolderName(folderName) {
        return /^[a-zA-Z0-9-_]+$/.test(folderName);
    }
    repoForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        currentUsername = usernameInput.value.trim();
        if (!validateUsername(currentUsername)) {
            showError('Invalid username. Please use only letters, numbers, and hyphens.');
            return;
        }
        try {
            const response = yield fetch('/get_repositories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUsername }),
            });
            if (response.ok) {
                const repositories = yield response.json();
                if (repositories.length === 0) {
                    showError('No repositories found for this user.');
                }
                else {
                    populateRepoSelect(repositories);
                    repoList.classList.remove('hidden');
                }
            }
            else {
                const errorData = yield response.json();
                throw new Error(errorData.error || 'Error fetching repositories');
            }
        }
        catch (error) {
            showError(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }));
    function populateRepoSelect(repositories) {
        repoSelect.innerHTML = '<option value="">Select a repository</option>';
        repositories.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.name;
            option.textContent = repo.name;
            repoSelect.appendChild(option);
        });
    }
    previewReadme.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const selectedRepo = repoSelect.value;
        const folderNameInput = document.getElementById('folderName');
        const folderName = folderNameInput.value.trim();
        if (!selectedRepo) {
            showError('Please select a repository.');
            return;
        }
        if (!validateFolderName(folderName)) {
            showError('Invalid folder name. Please use only letters, numbers, hyphens, and underscores.');
            return;
        }
        try {
            const response = yield fetch('/preview_readme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUsername, repo_name: selectedRepo, folder_name: folderName }),
            });
            if (response.ok) {
                const result = yield response.json();
                readmeContent.textContent = result.readme_content;
                readmePreviewModal.classList.remove('hidden');
            }
            else {
                const errorData = yield response.json();
                throw new Error(errorData.error || 'Failed to preview README');
            }
        }
        catch (error) {
            showError(`Error previewing README: ${error instanceof Error ? error.message : String(error)}`);
        }
    }));
    closePreviewModal.addEventListener('click', () => {
        readmePreviewModal.classList.add('hidden');
    });
    generateReadme.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const selectedRepo = repoSelect.value;
        const folderNameInput = document.getElementById('folderName');
        const folderName = folderNameInput.value.trim();
        if (!selectedRepo) {
            showError('Please select a repository.');
            return;
        }
        if (!validateFolderName(folderName)) {
            showError('Invalid folder name. Please use only letters, numbers, hyphens, and underscores.');
            return;
        }
        progressContainer.classList.remove('hidden');
        yield generateReadmeContent(currentUsername, selectedRepo, folderName);
    }));
    function generateReadmeContent(username, repoName, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/generate_readme', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, repo_name: repoName, folder_name: folderName }),
                });
                if (response.ok) {
                    const result = yield response.json();
                    simulateProgress(() => {
                        alert('README generated successfully!');
                        console.log('README content:', result.readme_content);
                        // Here you can add logic to display or download the generated README
                    });
                }
                else {
                    const errorData = yield response.json();
                    throw new Error(errorData.error || 'Failed to generate README');
                }
            }
            catch (error) {
                showError(`Error generating README: ${error instanceof Error ? error.message : String(error)}`);
                progressContainer.classList.add('hidden');
            }
        });
    }
    function simulateProgress(onComplete) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                onComplete();
                progressContainer.classList.add('hidden');
            }
        }, 200);
    }
});
