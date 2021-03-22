import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {UserInSession} from '../../model/user-in-session';
import {ADMIN_ITEMS, APP_VERSION, SEVERITY_VALUES} from '../../constants/constants';
import {MessageService} from 'primeng/api';
import {KeycloakService} from 'keycloak-angular';

@Component(
    {
        templateUrl: './adminpage.component.html',
        styleUrls: ['./adminpage.component.css']
    }
)
export class AdminpageComponent {

    items: any[] = [];
    public utente: UserInSession;
    severity: string;
    severityValues = SEVERITY_VALUES;


    constructor(private _route: ActivatedRoute,
                public router: Router,
                protected keycloakService: KeycloakService,
                private messageService: MessageService) {
        this.utente = new UserInSession();
        this.utente.username = this.keycloakService.getUsername();
        this.utente.roles = this.keycloakService.getUserRoles();
        this.items = ADMIN_ITEMS;
    }

    showViaService() {
        this.messageService.add({severity: this.severity, summary: 'Service Message', detail: 'Via MessageService'});
    }

    public version(): string {
        return APP_VERSION;
    }
}
