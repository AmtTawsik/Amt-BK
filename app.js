const apiUrl = 'https://gutendex.com/books/';
let currentPage = 1;
let booksData = [];
searchQuery='';
let genreFilter = '';
const loadingSpinner = document.getElementById('loading-spinner');
const genreFilterSelect = document.getElementById('genre-filter');


const bookList = document.getElementById('book-list');
// Function to toggle the menu visibility
async function fetchBooks(page = 1) {
    try {
        showLoading();
        bookList.innerHTML = '';
        const response = await fetch(`${apiUrl}?page=${page}`);
        const data = await response.json();
        booksData = data.results;
        populateGenres();
        renderBooks();
    } catch (error) {
        console.error('Error fetching books:', error);
    } finally {
        hideLoading();
    }
}

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
                    ❤️
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
            const wishlistIcon = bookElement.querySelector('.wishlist-icon')
        });
}

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

// Show the loading spinner
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

// Hide the loading spinner
function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

fetchBooks()