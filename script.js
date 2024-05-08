function toggleMenu(){
    const menu = document.querySelector(".menu-links"); // this targets an element of the webpage and stores it as a variable
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}