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
