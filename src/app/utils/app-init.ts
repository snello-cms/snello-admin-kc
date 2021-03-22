import {ConfigurationService} from '../service/configuration.service';
import {KeycloakService} from 'keycloak-angular';

export function initializer(
    keycloak: KeycloakService,
    configService: ConfigurationService
): () => Promise<any> {
    return (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await configService
                    .getConfigs()
                    .then(data => {
                        const config = {
                            url: data.keycloakUrl,
                            realm: data.keycloakRealm,
                            clientId: data.keycloakClientId
                        };
                        return keycloak.init({
                            config,
                            initOptions: {
                                onLoad: 'login-required',
                                checkLoginIframe: false
                            },
                            bearerExcludedUrls: ['assets/config.json']
                        });
                    })
                    .then(res => {
                        console.log('kc init: ' + res);
                        resolve();
                    });
            } catch (error) {
                reject(error);
            }
        });
    };
}
