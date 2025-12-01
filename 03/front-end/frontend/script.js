document.getElementById('convert-btn').addEventListener('click', async () => {
    const url = document.getElementById('youtube-url').value;
    const output = document.getElementById('markdown-output');
    const loading = document.getElementById('loading');

    if (!url) {
        alert('Please enter a YouTube URL.');
        return;
    }

    output.value = '';
    loading.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/video-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Failed to get video information.');
        }

        const data = await response.json();
        output.value = data.markdown;
    } catch (error) {
        output.value = `Error: ${error.message}`;
    } finally {
        loading.style.display = 'none';
    }
});
