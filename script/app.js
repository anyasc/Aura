// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../sw.js')
      .then(reg => console.log(`Service Worker registered ${reg}`))
      .catch(err => console.log(`Error: ${err}`));
  });
}



// Hamburguer
const hamburguer = document.querySelector(".hamburguer");
const sidebar = document.querySelector("#sidebar");
const sideClose = document.querySelector(".side-close");


hamburguer.addEventListener('click', sidebarToggle)
sideClose.addEventListener('click', sidebarToggle)

function sidebarToggle() {
  sidebar.classList.toggle('active');
  hamburguer.classList.toggle('active');
}
