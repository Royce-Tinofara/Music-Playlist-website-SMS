// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or use preferred color scheme
const savedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
body.classList.add(`${savedTheme}-mode`);
updateThemeIcon(savedTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    }
});

// Update theme toggle icon based on current theme
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// Set Spotify iframe theme based on current theme
function setSpotifyTheme() {
    const iframes = document.querySelectorAll('iframe[src*="spotify.com"]');
    iframes.forEach(iframe => {
        const src = iframe.src;
        if (body.classList.contains('dark-mode')) {
            iframe.src = src.includes('theme=0') ? src.replace('theme=0', 'theme=1') : 
                          src.includes('?') ? `${src}&theme=1` : `${src}?theme=1`;
        } else {
            iframe.src = src.includes('theme=1') ? src.replace('theme=1', 'theme=0') : 
                          src.includes('?') ? `${src}&theme=0` : `${src}?theme=0`;
        }
    });
}

// Call this function whenever theme changes
themeToggle.addEventListener('click', setSpotifyTheme);

// Initialize Spotify iframe themes on page load
setSpotifyTheme();