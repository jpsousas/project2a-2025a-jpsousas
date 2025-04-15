const gitHubForm = document.getElementById('gitHubForm');
const dropdown = document.getElementById('repositoriesDropdown');
const ul = document.getElementById('userRepos');
let currentRepos = [];
let currentUsername = ''; 

gitHubForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('usernameInput');
    const gitHubUsername = usernameInput.value.trim();
    currentUsername = gitHubUsername;

    if (!gitHubUsername) return;

    fetch(`https://api.github.com/users/${gitHubUsername}/repos?per_page=100`)
        .then(response => response.json())
        .then(data => {
            ul.innerHTML = '';
            dropdown.innerHTML = '<option value="">Select a repository</option>';
            currentRepos = data;

            if (data.message === "Nao encontrado os dados") {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<p><strong>No account exists with username:</strong> ${gitHubUsername}</p>`;
                ul.appendChild(li);
                return;
            }

            data.forEach(repo => {
                // adiciona ao dropdown
                const option = document.createElement('option');
                option.value = repo.name;
                option.textContent = repo.name;
                dropdown.appendChild(option);

                // adiciona a lista
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                    <p><strong>Repo:</strong> ${repo.name}</p>
                    <p><strong>Description:</strong> ${repo.description || 'No description'}</p>
                    <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                `;
                ul.appendChild(li);
            });
        });
});

dropdown.addEventListener('change', (e) => {
    const selectedRepoName = e.target.value;
    ul.innerHTML = '';

    if (!selectedRepoName) {
        // se nenhuma opção estiver selecionada, reexibe todos
        currentRepos.forEach(repo => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `
                <p><strong>Repo:</strong> ${repo.name}</p>
                <p><strong>Description:</strong> ${repo.description || 'No description'}</p>
                <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
            `;
            ul.appendChild(li);
        });
        return;
    }

    // encontra o repositório selecionado na lista
    const selectedRepo = currentRepos.find(repo => repo.name === selectedRepoName);

    // exibe os dados do repositório
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `
        <p><strong>Nome repositorio:</strong> ${selectedRepo.name}</p>
        <p><strong>Descricao:</strong> ${selectedRepo.description || 'No description'}</p>
        <p><strong>URL:</strong> <a href="${selectedRepo.html_url}" target="_blank">${selectedRepo.html_url}</a></p>
        <div><strong>Commits:</strong>
            <ul id="commitsList" class="mt-2"></ul>
        </div>
    `;
    ul.appendChild(li);

    // busca os commits do repositório
    fetch(`https://api.github.com/repos/${currentUsername}/${selectedRepoName}/commits?per_page=100`)
        .then(response => response.json())
        .then(commits => {
            const commitsList = document.getElementById('commitsList');

            if (Array.isArray(commits)) {
                console.log(commits)
                commits.reverse().slice(0).forEach((commit, index) => {
                    const commitItem = document.createElement('li');
                    commitItem.textContent = `#${index+1} ${commit.commit.message} (${commit.commit.author.name})`;
                    commitsList.appendChild(commitItem);
                });
            } else {
                const commitItem = document.createElement('li');
                commitItem.textContent = 'Os commits nao foram encontrados';
                commitsList.appendChild(commitItem);
            }
        });
});
