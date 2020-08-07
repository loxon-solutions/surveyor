import {Environment} from './environment';
import * as fs from 'fs';

/**
 * Utility class to read environment parameters. Probably there would be some fancy tool to do this...
 */
export class EnvironmentParamsUtil {

    constructor(private env: Environment) {
    }

    public initializeEnvironmentParams() {
        const relevantArguments = process.argv.slice(2);
        const fingerprint = this.createFingerPrint();
        let params = new Map();

        this.setDefaultValues(params);

        for (let i = 0; i<relevantArguments.length; i+=2) {
            const key = relevantArguments[i].substring(2) // Remove --
            const value = relevantArguments[i+1];

            if (key === 'help') {
                this.env.help();
            } else if (key === 'paramFile') {
                fs.readFileSync(value)
                    .toString()
                    .split("\n")
                    .forEach(row => {
                        try {
                            this.parseParameter(row.split('=')[0], row.split('=')[1], params, fingerprint);
                        } catch (e) {
                            // TODO error handling
                        }
                    });
            }
            else {
                this.parseParameter(key, value, params, fingerprint)
            }
        }

        return params;
    }

    private setDefaultValues(params: Map<any, any>) {
        if (!this.env.paramOptions) {
            return;
        }

        this
            .env
            .paramOptions
            .filter(o => !!o.def)
            .forEach(o => params.set(o.key, o.def));
    }

    private parseParameter(key: string, value: string, params: Map<string, any>, fingerprint: Map<String, number>) {
        if (!key || !value) {
            return params;
        } else {
            key = key.trim();
            value = value.trim();
        }
        if (this.env.paramOptions && this.env.paramOptions.map(p => p.key).includes(key)) {
            try {
                params.set(key, JSON.parse(value));
            } catch(e) {
                params.set(key, value);
            }
            fingerprint.set(key, 1);
        } else if (this.env.paramOptions && this.env.paramOptions.map(p => p.key).includes(key+'s') && Array.isArray(this.env.paramOptions.filter(p => p.key === key+'s'))) {
            if (!params.get(key+'s') || fingerprint.get(key+'s') === 0) {
                // fingerprint 0 means that this is untouched, default values must be cleared.
                params.set(key+'s', []);
            }
            params.get(key+'s').push(value);
            fingerprint.set(key+'s', 1);
        } else {
            this.env.fail(`Unknown property: --${key}. Use --help parameter to list known properties!`);
        }

        return params;
    }

    private createFingerPrint() {
        const fingerPrint = new Map();
        Object.keys(this.env.defaultParams).forEach(key => fingerPrint.set(key, 0));
        return fingerPrint;
    }
}
