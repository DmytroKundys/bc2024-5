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

const app = express();
const cacheDir = path.resolve(options.cache);

// Перевірка існування директорії кешу
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

app.listen(options.port, options.host, () => {
    console.log(`Сервер працює на http://${options.host}:${options.port}`);
});

app.use(express.json());

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
    const noteName = req.body.note_name;
    const noteText = req.body.note;
    const notePath = path.join(cacheDir, noteName);

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
