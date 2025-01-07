#!/usr/bin/env node

import Path from 'node:path';
import Fs from 'node:fs';
import { Terminal } from './libraries/terminal';
import { PackageJson } from './libraries/package-json';
import { GitIgnore } from './libraries/gitignore';
import { DotEnv } from './libraries/dotenv';

async function main(): Promise<void> {
    const args: string[] = process.argv.slice(2)
    if (args.length === 0) {
        console.error(`missing <folderPath>\n\nussage:\n\tnpx @danny270793/nodegenerator <folderPath>`)
        process.exit(1)
    }

    const folderPath: string = args[0];

    console.log('[*] Deleting old folder');
    if(Fs.existsSync(folderPath)) {
        console.error(`Folder "${folderPath}" already exists, delete it first`)
        process.exit(1)
    }

    console.log('[*] Creating new folder');
    Fs.mkdirSync(folderPath, { recursive: true });
    process.chdir(folderPath);

    console.log('[*] Initializing npm');
    const packageJson: PackageJson = new PackageJson(
        Path.join('.', 'package.json'),
    );
    await packageJson.init();
    await packageJson.script('test', undefined);

    console.log('[*] Initializing git');
    const gitIgnore: GitIgnore = new GitIgnore(Path.join('.', '.gitignore'));
    await gitIgnore.init();
    await gitIgnore.push('node_modules');

    console.log('[*] Initializing dot env');
    const dotEnv: DotEnv = new DotEnv(Path.join('.', '.env'));
    await dotEnv.init();
    await dotEnv.push('NODE_ENV', 'development');

    console.log('[*] Setting up typescript');
    await packageJson.installDev(['typescript', 'ts-node-dev']);
    await Terminal.run('npx tsc --init');
    Fs.mkdirSync(Path.join('.', 'src'), { recursive: true });
    Fs.copyFileSync(
        Path.join('..', 'assets', 'index.ts'),
        Path.join('.', 'src', 'index.ts'),
    );

    console.log('[*] Configuring tsconfig.json');
    const tsconfig: string = Fs.readFileSync(
        Path.join('.', 'tsconfig.json'),
        'utf-8',
    );
    const newTsConfig: string = tsconfig.replace(
        '// "outDir": "./",',
        '"outDir": "./build",',
    );
    Fs.writeFileSync(Path.join('.', 'tsconfig.json'), newTsConfig);
    await gitIgnore.push('build');

    console.log('[*] Configuring scripts');
    await packageJson.script('build', 'tsc');
    await packageJson.script('start', 'node ./build/index.js');
    await packageJson.script(
        'start:watch',
        'ts-node-dev --respawn ./src/index.ts',
    );

    await packageJson.set('main', './build/index.js');

    console.log('[*] Configuring license');
    await packageJson.set('license', 'MIT');
    const license: string = Fs.readFileSync(
        Path.join('..', 'assets', 'license.md'),
        'utf-8',
    );
    const newLicense: string = license
        .replace('<year>', new Date().getFullYear().toString())
        .replace('<copyright holders>', 'Danny Vaca');
    Fs.writeFileSync(Path.join('.', 'license.md'), newLicense);

    console.log('[*] Configuring Eslint');
    await packageJson.installDev([
        '@eslint/js',
        'eslint',
        'globals',
        'typescript-eslint',
    ]);
    Fs.copyFileSync(
        Path.join('..', 'eslint.config.mjs'),
        Path.join('.', 'eslint.config.mjs'),
    );
    await packageJson.script('lint', 'eslint --fix .');

    console.log('[*] Configuring Prettier');
    await packageJson.installDev(['prettier']);
    Fs.copyFileSync(
        Path.join('..', '.prettierrc'),
        Path.join('.', '.prettierrc'),
    );
    await packageJson.script('format', 'prettier --write .');

    console.log('[*] Configuring tests');
    await packageJson.installDev(['jest', 'ts-jest', '@types/jest']);
    await packageJson.script('test', 'jest');
    await packageJson.script('test:watch', 'jest --watch');
    Fs.copyFileSync(
        Path.join('..', 'assets', 'jest.config.ts'),
        Path.join('.', 'jest.config.ts'),
    );
    Fs.mkdirSync(Path.join('.', 'tests'), { recursive: true });
    Fs.copyFileSync(
        Path.join('..', 'assets', 'index.test.ts'),
        Path.join('.', 'tests', 'index.test.ts'),
    );
    await gitIgnore.push('.tests');
}

main().catch(console.error);
