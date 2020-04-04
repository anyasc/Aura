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
const index = document.querySelector("#index")
const config = document.querySelector("#config")

const hamburguerIndex = document.querySelector("#hamburguer-index");
const hamburguerConfig = document.querySelector("#hamburguer-config");


hamburguerIndex.addEventListener('click', openConfig)
hamburguerConfig.addEventListener('click', openConfig)

function openConfig() {
  index.classList.toggle('inactive');
  config.classList.toggle('inactive');
}

function sidebarToggle() {
  sidebar.classList.toggle('active');
  hamburguer.classList.toggle('active');
}
