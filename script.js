let slideIndex = 0;
let autoPlay = setInterval(() => mudarSlide(1), 15000);

const MINHA_CHAVE_PIX = "+5521988510351"; 
const NOME_TITULAR = "NATHALIA E PHILIPPE"; 
const CIDADE = "SAO GONCALO";

function mudarSlide(n) {
    const slides = document.querySelectorAll(".carousel-slide .item");
    if (slides.length === 0) return;

    const todosVideos = document.querySelectorAll(".carousel-slide video");
    todosVideos.forEach(v => {
        v.pause();
        v.currentTime = 0;
    });

    slides[slideIndex].classList.remove("active");
    slideIndex += n;

    if (slideIndex >= slides.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }

    slides[slideIndex].classList.add("active");

    const videoAtivo = slides[slideIndex].querySelector("video");
    if (videoAtivo) {
        videoAtivo.play().catch(() => {});
    }
}

function cliqueManual(n) {
    clearInterval(autoPlay);
    mudarSlide(n);
    autoPlay = setInterval(() => mudarSlide(1), 15000);
}

function atualizarContador() {
    const dataEvento = new Date("2026-02-08T12:30:00").getTime();
    
    setInterval(function() {
        const agora = new Date().getTime();
        const distancia = dataEvento - agora;

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));

        if (document.getElementById("days")) {
            document.getElementById("days").innerHTML = dias < 10 ? "0" + dias : (dias < 0 ? "00" : dias);
            document.getElementById("hours").innerHTML = horas < 10 ? "0" + horas : (horas < 0 ? "00" : horas);
            document.getElementById("mins").innerHTML = minutos < 10 ? "0" + minutos : (minutos < 0 ? "00" : minutos);
        }
    }, 1000);
}

function abrirPopup(elemento) {
    const popup = document.getElementById("popup-container");
    const midiaContainer = document.getElementById("popup-midia");
    
    midiaContainer.innerHTML = elemento.innerHTML;
    
    const video = midiaContainer.querySelector('video');
    if (video) {
        video.setAttribute('controls', 'true');
        video.play();
    }

    popup.style.display = "flex";
}

function fecharPopup() {
    const popup = document.getElementById("popup-container");
    const video = popup.querySelector('video');
    if (video) video.pause();
    popup.style.display = "none";
}

function crc16(data) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
        crc ^= (data.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ polynomial;
            else crc <<= 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function abrirPix(valor, item) {
    const modal = document.getElementById("pix-modal");
    const imgQrCode = document.getElementById("qrcode-img");
    const inputCopiaCola = document.getElementById("input-copia-cola");
    
    document.getElementById("pix-valor-txt").innerText = "R$ " + valor.toFixed(2);
    document.getElementById("pix-item-txt").innerText = item;

    const f = (id, conteúdo) => id + conteúdo.length.toString().padStart(2, '0') + conteúdo;
    const valorStr = valor.toFixed(2);
    const merchantAccount = f("00", "BR.GOV.BCB.PIX") + f("01", MINHA_CHAVE_PIX);

    let payload = "000201"; 
    payload += f("26", merchantAccount);
    payload += "52040000"; 
    payload += "5303986";  
    payload += f("54", valorStr);
    payload += "5802BR";   
    payload += f("59", NOME_TITULAR);
    payload += f("60", CIDADE);
    payload += "62070503***"; 
    payload += "6304"; 

    const payloadFinal = payload + crc16(payload);

    imgQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payloadFinal)}`;
    inputCopiaCola.value = payloadFinal;

    modal.style.display = "flex";
}

function copiarCopiaCola() {
    const textCopiaCola = document.getElementById("input-copia-cola");
    const btn = document.getElementById("btn-copiar-pix");

    textCopiaCola.select();
    textCopiaCola.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textCopiaCola.value);

    const originalText = btn.innerText;
    btn.innerText = "Copiado! ✅";
    btn.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#81d4fa";
    }, 2000);
}

function fecharPix() {
    const modal = document.getElementById("pix-modal");
    if (modal) modal.style.display = "none";
}

document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        fecharPix();
        fecharPopup();
    }
});

atualizarContador();