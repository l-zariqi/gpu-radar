document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("close-guide");
    const pageGuide = document.getElementById("page-guide");

    if (closeButton && pageGuide) {
        closeButton.addEventListener("click", function () {
            pageGuide.style.display = "none"; // Hide the page guide when the close button is clicked
        });
    }
});