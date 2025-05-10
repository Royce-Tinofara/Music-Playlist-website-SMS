document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const backToTopButton = document.getElementById('back-to-top');

    // --- Theme Management ---
    // Function to apply theme and save preference
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        }
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        setSpotifyEmbedThemes(theme);
    }

    // Update theme toggle icon based on current theme
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            themeToggle.setAttribute('aria-label', 'Toggle light mode');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        }
    }

    // Set Spotify iframe themes
    function setSpotifyEmbedThemes(theme) {
        const iframes = document.querySelectorAll('iframe[src*="open.spotify.com/embed"]');
        const spotifyThemeValue = (theme === 'dark') ? '1' : '0'; // 0 for light, 1 for dark

        iframes.forEach(iframe => {
            let currentSrc = iframe.src;
            // Remove existing theme parameter if present
            currentSrc = currentSrc.replace(/&theme=[01]/, '').replace(/\?theme=[01](&)?/, '?');

            // Add the new theme parameter
            if (currentSrc.includes('?')) {
                // If other parameters exist (like utm_source)
                if (currentSrc.endsWith('?')) {
                     currentSrc += `theme=${spotifyThemeValue}`;
                } else {
                    currentSrc += `&theme=${spotifyThemeValue}`;
                }
            } else {
                currentSrc += `?theme=${spotifyThemeValue}`;
            }
            
            // Only reload iframe if src actually changed to prevent unnecessary reloads
            if (iframe.src !== currentSrc) {
                iframe.src = currentSrc;
            }
        });
    }

    // Initialize theme
    // Prefers localStorage, then system preference, then defaults to light
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(currentTheme); // Apply initial theme

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(newTheme);
    });


    // --- Back to Top Button Functionality ---
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Show button after scrolling 300px
            if(backToTopButton) backToTopButton.style.display = "flex";
        } else {
            if(backToTopButton) backToTopButton.style.display = "none";
        }
    });

    if(backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initial call to set Spotify themes on page load, after a slight delay for iframes to register
    // This is sometimes needed if iframes are loaded lazily or script runs too fast.
    setTimeout(() => {
        setSpotifyEmbedThemes(body.classList.contains('dark-mode') ? 'dark' : 'light');
    }, 100); 

});
// Add this to your existing script.js
function handleMobileFeatures() {
    // Detect if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Disable video autoplay on mobile (many mobile browsers block it anyway)
        const videoBg = document.getElementById('video-background');
        if (videoBg) {
            videoBg.removeAttribute('autoplay');
            videoBg.pause();
        }
        
        // Add touch-specific hover effects
        document.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 200);
            });
        });
    }
}

// Call this function in your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Your existing code...
    handleMobileFeatures();
});
document.addEventListener('DOMContentLoaded', () => {
    // Store all audio iframes
    const audioIframes = document.querySelectorAll('.track-info iframe');
    let currentlyPlayingIframe = null;

    // Function to pause all iframes except the current one
    function pauseOtherIframes(currentIframe) {
        audioIframes.forEach(iframe => {
            if (iframe !== currentIframe && iframe.contentWindow) {
                // Different methods for different providers
                try {
                    // Spotify
                    if (iframe.src.includes('spotify.com')) {
                        iframe.contentWindow.postMessage({command: 'pause'}, 'https://open.spotify.com');
                    }
                    // Apple Music
                    else if (iframe.src.includes('music.apple.com')) {
                        iframe.contentWindow.postMessage({action: 'pause'}, 'https://embed.music.apple.com');
                    }
                    // Other providers (Audiomack, Deezer, etc.)
                    else {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const audioElements = iframeDoc.querySelectorAll('audio, video');
                        audioElements.forEach(audio => audio.pause());
                    }
                } catch (e) {
                    console.log('Could not control iframe:', e);
                }
            }
        });
    }

    // Listen for play events on all iframes
    audioIframes.forEach(iframe => {
        // Add click handler to track cards
        iframe.closest('.track-card').addEventListener('click', () => {
            if (currentlyPlayingIframe === iframe) {
                currentlyPlayingIframe = null;
            } else {
                currentlyPlayingIframe = iframe;
                pauseOtherIframes(iframe);
            }
        });

        // Listen for messages from iframes (for providers that support it)
        window.addEventListener('message', (e) => {
            // Spotify play events
            if (e.origin === 'https://open.spotify.com' && e.data.type === 'playback_update') {
                if (e.data.data.isPlaying) {
                    currentlyPlayingIframe = iframe;
                    pauseOtherIframes(iframe);
                }
            }
            // Apple Music play events
            else if (e.origin === 'https://embed.music.apple.com' && e.data.action === 'play') {
                currentlyPlayingIframe = iframe;
                pauseOtherIframes(iframe);
            }
        });
    });

    // Periodically check for playing state (fallback)
    setInterval(() => {
        audioIframes.forEach(iframe => {
            try {
                // This works for some embedded players
                if (iframe.contentWindow && iframe.contentWindow.document.querySelector('audio:playing, video:playing')) {
                    if (iframe !== currentlyPlayingIframe) {
                        currentlyPlayingIframe = iframe;
                        pauseOtherIframes(iframe);
                    }
                }
            } catch (e) {
                // Cross-origin restrictions may prevent this
            }
        });
    }, 1000);
});