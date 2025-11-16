// API configuration
const TMDB_API_KEY = 'api_key=8d7b65a50297a047358025625a038920';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';

// GiftedTech API
const GIFTED_API_BASE = 'https://movieapi.giftedtech.co.ke/api';

// DOM Elements
const trendingContainer = document.getElementById('trending-movies');
const popularContainer = document.getElementById('popular-movies');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const modal = document.getElementById('movie-modal');
const closeModal = document.getElementById('close-modal');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalRuntime = document.getElementById('modal-runtime');
const modalRating = document.getElementById('modal-rating');
const modalOverview = document.getElementById('modal-overview');
const castList = document.getElementById('cast-list');
const playerModal = document.getElementById('player-modal');
const closePlayer = document.getElementById('close-player');
const movieVideo = document.getElementById('movie-video');
const playerTitle = document.getElementById('player-title');
const streamBtn = document.getElementById('stream-btn');
const downloadBtn = document.getElementById('download-btn');
const modalStreamBtn = document.getElementById('modal-stream-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');

// Current movie ID for streaming
let currentMovieId = null;

// Fetch trending movies
async function fetchTrendingMovies() {
    try {
        trendingContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i>Loading trending movies...</div>';
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?${TMDB_API_KEY}`);
        const data = await response.json();
        displayMovies(data.results, trendingContainer);
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        trendingContainer.innerHTML = '<div class="loading">Failed to load trending movies</div>';
    }
}

// Fetch popular movies
async function fetchPopularMovies() {
    try {
        popularContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i>Loading popular movies...</div>';
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?${TMDB_API_KEY}`);
        const data = await response.json();
        displayMovies(data.results, popularContainer);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        popularContainer.innerHTML = '<div class="loading">Failed to load popular movies</div>';
    }
}

// Fetch movies by search query
async function searchMovies(query) {
    try {
        if (!query.trim()) {
            fetchTrendingMovies();
            fetchPopularMovies();
            return;
        }
        
        // Show loading in both containers
        trendingContainer.innerHTML = '<div class="loading"><i class="fas fa-search"></i>Searching movies...</div>';
        popularContainer.innerHTML = '<div class="loading"><i class="fas fa-search"></i>Searching movies...</div>';
        
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?${TMDB_API_KEY}&query=${query}`);
        const data = await response.json();
        
        // Display results in both containers
        displayMovies(data.results, trendingContainer);
        displayMovies(data.results, popularContainer);
    } catch (error) {
        console.error('Error searching movies:', error);
        trendingContainer.innerHTML = '<div class="loading">Failed to search movies</div>';
        popularContainer.innerHTML = '<div class="loading">Failed to search movies</div>';
    }
}

// Display movies in container
function displayMovies(movies, container) {
    container.innerHTML = '';
    
    if (movies.length === 0) {
        container.innerHTML = '<div class="loading">No movies found</div>';
        return;
    }
    
    movies.slice(0, 12).forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://placehold.co/300x450?text=No+Image'}" 
                 alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                <div class="movie-rating">
                    <i class="fas fa-star"></i>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
                <div class="movie-genre">${movie.genre_ids ? getGenres(movie.genre_ids).join(', ') : 'N/A'}</div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => openMovieDetails(movie.id));
        container.appendChild(movieCard);
    });
}

// Get genre names from IDs
function getGenres(genreIds) {
    const genres = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Sci-Fi",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western"
    };
    
    return genreIds.map(id => genres[id]).filter(genre => genre);
}

// Open movie details modal
async function openMovieDetails(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?${TMDB_API_KEY}&append_to_response=credits`);
        const movie = await response.json();
        
        modalPoster.src = movie.poster_path ? IMG_URL + movie.poster_path : 'https://placehold.co/300x450?text=No+Image';
        modalTitle.textContent = movie.title;
        modalYear.textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        modalRuntime.textContent = movie.runtime ? `${movie.runtime} min` : 'N/A';
        modalRating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        modalOverview.textContent = movie.overview || 'No overview available.';
        
        // Store movie ID for streaming/download
        currentMovieId = movie.id;
        
        // Display cast
        castList.innerHTML = '';
        if (movie.credits && movie.credits.cast) {
            movie.credits.cast.slice(0, 10).forEach(person => {
                const castItem = document.createElement('div');
                castItem.className = 'cast-item';
                castItem.innerHTML = `
                    <img src="${person.profile_path ? IMG_URL + person.profile_path : 'https://placehold.co/80x80?text=NA'}" 
                         alt="${person.name}" class="cast-image">
                    <div>${person.name}</div>
                    <div>${person.character}</div>
                `;
                castList.appendChild(castItem);
            });
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Failed to load movie details');
    }
}

// Close modal
function closeMovieModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Open video player with movie from API
async function openPlayer(movieTitle) {
    try {
        // Check if we have a current movie ID
        if (!currentMovieId) {
            alert('No movie selected for streaming');
            return;
        }
        
        // Show loading state
        playerTitle.textContent = 'Loading...';
        movieVideo.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i>Loading video...</div>';
        
        // Fetch streaming URL from GiftedTech API
        const response = await fetch(`${GIFTED_API_BASE}/sources/${currentMovieId}`);
        const data = await response.json();
        
        if (data && data.url) {
            // Set the video source to the streaming URL
            playerTitle.textContent = movieTitle;
            movieVideo.src = data.url;
            movieVideo.load();
            movieVideo.play();
        } else {
            alert('Streaming URL not available for this movie');
        }
        
        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading video:', error);
        alert('Failed to load video stream');
    }
}

// Close video player
function closePlayerModal() {
    playerModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    movieVideo.pause();
    movieVideo.src = ''; // Clear the video source
}

// Download movie from API
async function downloadMovie() {
    try {
        // Check if we have a current movie ID
        if (!currentMovieId) {
            alert('No movie selected for download');
            return;
        }
        
        // Fetch download URL from GiftedTech API
        const response = await fetch(`${GIFTED_API_BASE}/sources/${currentMovieId}`);
        const data = await response.json();
        
        if (data && data.url) {
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = data.url;
            link.download = `${modalTitle.textContent}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Download started! Check your downloads folder.');
        } else {
            alert('Download URL not available for this movie');
        }
    } catch (error) {
        console.error('Error downloading movie:', error);
        alert('Failed to start download');
    }
}

// Event listeners
searchButton.addEventListener('click', () => {
    searchMovies(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies(searchInput.value);
    }
});

closeModal.addEventListener('click', closeMovieModal);

// Close modal when clicking outside content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeMovieModal();
    }
});

// Stream and download buttons in modal
modalStreamBtn.addEventListener('click', () => {
    openPlayer(modalTitle.textContent);
});

modalDownloadBtn.addEventListener('click', () => {
    downloadMovie();
});

// Stream and download buttons in hero section
streamBtn.addEventListener('click', () => {
    if (currentMovieId) {
        openPlayer(modalTitle.textContent);
    } else {
        alert('Please select a movie first');
    }
});

downloadBtn.addEventListener('click', () => {
    if (currentMovieId) {
        downloadMovie();
    } else {
        alert('Please select a movie first');
    }
});

// Player controls
closePlayer.addEventListener('click', closePlayerModal);

// Initialize the app
fetchTrendingMovies();
fetchPopularMovies(); 
