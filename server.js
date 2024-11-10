const { Command } = require('commander');
const express = require('express');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
    .requiredOption('-h, --host <type>', 'адреса сервера')
    .requiredOption('-p, --port <type>', 'порт сервера')
    .requiredOption('-c, --cache <type>', 'шлях до кешу');

program.parse(process.argv);
const options = program.opts();

// Логування параметрів для перевірки
console.log("Host:", options.host);
console.log("Port:", options.port);
console.log("Cache Directory:", options.cache);

if (!options.cache) {
    console.error("Помилка: Параметр --cache не переданий або некоректний.");
    process.exit(1);
}

const app = express();
const cacheDir = path.resolve(options.cache);

// Перевірка існування директорії кешу
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

app.listen(options.port, options.host, () => {
    console.log(`Сервер працює на http://${options.host}:${options.port}`);
});

// Налаштування для обробки JSON та form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Додає обробку для form-data

// GET /notes/<ім’я нотатки>
app.get('/notes/:name', (req, res) => {
    const notePath = path.join(cacheDir, req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    const noteText = fs.readFileSync(notePath, 'utf-8');
    res.send(noteText);
});

// PUT /notes/<ім’я нотатки>
app.put('/notes/:name', (req, res) => {
    const notePath = path.join(cacheDir, req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    fs.writeFileSync(notePath, req.body.text);
    res.send('Note updated');
});

// DELETE /notes/<ім’я нотатки>
app.delete('/notes/:name', (req, res) => {
    const notePath = path.join(cacheDir, req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    fs.unlinkSync(notePath);
    res.send('Note deleted');
});

// GET /notes
app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(cacheDir).map(name => ({
        name,
        text: fs.readFileSync(path.join(cacheDir, name), 'utf-8'),
    }));
    res.json(notes);
});

// POST /write
app.post('/write', (req, res) => {
    console.log("Received POST /write request with body:", req.body); // Додаткове логування

    const noteName = req.body.note_name;
    const noteText = req.body.note;

    if (!noteName || !noteText) {
        console.error("Помилка: 'note_name' або 'note' не передані.");
        return res.status(400).send("Помилка: Необхідні поля 'note_name' або 'note' не передані.");
    }

    const notePath = path.join(cacheDir, noteName);

    console.log("Note Name:", noteName);
    console.log("Note Text:", noteText);
    console.log("Note Path:", notePath);

    if (fs.existsSync(notePath)) {
        return res.status(400).send('Note already exists');
    }

    fs.writeFileSync(notePath, noteText);
    res.status(201).send('Note created');
});


// GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'UploadForm.html'));
});
