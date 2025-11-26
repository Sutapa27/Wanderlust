// Check wishlist status on page load
async function checkWishlistStatus() {
  try {
    const response = await fetch("/wishlist/api/ids");
    const data = await response.json();
    const wishlistIds = data.wishlist.map((id) => id.toString());

    const btn = document.querySelector(".wishlist-btn-show");
    if (!btn) return;

    const listingId = btn.dataset.listingId;
    const heartIcon = btn.querySelector(".heart-icon");

    if (wishlistIds.includes(listingId)) {
      heartIcon.classList.remove("fa-regular");
      heartIcon.classList.add("fa-solid");
    } else {
      heartIcon.classList.remove("fa-solid");
      heartIcon.classList.add("fa-regular");
    }
  } catch (err) {
    console.error("Error checking wishlist:", err);
  }
}

// Toggle wishlist
async function toggleWishlist(listingId, heartIcon) {
  try {
    const isWishlisted = heartIcon.classList.contains("fa-solid");

    if (isWishlisted) {
      const response = await fetch(`/wishlist/remove/${listingId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        heartIcon.classList.remove("fa-solid");
        heartIcon.classList.add("fa-regular");
      } else if (data.requiresLogin) {
        window.location.href = "/login";
      }
    } else {
      const response = await fetch(`/wishlist/add/${listingId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid");
      } else if (data.requiresLogin) {
        window.location.href = "/login";
      }
    }
  } catch (err) {
    console.error("Error toggling wishlist:", err);
  }
}

// Add event listener
document.addEventListener("DOMContentLoaded", () => {
  checkWishlistStatus();

  const btn = document.querySelector(".wishlist-btn-show");
  if (btn) {
    btn.addEventListener("click", () => {
      const listingId = btn.dataset.listingId;
      const heartIcon = btn.querySelector(".heart-icon");
      toggleWishlist(listingId, heartIcon);
    });
  }
});
