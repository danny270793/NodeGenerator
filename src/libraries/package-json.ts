import Fs from 'node:fs';
import { Terminal } from './terminal';

export class PackageJson {
    private readonly path: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private content: any = {};
    private read(): void {
        const content = Fs.readFileSync(this.path, 'utf-8');
        this.content = JSON.parse(content);
    }
    private write(): Promise<void> {
        Fs.writeFileSync(this.path, JSON.stringify(this.content, null, 4));
        return Promise.resolve();
    }

    constructor(path: string) {
        this.path = path;
    }
    async init(): Promise<void> {
        if (!Fs.existsSync(this.path)) {
            await Terminal.run('npm init -y');
        }
        this.read();
    }
    async install(packageName: string[]): Promise<void> {
        await Terminal.run(`npm install --save ${packageName.join(' ')}`);
        this.read();
    }
    async installDev(packageName: string[]): Promise<void> {
        await Terminal.run(`npm install --save-dev ${packageName.join(' ')}`);
        this.read();
    }
    async script(name: string, value: string | undefined): Promise<void> {
        this.read();
        this.content['scripts'][name] = value;
        this.write();
    }
    async set(name: string, value: string | undefined): Promise<void> {
        this.read();
        this.content[name] = value;
        this.write();
    }
}
