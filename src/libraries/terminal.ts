import ChildProcess from 'child_process';

type RunOutput = {
    code: string;
    stdout: string;
    stderr: string;
};

export class Terminal {
    static run(command: string): Promise<RunOutput> {
        const tokens: string[] = command.split(' ');
        const baseCommand: string = tokens[0];
        const argumentsToCommand: string[] = tokens.slice(1);
        const spawnedProcess: ChildProcess.ChildProcessWithoutNullStreams =
            ChildProcess.spawn(baseCommand, argumentsToCommand);

        let stdout: string = '';
        let stderr: string = '';

        return new Promise((resolve) => {
            spawnedProcess.stdout.on('data', (data: Buffer) => {
                const dataString: string = data.toString();
                process.stdout.write(dataString);
                stdout += dataString;
            });

            spawnedProcess.stderr.on('data', (data: Buffer) => {
                const dataString: string = data.toString();
                process.stderr.write(dataString.toString());
                stderr += dataString;
            });

            spawnedProcess.on('close', (code: string) => {
                resolve({ code, stdout, stderr });
            });
        });
    }
}
