import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.7.0:1',
  releaseNotes: {
    en_US:
      'Fix: pin MariaDB to 10.11 LTS. 11.x removed the mysql/mysqldump compatibility binaries the "Set Public URL"/"Edit Settings" actions and backups depend on, causing "No such file or directory" errors. Existing installs must be reinstalled — MariaDB cannot downgrade an 11.x data directory to 10.x.',
    es_ES:
      'Corrección: se fija MariaDB a la versión LTS 10.11. La serie 11.x eliminó los binarios de compatibilidad mysql/mysqldump de los que dependen las acciones "Set Public URL"/"Edit Settings" y las copias de seguridad, lo que causaba errores "No such file or directory". Las instalaciones existentes deben reinstalarse: MariaDB no puede degradar un directorio de datos 11.x a 10.x.',
    de_DE:
      'Fehlerbehebung: MariaDB wird auf die LTS-Version 10.11 festgelegt. Die 11.x-Reihe hat die mysql/mysqldump-Kompatibilitätsbinärdateien entfernt, auf die die Aktionen „Set Public URL“/„Edit Settings“ und die Backups angewiesen sind, was zu Fehlern „No such file or directory“ führte. Bestehende Installationen müssen neu installiert werden — MariaDB kann ein 11.x-Datenverzeichnis nicht auf 10.x zurückstufen.',
    pl_PL:
      'Poprawka: MariaDB przypięto do wersji LTS 10.11. Seria 11.x usunęła binaria zgodności mysql/mysqldump, od których zależą akcje „Set Public URL”/„Edit Settings” oraz kopie zapasowe, co powodowało błędy „No such file or directory”. Istniejące instalacje wymagają ponownej instalacji — MariaDB nie może obniżyć wersji katalogu danych z 11.x do 10.x.',
    fr_FR:
      'Correction : MariaDB est désormais épinglé sur la version LTS 10.11. La série 11.x a supprimé les binaires de compatibilité mysql/mysqldump dont dépendent les actions « Set Public URL »/« Edit Settings » ainsi que les sauvegardes, provoquant des erreurs « No such file or directory ». Les installations existantes doivent être réinstallées — MariaDB ne peut pas rétrograder un répertoire de données 11.x vers 10.x.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
