const text = "REVOLUCIONANDO A MANUTENÇÃO AUTOMOTIVA";
let index = 0;
const speed = 100; // Velocidade da digitação (em milissegundos)

function typeWriter() {
  const typingElement = document.getElementById("typing");

  if (index < text.length) {
    typingElement.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, speed); // Chama a função novamente até terminar
  } else {
    // Remove o cursor piscante depois que a digitação termina
    typingElement.classList.remove("blink");
    typingElement.style.borderRight = "none";
  }
}

// Adiciona a classe 'blink' para o cursor piscante durante a digitação
document.getElementById("typing").classList.add("blink");

// Inicia o efeito de digitação ao carregar a página
window.onload = typeWriter;





const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const imagem = document.getElementById('imagem');
const tirarFotoBtn = document.getElementById('enviar_foto');
const diagnosticoElement = document.getElementById('diagnostico');
const solucaoElement = document.getElementById('solucao');
const orcamentoElement = document.getElementById('orcamento');
let isCameraActive = false; // Estado para controlar o fluxo de cliques
let stream = null; // Armazenar o stream da câmera

// Função para iniciar a câmera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
            video.style.display = 'block'; // Exibir o vídeo quando a câmera estiver ativa
            imagem.style.display = 'none'; // Ocultar a imagem quando a câmera for ativada
            video.srcObject = mediaStream;
            stream = mediaStream; // Armazenar o stream para controle futuro
        })
        .catch((error) => {
            console.error('Erro ao acessar a câmera: ', error);
            alert('Não foi possível acessar a câmera. Verifique as permissões.');
        });
}
// Função para parar a câmera
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Parar todas as tracks de vídeo
        stream = null; // Limpar o stream
    }
}

// Função para tirar foto e realizar predição
async function tirarFoto() {
    // Verificar se o vídeo está pronto
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Definir o tamanho do canvas como o mesmo do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenhar o frame atual do vídeo no canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Converter a imagem do canvas em dados de URL e colocar na tag <img>
        const dataUrl = canvas.toDataURL('image/png');
        imagem.src = dataUrl;

        // Ocultar o vídeo após tirar a foto (opcional)
        video.style.display = 'none';
        imagem.style.display = 'block'; // Mostrar a imagem após a foto ser tirada
        tirarFotoBtn.textContent = 'Abrir câmera'; // Resetar o botão para abrir a câmera novamente
        isCameraActive = false; // Resetar o estado

        // Parar a câmera após tirar a foto
        stopCamera(); 

        // Fazer a predição com a imagem tirada
        await predictImage(dataUrl);
    } else {
        alert('A câmera ainda não está pronta. Tente novamente em instantes.');
    }
}

// Função para realizar predição com a imagem tirada
async function predictImage(imageUrl) {
    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
        // Fazer a predição com a imagem carregada
        const prediction = await model.predict(img);
        for (let i = 0; i < maxPredictions; i++) {
            if (prediction[i].probability.toFixed(2) > 0.90) { // Exemplo de threshold para predizer o problema
                getProblemMessage(prediction[i].className);
            }
        }
    };
}

// Evento de clique no botão
tirarFotoBtn.addEventListener('click', () => {
    if (!isCameraActive) {
        // Primeiro clique: abrir a câmera
        startCamera();
        tirarFotoBtn.textContent = 'Tirar foto'; // Mudar o texto do botão
        isCameraActive = true; // Atualizar o estado
    } else {
        // Segundo clique: tirar a foto
        tirarFoto();
    }
});

// Função para gerar diagnóstico, solução e orçamento

function getProblemMessage(predictedClass) {
    switch (predictedClass) {
        case 'LuzBateria':
            diagnosticoElement.textContent = "A luz de bateria acesa indica um problema no sistema de carregamento, relacionado ao alternador, à bateria ou à correia, podendo causar falhas elétricas e impedir o funcionamento do carro.";
            solucaoElement.textContent = "Recomendamos verificar o alternador, a bateria e a correia, substituindo a peça danificada, se necessário, para garantir o funcionamento do sistema de carregamento.";
            document.getElementById('orcamento-peças').textContent = "Peças: R$ 700 (se necessário)";
            document.getElementById('orcamento-mao-obra').textContent = "Mão de Obra: R$ 50";
            document.getElementById('orcamento-total').textContent = "Total: R$ 750 (se necessário)";
            break;

        case 'LuzÓleo':
            diagnosticoElement.textContent = "A luz de óleo do motor indica baixa pressão ou nível insuficiente de óleo, o que pode causar sérios danos ao motor se não resolvido rapidamente.";
            solucaoElement.textContent = "Recomendamos verificar o nível de óleo e completar ou trocar o óleo do motor. Além disso, é importante verificar o filtro de óleo e, se necessário, substituí-lo.";
            document.getElementById('orcamento-peças').textContent = "Peças: R$ 110 (Troca de óleo: R$ 80, Filtro de óleo: R$ 30)";
            document.getElementById('orcamento-mao-obra').textContent = "Mão de Obra: R$ 50";
            document.getElementById('orcamento-total').textContent = "Total: R$ 160";
            break;

        case 'LuzFreio':
            diagnosticoElement.textContent = "Seu problema é que a luz de freio está acesa.";
            solucaoElement.textContent = "Trocar as pastilhas de freio.";
            document.getElementById('orcamento-peças').textContent = "Peças: R$ 150";
            document.getElementById('orcamento-mao-obra').textContent = "Mão de Obra: R$ 50";
            document.getElementById('orcamento-total').textContent = "Total: R$ 200";
            break;

        case 'LuzMotor':
            diagnosticoElement.textContent = "A luz de injeção elétrica acesa indica um problema no sistema de injeção eletrônica do veículo, que pode afetar o desempenho do motor e a eficiência de combustível.";
            solucaoElement.textContent = "Recomendamos realizar um diagnóstico completo para identificar a falha. Caso seja necessário substituir a unidade de controle do motor (ECU), o serviço estará incluído.";
            document.getElementById('orcamento-peças').textContent = "Peças: R$ 800 (ECU)";
            document.getElementById('orcamento-mao-obra').textContent = "Mão de Obra: R$ 100 (Diagnóstico)";
            document.getElementById('orcamento-total').textContent = "Total: R$ 900 (se a substituição da ECU for necessária)";
            break;

        default:
            diagnosticoElement.textContent = "Não foi possível identificar o problema.";
            solucaoElement.textContent = "Consulte um mecânico para um diagnóstico mais detalhado.";
            document.getElementById('orcamento-peças').textContent = "Peças: R$ 0,00";
            document.getElementById('orcamento-mao-obra').textContent = "Mão de Obra: R$ 0,00";
            document.getElementById('orcamento-total').textContent = "Total: R$ 0,00";
            break;
    }
}



// Integração com Teachable Machine
const URL = "./teachablemachine/";

let model, webcam, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip); // Usar webcam para captura de imagens
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    if(document.getElementById("webcam-container").hasChildNodes){

    }else{
        document.getElementById("webcam-container").appendChild(webcam.canvas);
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > 0.90) { // Exemplo de threshold para predizer o problema
            getProblemMessage(prediction[i].className);
        }
    }
}
