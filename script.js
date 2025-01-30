const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frames = [];
const framePreview = document.getElementById('frames-list');
const outputGif = document.getElementById('output-gif');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const frameDelay = document.getElementById('frameDelay');
const textOverlay = document.getElementById('textOverlay');

// Устанавливаем белый фон
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Настройки рисования
let drawing = false;
ctx.lineCap = 'round';

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    ctx.lineTo(event.offsetX + 1, event.offsetY + 1);
    ctx.stroke();
});

// Загрузка изображения
document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert('Ошибка: Файл не выбран!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Добавление кадра с текстом
function addFrame() {
    const text = textOverlay.value.trim();
    
    // Создаём временный canvas для текста
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Копируем изображение
    tempCtx.drawImage(canvas, 0, 0);

    // Добавляем текст, если он есть
    if (text) {
        tempCtx.font = "10px Arial";
        tempCtx.fillStyle = "white";
        tempCtx.strokeStyle = "black";
        tempCtx.lineWidth = 3;
        tempCtx.textAlign = "center";
        tempCtx.textBaseline = "bottom";

        tempCtx.strokeText(text, canvas.width / 2, canvas.height - 10);
        tempCtx.fillText(text, canvas.width / 2, canvas.height - 10);
    }

    // Сохраняем кадр
    const frameData = tempCanvas.toDataURL();
    frames.push(frameData);

    // Добавляем превью кадра
    const img = document.createElement('img');
    img.src = frameData;
    framePreview.appendChild(img);
}

// Генерация GIF с текстом
function generateGIF() {
    if (frames.length === 0) {
        alert('Ошибка: Добавьте хотя бы один кадр!');
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10
    });

    frames.forEach(frame => {
        const img = new Image();
        img.src = frame;
        gif.addFrame(img, { delay: Number(frameDelay.value) });
    });

    gif.on('finished', function (blob) {
        outputGif.src = URL.createObjectURL(blob);
    });

    gif.render();
}

// Очистка кадров
function clearFrames() {
    frames.length = 0;
    framePreview.innerHTML = '';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    outputGif.src = "";
}

// Сохранение GIF
function downloadGIF() {
    if (!outputGif.src) {
        alert('Ошибка: Сначала создайте GIF!');
        return;
    }

    const link = document.createElement('a');
    link.href = outputGif.src;
    link.download = 'animation.gif';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}