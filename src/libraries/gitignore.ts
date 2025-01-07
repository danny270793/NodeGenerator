import Fs from 'node:fs';
import { Terminal } from './terminal';

export class GitIgnore {
    private readonly path: string;
    private ignores: string[] = [];
    private read(): void {
        const content = Fs.readFileSync(this.path, 'utf-8').trim();
        this.ignores = content === '' ? [] : content.split('\n');
    }
    private write(): Promise<void> {
        Fs.writeFileSync(this.path, this.ignores.join('\n'));
        return Promise.resolve();
    }

    constructor(path: string) {
        this.path = path;
    }
    async init(): Promise<void> {
        if (!Fs.existsSync(this.path)) {
            await Terminal.run('git init');
            Fs.writeFileSync(this.path, '');
        }
        this.read();
    }
    async push(ignore: string): Promise<void> {
        this.ignores.push(ignore);
        this.write();
    }
}
