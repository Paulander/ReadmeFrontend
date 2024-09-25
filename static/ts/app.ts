document.addEventListener('DOMContentLoaded', () => {
    const repoForm = document.getElementById('repoForm') as HTMLFormElement;
    const repoList = document.getElementById('repoList') as HTMLDivElement;
    const repoSelect = document.getElementById('repoSelect') as HTMLSelectElement;
    const generateReadme = document.getElementById('generateReadme') as HTMLButtonElement;
    const previewReadme = document.getElementById('previewReadme') as HTMLButtonElement;
    const progressContainer = document.getElementById('progressContainer') as HTMLDivElement;
    const progressBar = document.getElementById('progressBar') as HTMLDivElement;
    const progressText = document.getElementById('progressText') as HTMLParagraphElement;
    const readmePreviewModal = document.getElementById('readmePreviewModal') as HTMLDivElement;
    const readmeContent = document.getElementById('readmeContent') as HTMLPreElement;
    const closePreviewModal = document.getElementById('closePreviewModal') as HTMLButtonElement;

    interface Repository {
        name: string;
        url: string;
    }

    let currentUsername = '';

    function showError(message: string): void {
        alert(message);
    }

    function validateUsername(username: string): boolean {
        return /^[a-zA-Z0-9-]+$/.test(username);
    }

    function validateFolderName(folderName: string): boolean {
        return /^[a-zA-Z0-9-_]+$/.test(folderName);
    }

    repoForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        currentUsername = usernameInput.value.trim();

        if (!validateUsername(currentUsername)) {
            showError('Invalid username. Please use only letters, numbers, and hyphens.');
            return;
        }

        try {
            const response = await fetch('/get_repositories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUsername }),
            });

            if (response.ok) {
                const repositories: Repository[] = await response.json();
                if (repositories.length === 0) {
                    showError('No repositories found for this user.');
                } else {
                    populateRepoSelect(repositories);
                    repoList.classList.remove('hidden');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error fetching repositories');
            }
        } catch (error) {
            showError(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    function populateRepoSelect(repositories: Repository[]): void {
        repoSelect.innerHTML = '<option value="">Select a repository</option>';
        repositories.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.name;
            option.textContent = repo.name;
            repoSelect.appendChild(option);
        });
    }

    previewReadme.addEventListener('click', async () => {
        const selectedRepo = repoSelect.value;
        const folderNameInput = document.getElementById('folderName') as HTMLInputElement;
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
            const response = await fetch('/preview_readme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUsername, repo_name: selectedRepo, folder_name: folderName }),
            });

            if (response.ok) {
                const result = await response.json();
                readmeContent.textContent = result.readme_content;
                readmePreviewModal.classList.remove('hidden');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to preview README');
            }
        } catch (error) {
            showError(`Error previewing README: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    closePreviewModal.addEventListener('click', () => {
        readmePreviewModal.classList.add('hidden');
    });

    generateReadme.addEventListener('click', async () => {
        const selectedRepo = repoSelect.value;
        const folderNameInput = document.getElementById('folderName') as HTMLInputElement;
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
        await generateReadmeContent(currentUsername, selectedRepo, folderName);
    });

    async function generateReadmeContent(username: string, repoName: string, folderName: string): Promise<void> {
        try {
            const response = await fetch('/generate_readme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, repo_name: repoName, folder_name: folderName }),
            });

            if (response.ok) {
                const result = await response.json();
                simulateProgress(() => {
                    alert('README generated successfully!');
                    console.log('README content:', result.readme_content);
                    // Here you can add logic to display or download the generated README
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate README');
            }
        } catch (error) {
            showError(`Error generating README: ${error instanceof Error ? error.message : String(error)}`);
            progressContainer.classList.add('hidden');
        }
    }

    function simulateProgress(onComplete: () => void): void {
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
