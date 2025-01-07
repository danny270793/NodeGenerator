import Fs from 'node:fs';

export class DotEnv {
    private readonly path: string;
    private variables: string[] = [];
    private read(): void {
        const content = Fs.readFileSync(this.path, 'utf-8').trim();
        this.variables = content === '' ? [] : content.split('\n');
    }
    private write(): Promise<void> {
        Fs.writeFileSync(this.path, this.variables.join('\n'));
        return Promise.resolve();
    }

    constructor(path: string) {
        this.path = path;
    }
    async init(): Promise<void> {
        if (!Fs.existsSync(this.path)) {
            Fs.writeFileSync(this.path, '');
        }
        this.read();
    }
    async push(variable: string, value: string): Promise<void> {
        this.variables.push(`${variable}=${value}`);
        await this.write();
    }
}
