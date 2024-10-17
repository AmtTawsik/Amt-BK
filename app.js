const apiUrl = 'https://gutendex.com/books/';
let currentPage = 1;
let searchQuery = localStorage.getItem('searchQuery') || ''; // Load search query from localStorage
let genreFilter = localStorage.getItem('genreFilter') || ''; // Load genre filter from localStorage
let booksData = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Elements for the main library
const bookList = document.getElementById('book-list');
const searchBar = document.getElementById('search-bar');
const genreFilterSelect = document.getElementById('genre-filter');
const pagination = document.getElementById('pagination');
const loadingSpinner = document.getElementById('loading-spinner');

// Elements for the wishlist page
const wishlistContainer = document.getElementById('wishlist');

// Function to check if we're on the wishlist page
function isWishlistPage() {
    return document.body.contains(wishlistContainer);
}

// Fetch books and render for the main library
async function fetchBooks(page = 1) {
    try {
        showLoading();
        bookList.innerHTML = '';
        const response = await fetch(`${apiUrl}?page=${page}`);
        const data = await response.json();
        booksData = data.results;
        populateGenres();
        renderBooks();
        renderPagination(data.count);
    } catch (error) {
        console.error('Error fetching books:', error);
    } finally {
        hideLoading();
    }
}

// Fetch books for the wishlist page
async function fetchWishlistBooks() {
    // Get the wishlist from localStorage and parse it
    wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length <= 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    try {
        showLoading();
        wishlistContainer.innerHTML = ''; // Clear the container before rendering

        // Fetch all books in parallel using Promise.all
        const bookPromises = wishlist.map(bookId => fetch(`${apiUrl}${bookId}`).then(response => response.json()));
        
        const booksData = await Promise.all(bookPromises);
        
        renderWishlistBooks(booksData);
    } catch (error) {
        console.error('Error fetching wishlist books:', error);
        wishlistContainer.innerHTML = '<p>There was an error fetching your wishlist. Please try again later.</p>';
    } finally {
        hideLoading();
    }
}



// Render books for the main library
function renderBooks() {
    bookList.innerHTML = '';
    booksData
        .filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(book => !genreFilter || book.subjects.some(subject => subject.includes(genreFilter)))
        .forEach((book, index) => {
            const genres = book.subjects.join(', ') || 'Unknown Genre'; // Get the genres or set a default value
            const bookId = book.id; // Get the book ID
            
            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';
            bookElement.innerHTML = `
                <img src="${book.formats['image/jpeg']}" alt="${book.title}" class="book-cover">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">Author: ${book.authors[0]?.name || 'Unknown Author'}</p>
                <p class="book-genres">Genres: ${genres}</p>
                <p class="book-id">ID: ${bookId}</p>
                <span class="wishlist-icon" data-id="${book.id}">
                    ${wishlist.includes(parseInt(book.id)) ? '❤️' : '🤍'}
                </span>
                <button class="view-details-button" data-id="${book.id}">View Details</button>
            `;
            bookList.appendChild(bookElement);

            // Delay adding the 'visible' class to trigger animation
            setTimeout(() => {
                bookElement.classList.add('visible');
            }, index * 100); // Stagger effect for each book

            // Navigate to the book details page when the button is clicked
            const viewDetailsButton = bookElement.querySelector('.view-details-button');
            viewDetailsButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the click from triggering the book item click event
                window.location.href = `book-details.html?id=${book.id}`;
            });

            // Add event listener to wishlist icon
            const wishlistIcon = bookElement.querySelector('.wishlist-icon');
            wishlistIcon.addEventListener('click', toggleWishlist);
        });
}

// Render books for the wishlist
function renderWishlistBooks(wishlistBooks) {
    if (wishlistBooks.length === 0) {
        wishlistContainer.innerHTML = '<p>No books found in your wishlist.</p>';
        return;
    }

    wishlistBooks.forEach(book => {
        console.log('working')
        const bookElement = document.createElement('div');
        bookElement.className = 'book-item';
        const coverImage = book.formats ? book.formats['image/jpeg'] : 'default-cover.jpg'; // Use a default image if not available
        const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';

        bookElement.innerHTML = `
            <img src="${coverImage}" alt="${book.title}" class="book-cover">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${authorName}</p>
            <a href="book-details.html?id=${book.id}" class="view-details-button">View Details</a>
        `;
        wishlistContainer.appendChild(bookElement);
    });
}



