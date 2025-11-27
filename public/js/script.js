// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// --- Sticky Bottom Search Bar Visibility ---
// Floating search bar show/hide on scroll
let lastScrollTop = 0;
const searchBar = document.getElementById("mobile-search-bar");

// Handle keyboard pop-up on mobile
const searchInput = searchBar ? searchBar.querySelector('input[type="search"]') : null;

if (searchInput) {
  // When user focuses on input (keyboard opens)
  searchInput.addEventListener('focus', () => {
    searchBar.classList.add('focused');
  });

  // When user is done (keyboard closes)
  searchInput.addEventListener('blur', () => {
    searchBar.classList.remove('focused');
  });
}

let hasScrolled = false;

window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Mark that the user has scrolled at least once
  if (!hasScrolled) hasScrolled = true;

  // Only hide/show AFTER first scroll
  if (hasScrolled) {
    if (scrollTop > lastScrollTop) {
      searchBar.classList.add("hide");
    } else {
      searchBar.classList.remove("hide");
    }
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

