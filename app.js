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