// Show the loading spinner
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

// Hide the loading spinner
function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

// Populate genres dynamically
function populateGenres() {
    const allSubjects = new Set();
    
    booksData.forEach(book => {
        book.subjects.forEach(subject => allSubjects.add(subject));
    });

    genreFilterSelect.innerHTML = '<option value="">All Genres</option>';

    allSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        genreFilterSelect.appendChild(option);
    });

    // Set the selected genre based on saved value
    genreFilterSelect.value = genreFilter;
}

// Render pagination
function renderPagination(totalCount) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalCount / 30);
    if (currentPage > 1) {
        pagination.innerHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
}

// Change page
function changePage(page) {
    if (page !== currentPage) {
        currentPage = page;
        fetchBooks(currentPage);
    }
}

// Toggle wishlist
function toggleWishlist(event) {
    event.stopPropagation(); // Prevent click event from bubbling up
    const icon = event.target; // Get the clicked icon
    const bookId = parseInt(icon.getAttribute('data-id')); // Convert the book ID to a number

    // Check if the book is already in the wishlist
    if (wishlist.includes(bookId)) {
        // Remove from wishlist
        wishlist = wishlist.filter(id => id !== bookId);
        icon.innerHTML = '🤍'; // Change icon to unliked state
    } else {
        // Add to wishlist
        wishlist.push(bookId);
        icon.innerHTML = '❤️'; // Change icon to liked state
    }

    // Save the updated wishlist to local storage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}


// Fetch and render book details based on ID
async function fetchBookDetails(bookId) {
    try {
        showLoading();
        const response = await fetch(`${apiUrl}${bookId}`);
        const book = await response.json();
        renderBookDetails(book);
    } catch (error) {
        console.error('Error fetching book details:', error);
        document.getElementById('book-details').innerHTML = '<p>Error loading book details. Please try again later.</p>';
    } finally {
        hideLoading();
    }
}

// Render the book details
function renderBookDetails(book) {
    showLoading()
    const bookDetailsContainer = document.getElementById('book-details');
    bookDetailsContainer.innerHTML = `
        <div class="book-details">
            <img src="${book.formats['image/jpeg']}" alt="${book.title}" class="book-cover">
            <h2 class="book-title">${book.title}</h2>
            <p class="book-author">Author: ${book.authors[0]?.name || 'Unknown Author'}</p>
            <p class="book-subjects">Subjects: ${book.subjects.join(', ')}</p>
            <p class="book-languages">Languages: ${book.languages.join(', ')}</p>
            <p class="book-copyright">Copyright: ${book.copyright ? 'Yes' : 'No'}</p>
            <a href="${book.formats['text/html']}" target="_blank" class="read-book">Read Book</a>
        </div>
    `;
    hideLoading()
}

// Initialize based on the page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        fetchBookDetails(bookId);
    } else if (isWishlistPage()) {
        fetchWishlistBooks();
    } else {
        fetchBooks();
        setupEventListeners();
        searchBar.value = searchQuery; // Set search input value
    }
});

// Setup event listeners for the main library
function setupEventListeners() {
    searchBar.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        localStorage.setItem('searchQuery', searchQuery); // Save search query to localStorage
        renderBooks();
    });

    genreFilterSelect.addEventListener('change', (e) => {
        genreFilter = e.target.value;
        localStorage.setItem('genreFilter', genreFilter); // Save genre filter to localStorage
        renderBooks();
    });
}

// Function to toggle the menu visibility
function toggleMenu() {
    const menu = document.getElementById('menu'); // The menu container
    menu.classList.toggle('active'); // Toggle the 'active' class to show/hide the menu
}

// Menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
});
