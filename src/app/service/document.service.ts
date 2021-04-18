import {Observable, Observer} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {Document} from '../model/document';
import {MessageService} from 'primeng/api';
import {catchError, map} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {DOCUMENT_API_PATH, MULTIPART_FROM_DATA} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class DocumentService extends AbstractService<Document> {

    private progress$: Observable<number>;
    private progress = 0;
    private progressObserver: Observer<number>;

    constructor(protected httpClient: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(DOCUMENT_API_PATH), httpClient, messageService);
        this.progress$ = new Observable<number>(observer => {
            this.progressObserver = observer;
        });
    }

    public upload(
        blob: any,
        table_name: string,
        table_key: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', blob);
        formData.append('filename', blob.name);
        formData.append('mimeType', blob.type);
        formData.append('table_name', table_name);
        formData.append('table_key', table_key);
        return this.httpClient.post<any>(this.url, formData);
    }

    private setUploadUpdateInterval(interval: number): void {
        setInterval(() => {
        }, interval);
    }

    private updateProgress(progress: number): void {
        this.progress = progress;
        if (this.progressObserver) {
            this.progressObserver.next(this.progress);
        }
    }

    public getObserver(): Observable<number> {
        return this.progress$;
    }

    getId(element: Document) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            uuid: '',
            _limit: 10
        };
    }

    public simplDownload(uuid: string): Observable<any> {
        return this.httpClient.get(this.url + '/' + uuid + '/download', {responseType: 'blob'});
    }

    public downloadPath(uuid: string): string {
        return this.url + '/' + uuid + '/download';
    }

    public download(uuid: string): Observable<any> {
        return this.simplDownload(uuid)
            .pipe(
                map(res => {
                    if (res.size === 0) {
                        return null;
                    }
                    return new Blob([res], {type: 'application/octet-stream'});
                }),
                catchError(this.handleError)
            );
    }
}
