// TeraBox Video Downloader and Viewer
class TeraBoxHandler {
    constructor() {
        // Base API endpoint (using a known third-party service)
        this.apiBaseUrl = 'https://ashlynn.serv00.net/Ashlynnterabox.php';
        this.videoPlayer = null;
    }

    // Function to validate TeraBox URL
    isValidTeraBoxUrl(url) {
        return url.includes('terabox.com') || url.includes('terabox.app');
    }

    // Function to fetch download link from API
    async getDownloadLink(teraboxUrl) {
        try {
            if (!this.isValidTeraBoxUrl(teraboxUrl)) {
                throw new Error('Invalid TeraBox URL');
            }

            const response = await fetch(`${this.apiBaseUrl}?url=${encodeURIComponent(teraboxUrl)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.directLink || data.url; // Adjust based on actual API response structure
        } catch (error) {
            console.error('Error fetching download link:', error);
            throw error;
        }
    }

    // Function to download video
    async downloadVideo(teraboxUrl, filename = 'terabox-video.mp4') {
        try {
            const downloadUrl = await this.getDownloadLink(teraboxUrl);
            
            // Create temporary link for download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return true;
        } catch (error) {
            console.error('Download failed:', error);
            return false;
        }
    }

    // Function to create and display video player
    viewVideo(teraboxUrl) {
        try {
            // Remove existing player if any
            if (this.videoPlayer) {
                this.videoPlayer.remove();
            }

            // Create video element
            this.videoPlayer = document.createElement('video');
            this.videoPlayer.controls = true;
            this.videoPlayer.style.maxWidth = '100%';
            this.videoPlayer.style.margin = '20px auto';
            this.videoPlayer.style.display = 'block';

            // Get download link and set as source
            this.getDownloadLink(teraboxUrl)
                .then(url => {
                    this.videoPlayer.src = url;
                    document.body.appendChild(this.videoPlayer);
                    this.videoPlayer.play();
                })
                .catch(error => {
                    console.error('Error loading video:', error);
                    this.showError('Failed to load video');
                });
        } catch (error) {
            console.error('Viewer error:', error);
            this.showError('Error initializing video player');
        }
    }

    // Helper function to show error messages
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.margin = '10px';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Example usage with HTML interface
const terabox = new TeraBoxHandler();

document.addEventListener('DOMContentLoaded', () => {
    // Create simple UI
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.innerHTML = `
        <h2>TeraBox Video Downloader & Viewer</h2>
        <input type="text" id="videoUrl" placeholder="Enter TeraBox URL" style="width: 300px; padding: 5px;">
        <button id="downloadBtn" style="padding: 5px 10px; margin: 0 5px;">Download</button>
        <button id="viewBtn" style="padding: 5px 10px;">View</button>
    `;
    document.body.appendChild(container);

    // Add event listeners
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const url = document.getElementById('videoUrl').value;
        terabox.downloadVideo(url);
    });

    document.getElementById('viewBtn').addEventListener('click', () => {
        const url = document.getElementById('videoUrl').value;
        terabox.viewVideo(url);
    });
});
