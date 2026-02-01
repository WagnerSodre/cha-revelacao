// Variável global para controlar o slide atual
let slideIndex = 0;

function mudarSlide(n) {
    const slides = document.querySelectorAll(".carousel-slide .item");
    if (slides.length === 0) return;

    // 1. Pausa todos os vídeos antes de trocar de slide
    const todosVideos = document.querySelectorAll(".carousel-slide video");
    todosVideos.forEach(v => {
        v.pause();
        v.currentTime = 0; // Opcional: reinicia o vídeo
    });

    // 2. Troca o slide ativo
    slides[slideIndex].classList.remove("active");
    slideIndex += n;

    if (slideIndex >= slides.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }

    slides[slideIndex].classList.add("active");

    // 3. Verifica se o NOVO slide ativo tem um vídeo e dá Play
    const videoAtivo = slides[slideIndex].querySelector("video");
    if (videoAtivo) {
        // O play() retorna uma promessa, tratamos para evitar erros no console
        videoAtivo.play().catch(error => {
            console.log("Autoplay bloqueado pelo navegador. O usuário precisa interagir primeiro.");
        });
    }
}

// Configura o Auto-play (opcional)
let autoPlay = setInterval(() => {
    mudarSlide(1);
}, 15000);

// Para o auto-play quando o usuário clica manualmente (melhora a experiência)
function cliqueManual(n) {
    clearInterval(autoPlay); // Para o contador automático
    mudarSlide(n);           // Muda o slide
    // Reinicia o auto-play após o clique
    autoPlay = setInterval(() => {
        mudarSlide(1);
    }, 15000);
}

// --- LÓGICA DO CONTADOR ---
function atualizarContador() {
    // Ajustei a data para o seu evento real
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

// Inicia o contador assim que o script carrega
atualizarContador();

function abrirPopup(elemento) {
    const popup = document.getElementById("popup-container");
    const midiaContainer = document.getElementById("popup-midia");
    
    // Limpa o conteúdo anterior
    midiaContainer.innerHTML = "";

    // Pega o que tem dentro do item (img ou video)
    const conteudoOriginal = elemento.innerHTML;
    
    // Clona o conteúdo para o popup
    midiaContainer.innerHTML = conteudoOriginal;
    
    // Se for um vídeo, garante que ele tenha controles no popup
    const video = midiaContainer.querySelector('video');
    if (video) {
        video.setAttribute('controls', 'true');
        video.play(); // Opcional: começa a tocar quando abre
    }

    popup.style.display = "flex";
}

function fecharPopup() {
    const popup = document.getElementById("popup-container");
    const midiaContainer = document.getElementById("popup-midia");
    
    // Para o vídeo se houver um antes de fechar
    const video = midiaContainer.querySelector('video');
    if (video) video.pause();

    popup.style.display = "none";
}

// Fechar com a tecla Esc
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") fecharPopup();
});

// Configurações
const MINHA_CHAVE_PIX = "+5521988510351"; // Chave celular com +55
const NOME_TITULAR = "NATHALIA E PHILIPPE"; 
const CIDADE = "SAO GONCALO";

function crc16(data) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
        crc ^= (data.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc <<= 1;
            }
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

    // Calcula o CRC final
    const payloadFinal = payload + crc16(payload);

    // 1. Gera o QR Code visual
    imgQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payloadFinal)}`;

    // 2. Exibe o código "Copia e Cola" no campo de texto
    inputCopiaCola.value = payloadFinal;

    modal.style.display = "flex";
}

function copiarCopiaCola() {
    const textCopiaCola = document.getElementById("input-copia-cola");
    const btn = document.getElementById("btn-copiar-pix");

    // Copia o conteúdo do textarea
    textCopiaCola.select();
    textCopiaCola.setSelectionRange(0, 99999); // Para celulares
    navigator.clipboard.writeText(textCopiaCola.value);

    // Feedback visual
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
    if (modal) {
        modal.style.display = "none";
    }
}

// Dica extra: Fechar o modal ao clicar na tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") fecharPix();
});