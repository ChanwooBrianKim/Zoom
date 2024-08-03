export function setupFileSharing(socket) {
    const fileInput = document.getElementById('fileInput');
    const fileForm = document.getElementById('fileForm');

    fileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                socket.emit('file_shared', data.filePath);
        });
    });

    socket.on('file_shared', (filePath) => {
        const ul = document.querySelector('ul');
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = filePath;
        a.innerText = 'Shared file';
        a.target = '_blank';
        li.appendChild(a);
        ul.appendChild(li);
    })
}