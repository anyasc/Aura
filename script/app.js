// Window Load Event
const tempMax = document.querySelector("#tempMax");
const tempMin = document.querySelector("#tempMin");
const semana = ["Domingo", "Segunda-feira", "Terça-Feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const semanaAbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const mes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

window.addEventListener("load", function() {
  let today = new Date();
  document.querySelector("#hoje").innerText = semana[today.getDay()]
  document.querySelector("#diacompleto").innerText = semana[today.getDay()] + ", " + today.getDate() + " de " + mes[today.getMonth()].toLowerCase() + " de " + today.getFullYear();
  document.querySelector("#amanha").innerText = semanaAbr[today.getDay()+1]
  document.querySelector("#da").innerText = semanaAbr[today.getDay()+2]
  document.querySelector("#dda").innerText = semanaAbr[today.getDay()+3]
  document.querySelector("#ddda").innerText = semanaAbr[today.getDay()+4]
  updateAPI();
});


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

// API
const darksky = "https://api.darksky.net/forecast/9d783ced70007d510216381c3579ba6a/-23.5489,-46.6388?lang=pt&units=si&exclude=minutely,hourly,flags"
const proxy = "https://cors-anywhere.herokuapp.com/"

const previsao = document.querySelector("#previsao");

function updateAPI() {
  fetch(proxy+darksky)
    .then(res => {
      return res.json()}
      )
    .then(data => {
      document.querySelector("#tempMax").innerText = Math.round(data.daily.data[0].temperatureHigh);
      document.querySelector("#tempMin").innerText = Math.round(data.daily.data[0].temperatureLow);
      document.querySelector("#chuva").innerText = data.daily.data[0].precipProbability*100;

      document.querySelector("#compTempMax").innerText = Math.round(data.daily.data[0].temperatureHigh);
      document.querySelector("#compTempMin").innerText = Math.round(data.daily.data[0].temperatureLow);
      document.querySelector("#compChuva").innerText = data.daily.data[0].precipProbability*100;

      document.querySelector("#amanhaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#amanhaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
      
      document.querySelector("#daTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#daTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);

      document.querySelector("#ddaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#ddaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);

      document.querySelector("#dddaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#dddaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
    })
}
