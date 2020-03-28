const hamburguer = document.querySelector(".hamburguer");
const sidebar = document.querySelector("#sidebar");
const sideClose = document.querySelector(".side-close");

console.log(sidebar);

hamburguer.addEventListener('click', sidebarToggle)
sideClose.addEventListener('click', sidebarToggle)

function sidebarToggle() {
  sidebar.classList.toggle('active');
  hamburguer.classList.toggle('active');
}
