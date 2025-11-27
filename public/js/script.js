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
let lastScrollTop = 0;
const searchBar = document.getElementById("mobile-search-bar");
const searchInput = searchBar ? searchBar.querySelector('input[type="search"]') : null;
let isTyping = false;

if (searchInput) {
  // When user focuses on input (keyboard opens)
  searchInput.addEventListener('focus', () => {
    isTyping = true;
    searchBar.classList.add('focused');
    searchBar.classList.remove('hide'); // Force show when focused
  });

  // When user is typing
  searchInput.addEventListener('input', () => {
    isTyping = true;
    searchBar.classList.remove('hide'); // Keep visible while typing
  });

  // When user is done (keyboard closes)
  searchInput.addEventListener('blur', () => {
    isTyping = false;
    searchBar.classList.remove('focused');
  });
}

window.addEventListener("scroll", function () {
  // Don't hide search bar if user is typing
  if (isTyping) {
    return;
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop) {
    searchBar.classList.add("hide");
  } else {
    searchBar.classList.remove("hide");
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});