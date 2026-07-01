import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { apiContract } from '@repo/coa-contracts';
import { initClient } from "@ts-rest/core"
import { firstValueFrom } from 'rxjs';

@Service()
export class CoaApiClient {
    private http = inject(HttpClient);
    private readonly baseUrl = "http://localhost:3000/api"

    private readonly client = initClient(apiContract, {
        baseUrl: this.baseUrl,
        api: async ({ path, method, headers, body }) => {

            let angularHeaders = new HttpHeaders();
            Object.entries(headers).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    angularHeaders = angularHeaders.set(key, String(value));
                }
            });

            const response$ = this.http.request(method, path, {
                body: body,
                headers: angularHeaders,
                observe: 'response',
                responseType: 'json',
            });

            try {
                const response = await firstValueFrom(response$);

                const responseHeaders = new Headers();
                response.headers.keys().forEach((key) => {
                    const value = response.headers.get(key);
                    if (value) responseHeaders.append(key, value);
                });

                return {
                    status: response.status,
                    body: response.body,
                    headers: responseHeaders,
                };
            } catch (error) {
                if (error instanceof HttpErrorResponse) {
                    const errorHeaders = new Headers();
                    error.headers.keys().forEach((key) => {
                        const value = error.headers.get(key);
                        if (value) errorHeaders.append(key, value);
                    });

                    return {
                        status: error.status,
                        body: error.error, // No Angular, o payload de erro fica na propriedade .error
                        headers: errorHeaders,
                    };
                }
                throw error;
            }
        },
    });

    get coa() { return this.client.coa; }
    get accounts() { return this.client.accounts; }
}


