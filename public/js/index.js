// public/js/listings-index.js

document.addEventListener("DOMContentLoaded", () => {
  const welcomeModal = new bootstrap.Modal(
    document.getElementById("welcomeModal")
  );
  if (!sessionStorage.getItem("welcomeModalShown")) {
    welcomeModal.show();
    sessionStorage.setItem("welcomeModalShown", "true");
  }

  loadUserWishlist();
});

// Tax Switch
let taxSwitch = document.getElementById("switchCheckDefault");
taxSwitch.addEventListener("click", () => {
  let prices = document.getElementsByClassName("listing-price");
  let taxInfo = document.getElementsByClassName("tax-info");

  for (let i = 0; i < prices.length; i++) {
    let priceElement = prices[i];
    let taxElement = taxInfo[i];
    let basePrice = parseFloat(priceElement.dataset.basePrice);

    if (taxSwitch.checked) {
      let totalPrice = (basePrice * 1.18).toLocaleString("en-IN");
      priceElement.textContent = totalPrice;
      taxElement.style.display = "inline";
    } else {
      priceElement.textContent = basePrice.toLocaleString("en-IN");
      taxElement.style.display = "none";
    }
  }
});

// Wishlist Functions
async function toggleWishlist(event, listingId) {
  event.preventDefault();
  event.stopPropagation();

  const btn = event.currentTarget;
  const icon = btn.querySelector("i");
  const isWishlisted = icon.classList.contains("fa-solid");

  try {
    if (isWishlisted) {
      const response = await fetch(`/wishlist/remove/${listingId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        btn.classList.remove("active");
      } else if (data.requiresLogin) {
        window.location.href = "/login";
      }
    } else {
      const response = await fetch(`/wishlist/add/${listingId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        btn.classList.add("active");
      } else if (data.requiresLogin) {
        window.location.href = "/login";
      }
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
  }
}

async function loadUserWishlist() {
  try {
    const response = await fetch("/wishlist/api/ids");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.wishlist && data.wishlist.length > 0) {
      data.wishlist.forEach((listingId) => {
        const btn = document.querySelector(`[data-listing-id="${listingId}"]`);
        if (btn) {
          const icon = btn.querySelector("i");
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
          btn.classList.add("active");
        }
      });
    }
  } catch (error) {
    console.error("Error loading wishlist:", error);
  }
}
