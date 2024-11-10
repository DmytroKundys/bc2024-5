const { Command } = require('commander');
const express = require('express');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
    .requiredOption('-h, --host <type>', '������ �������')
    .requiredOption('-p, --port <type>', '���� �������')
    .requiredOption('-c, --cache <type>', '���� �� ����');

program.parse(process.argv);
const options = program.opts();

const app = express();
const cacheDir = path.resolve(options.cache);

// �������� ��������� �������� ����
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

app.listen(options.port, options.host, () => {
    console.log(`������ ������ �� http://${options.host}:${options.port}`);
});
