document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("close-guide");
    const pageGuide = document.getElementById("page-guide");
    const toggleButton = document.getElementById("toggle-guide");

    if (toggleButton && pageGuide) {
        toggleButton.addEventListener("click", function () {
            if (pageGuide.style.display === "block") {
                pageGuide.style.transition = "opacity 0.5s ease";
                pageGuide.style.opacity = "0";
                setTimeout(function () {
                    pageGuide.style.display = "none";
                }, 500);
            } else {
                pageGuide.style.display = "block";
                pageGuide.style.opacity = "0";
                pageGuide.style.transition = "opacity 0.5s ease";
                setTimeout(function () {
                    pageGuide.style.opacity = "1";
                }, 10);
            }
        });
    }
});
