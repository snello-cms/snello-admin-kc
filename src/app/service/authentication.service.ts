import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {
    TOKEN_ITEM,
    USER_ITEM
} from '../constants/constants';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserInSession} from '../model/user-in-session';
import {ConfigurationService} from './configuration.service';
import {ChangePassword} from '../model/change-password';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    public utente: UserInSession;
    private access_token: any;
    private refresh_token: any;
    private logi_api_path: string;
    private resetpassword_api_path: string;
    private changepassword_api_path: string;

    constructor(private http: HttpClient, configurationService: ConfigurationService) {
    }

    public getUtente(): Observable<UserInSession> {
        this.utente = new UserInSession();
        this.utente.username = 'admin';
        this.utente.roles = ['admin'];
        return of(this.utente);
    }

    public login(username: string, password: string): Observable<boolean> {
        const body: HttpParams = new HttpParams().set('username', username).set('password', password);
        return this.http.post(this.logi_api_path, body, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
            .pipe(
                map((res: any) => {
                        const utente = new UserInSession();
                        utente.username = res.username;
                        utente.roles = res.roles;
                        this.access_token = res.access_token;
                        this.refresh_token = res.refresh_token;
                        sessionStorage.setItem(TOKEN_ITEM, this.access_token);
                        sessionStorage.setItem(USER_ITEM, JSON.stringify(utente));
                    }
                ),
                switchMap(() => {
                    return this.getUtente()
                        .pipe(
                            map(() => {
                                return true;
                            }),
                            catchError(() => {
                                return of(false);
                            })
                        );
                }),
                catchError(this.handleError)
            );
    }

    resetpassword(username: string): Observable<any> {
        const body: HttpParams = new HttpParams();
        return this.http.post(this.resetpassword_api_path + '/' + username, body)
            .pipe(catchError(this.handleError.bind(this)));
    }

    changepassword(username: string, changePassword: ChangePassword): Observable<any> {
        return this.http.post(this.changepassword_api_path + '/' + username, changePassword)
            .pipe(catchError(this.handleError.bind(this)));
    }


    public checkToken(): Observable<boolean> {
        const token: string = sessionStorage.getItem(TOKEN_ITEM);
        if (!token) {
            this.logout();
            return of(false);
        }
        this.access_token = token;
        return this.getUtente()
            .pipe(
                map(() => {
                    return true;
                })
            );
    }

    public checkLogged(): boolean {
        const token: string = sessionStorage.getItem(TOKEN_ITEM);
        if (!token) {
            return false;
        }
        return true;
    }

    public logout() {
        this.access_token = undefined;
        this.refresh_token = undefined;
        this.utente = undefined;
        sessionStorage.removeItem(TOKEN_ITEM);
        sessionStorage.removeItem(USER_ITEM);
    }

    public isLogged(): Observable<boolean> {
        if (this.utente) {
            return of(true);
        }
        return of(false);
    }


    public handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(error || 'Server error');
    }

}
