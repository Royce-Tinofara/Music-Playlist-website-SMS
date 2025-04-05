// Simple JavaScript for play buttons
document.querySelectorAll('.play-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.track-card');
        const title = card.querySelector('.track-title').textContent;
        const artist = card.querySelector('.track-artist').textContent;
        const imgSrc = card.querySelector('.track-cover').src;
        
        // Update player bar
        document.querySelector('.player-title').textContent = title;
        document.querySelector('.player-artist').textContent = artist;
        document.querySelector('.player-cover').src = imgSrc;
        
        // Change play button to pause
        const playPauseBtn = document.querySelector('.play-pause-btn i');
        playPauseBtn.classList.remove('fa-play');
        playPauseBtn.classList.add('fa-pause');
        
        // Scroll to player bar
        document.querySelector('.player-bar').scrollIntoView({ behavior: 'smooth' });
    });
});

// Play/pause button functionality
document.querySelector('.play-pause-btn').addEventListener('click', function() {
    const icon = this.querySelector('i');
    if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
});

// Progress bar click functionality
document.querySelector('.progress-bar').addEventListener('click', function(e) {
    const progressBar = this;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.clientWidth;
    const percentageClicked = (clickPosition / progressBarWidth) * 100;
    
    document.querySelector('.progress').style.width = percentageClicked + '%';
    
    // Update time display (this is just a visual demo)
    const totalTime = 3 * 60 + 45; // 3:45 in seconds
    const newTime = Math.floor((percentageClicked / 100) * totalTime);
    const minutes = Math.floor(newTime / 60);
    const seconds = newTime % 60;
    document.querySelector('.time:first-child').textContent = 
        `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
});

// Volume control (simple mute toggle)
document.querySelector('.player-progress .control-btn:last-child').addEventListener('click', function() {
    const icon = this.querySelector('i');
    if (icon.classList.contains('fa-volume-up')) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    }
});