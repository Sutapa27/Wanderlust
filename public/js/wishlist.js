async function removeFromWishlist(event, listingId) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Removing from wishlist:", listingId);

  try {
    const response = await fetch(`/wishlist/remove/${listingId}`, {
      // ← Changed
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json(); // ← Parse JSON
    console.log("Remove response:", data);

    if (data.requiresLogin) {
      // ← Added
      sessionStorage.setItem("loginMessage", "You must be logged in");
      window.location.href = "/login";
      return;
    }

    if (data.success) {
      // ← Changed from response.ok
      console.log("Removed successfully from database");

      // Remove the card with animation
      const card = event.target.closest(".col");
      card.style.transition = "opacity 0.3s ease";
      card.style.opacity = "0";

      setTimeout(() => {
        card.remove();

        // Reload if no items left
        const remainingCards =
          document.querySelectorAll(".listing-card").length;
        if (remainingCards === 0) {
          location.reload();
        } else {
          // Update count
          const countText = document.querySelector(".wishlist-header p");
          const newCount = remainingCards;
          countText.textContent = `You have ${newCount} saved ${
            newCount === 1 ? "property" : "properties"
          }`;
        }
      }, 300);
    } else {
      alert(data.error || "Failed to remove from wishlist");
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    alert("Something went wrong. Please try again.");
  }
}
