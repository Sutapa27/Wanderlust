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
    // Disable scroll hiding while typing
    window.removeEventListener('scroll', handleScroll);
  });

  // When user is done (keyboard closes)
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      searchBar.classList.remove('focused');
      // Re-enable scroll hiding
      window.addEventListener('scroll', handleScroll);
    }, 300);
  });
}

// Move scroll handler to a named function
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    searchBar.classList.add("hide");
  } else {
    searchBar.classList.remove("hide");
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

// Use the named function
window.addEventListener("scroll", handleScroll);
