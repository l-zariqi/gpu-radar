document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("close-guide");
    const pageGuide = document.getElementById("page-guide");

    if (closeButton && pageGuide) {
        closeButton.addEventListener("click", function () {
            pageGuide.style.transition = "opacity 0.5s ease";
            pageGuide.style.opacity = "0";
            setTimeout(function () {
                pageGuide.style.display = "none";
            }, 500);
        });
    }
});