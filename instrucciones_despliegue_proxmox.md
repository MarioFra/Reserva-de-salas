# Guía de Despliegue del Sistema de Reserva de Salas en Proxmox

Esta guía detalla los pasos para desplegar el sistema de reserva de salas en una máquina virtual Linux en Proxmox, desde la creación de la VM hasta la configuración completa del entorno de producción.

## Índice
1. [Creación de la máquina virtual en Proxmox](#1-creación-de-la-máquina-virtual-en-proxmox)
2. [Instalación y configuración del sistema operativo](#2-instalación-y-configuración-del-sistema-operativo)
3. [Instalación de dependencias básicas](#3-instalación-de-dependencias-básicas)
4. [Instalación y configuración de MongoDB](#4-instalación-y-configuración-de-mongodb)
5. [Instalación de Node.js y npm](#5-instalación-de-nodejs-y-npm)
6. [Configuración del firewall](#6-configuración-del-firewall)
7. [Despliegue del backend](#7-despliegue-del-backend)
8. [Despliegue del frontend](#8-despliegue-del-frontend)
9. [Configuración de Nginx como proxy inverso](#9-configuración-de-nginx-como-proxy-inverso)
10. [Configuración de SSL/TLS con Let's Encrypt](#10-configuración-de-ssltls-con-lets-encrypt)
11. [Configuración de servicios systemd](#11-configuración-de-servicios-systemd)
12. [Pruebas finales y verificación](#12-pruebas-finales-y-verificación)
13. [Mantenimiento y monitoreo](#13-mantenimiento-y-monitoreo)

## 1. Creación de la máquina virtual en Proxmox

1. **Accede a la interfaz web de Proxmox**:
   - Abre un navegador y visita `https://IP-DE-TU-SERVIDOR-PROXMOX:8006`
   - Inicia sesión con tus credenciales de administrador

2. **Crea una nueva máquina virtual**:
   - Haz clic en "Create VM" en la esquina superior derecha
   - Asigna un ID y nombre (ej. "reserva-salas")
   - En la pestaña "OS", selecciona "Linux" como tipo de sistema operativo
   - Selecciona "Ubuntu" o "Debian" como versión (recomendado Ubuntu Server 22.04 LTS)

3. **Configura los recursos de la VM**:
   - **CPU**: Mínimo 2 cores virtuales (recomendado 4 para producción)
   - **Memoria**: Mínimo 4GB (recomendado 8GB para producción)
   - **Disco**: Mínimo 20GB (recomendado 50GB para producción)
   - **Red**: Selecciona un puente de red (bridge) conectado a tu red local

4. **Sube la ISO del sistema operativo**:
   - Descarga la ISO de Ubuntu Server 22.04 LTS desde el sitio oficial
   - En Proxmox, ve a "local" (o tu almacenamiento) → "ISO Images" → "Upload"
   - Selecciona la ISO descargada

5. **Finaliza la creación**:
   - Revisa la configuración y haz clic en "Finish"
   - Inicia la VM haciendo clic en "Start"

## 2. Instalación y configuración del sistema operativo

1. **Instala Ubuntu Server**:
   - Selecciona el idioma, ubicación y configuración de teclado
   - Configura la red (se recomienda IP estática para servidores)
   - Configura el nombre del servidor (ej. "reserva-salas")
   - Crea un usuario administrador (no uses "root" directamente)
   - Selecciona "Install OpenSSH server" cuando se te pregunte por servicios adicionales

2. **Actualiza el sistema**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **Instala herramientas básicas**:
   ```bash
   sudo apt install -y vim curl wget git htop net-tools
   ```

4. **Configura la zona horaria**:
   ```bash
   sudo timedatectl set-timezone America/Mexico_City
   ```

## 3. Instalación de dependencias básicas

1. **Instala dependencias de compilación**:
   ```bash
   sudo apt install -y build-essential
   ```

2. **Instala herramientas de desarrollo**:
   ```bash
   sudo apt install -y python3-pip
   ```

## 4. Instalación y configuración de MongoDB

1. **Importa la clave pública de MongoDB**:
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
     sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
     --dearmor
   ```

2. **Crea un archivo de lista para MongoDB**:
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Actualiza e instala MongoDB**:
   ```bash
   sudo apt update
   sudo apt install -y mongodb-org
   ```

4. **Inicia y habilita el servicio de MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verifica que MongoDB esté funcionando**:
   ```bash
   sudo systemctl status mongod
   ```

6. **Configura la seguridad de MongoDB**:
   ```bash
   # Crea un usuario administrador
   mongosh --eval "
     db = db.getSiblingDB('admin');
     db.createUser({
       user: 'adminUser',
       pwd: 'TuContraseñaSegura',
       roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ]
     });
   "
   
   # Edita el archivo de configuración para habilitar la autenticación
   sudo nano /etc/mongod.conf
   ```

   Añade o modifica la sección de seguridad:
   ```yaml
   security:
     authorization: enabled
   ```

7. **Reinicia MongoDB para aplicar los cambios**:
   ```bash
   sudo systemctl restart mongod
   ```

8. **Crea una base de datos para la aplicación**:
   ```bash
   mongosh --authenticationDatabase "admin" -u "adminUser" -p "TuContraseñaSegura" --eval "
     db = db.getSiblingDB('reserva_salas');
     db.createUser({
       user: 'reserva_app',
       pwd: 'OtraContraseñaSegura',
       roles: [ { role: 'readWrite', db: 'reserva_salas' } ]
     });
   "
   ```

## 5. Instalación de Node.js y npm

1. **Instala Node.js usando NVM (Node Version Manager)**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   ```

2. **Cierra y vuelve a abrir la terminal, o ejecuta**:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

3. **Instala la versión LTS de Node.js**:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

4. **Verifica la instalación**:
   ```bash
   node -v
   npm -v
   ```

5. **Instala PM2 globalmente para gestionar procesos Node.js**:
   ```bash
   npm install -g pm2
   ```

## 6. Configuración del firewall

1. **Instala y configura UFW (Uncomplicated Firewall)**:
   ```bash
   sudo apt install -y ufw
   ```

2. **Configura reglas básicas**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   ```

3. **Habilita el firewall**:
   ```bash
   sudo ufw enable
   ```

4. **Verifica el estado del firewall**:
   ```bash
   sudo ufw status
   ```

## 7. Despliegue del backend

1. **Crea un directorio para la aplicación**:
   ```bash
   sudo mkdir -p /var/www/reserva-salas
   sudo chown $USER:$USER /var/www/reserva-salas
   ```

2. **Clona el repositorio o transfiere los archivos**:
   ```bash
   # Si usas git:
   cd /var/www/reserva-salas
   git clone [URL-DE-TU-REPOSITORIO] .
   
   # O transfiere los archivos usando SCP desde tu máquina local:
   # (Ejecuta esto en tu máquina local, no en el servidor)
   # scp -r /ruta/local/salas-juntas usuario@ip-servidor:/var/www/reserva-salas
   ```

3. **Configura las variables de entorno para el backend**:
   ```bash
   cd /var/www/reserva-salas/backend
   cp .env.example .env
   nano .env
   ```

   Edita el archivo `.env` con la siguiente configuración:
   ```
   PORT=5000
   MONGODB_URI=mongodb://reserva_app:OtraContraseñaSegura@localhost:27017/reserva_salas
   JWT_SECRET=UnTokenMuySeguroYLargo
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASSWORD=tu_contraseña_de_aplicacion
   NODE_ENV=production
   ```

4. **Instala las dependencias del backend**:
   ```bash
   cd /var/www/reserva-salas/backend
   npm install --production
   ```

5. **Inicia el backend con PM2**:
   ```bash
   pm2 start server.js --name "reserva-salas-backend"
   pm2 save
   pm2 startup
   ```

## 8. Despliegue del frontend

1. **Actualiza la configuración del frontend para producción**:
   ```bash
   cd /var/www/reserva-salas/frontend/salas
   ```

2. **Edita las URLs de la API en el frontend**:
   Busca todas las instancias de `http://localhost:5000` y reemplázalas con la URL de producción:
   ```bash
   find src -type f -name "*.js" -o -name "*.jsx" | xargs sed -i 's|http://localhost:5000|https://tu-dominio.com/api|g'
   ```

3. **Instala las dependencias y construye el frontend**:
   ```bash
   npm install
   npm run build
   ```

4. **El resultado estará en la carpeta `dist` o `build` dependiendo de tu configuración**

## 9. Configuración de Nginx como proxy inverso

1. **Instala Nginx**:
   ```bash
   sudo apt install -y nginx
   ```

2. **Crea una configuración para tu aplicación**:
   ```bash
   sudo nano /etc/nginx/sites-available/reserva-salas
   ```

3. **Añade la siguiente configuración**:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;
       
       # Frontend
       location / {
           root /var/www/reserva-salas/frontend/salas/dist;
           try_files $uri $uri/ /index.html;
           index index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:5000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Habilita la configuración**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/reserva-salas /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 10. Configuración de SSL/TLS con Let's Encrypt

1. **Instala Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtén un certificado SSL**:
   ```bash
   sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

3. **Sigue las instrucciones en pantalla**

4. **Verifica la renovación automática**:
   ```bash
   sudo certbot renew --dry-run
   ```

## 11. Configuración de servicios systemd

1. **Crea un servicio systemd para el backend (alternativa a PM2)**:
   ```bash
   sudo nano /etc/systemd/system/reserva-salas.service
   ```

2. **Añade la siguiente configuración**:
   ```ini
   [Unit]
   Description=Reserva de Salas Backend
   After=network.target mongod.service
   
   [Service]
   Type=simple
   User=tu-usuario
   WorkingDirectory=/var/www/reserva-salas/backend
   ExecStart=/home/tu-usuario/.nvm/versions/node/v18.x.x/bin/node server.js
   Restart=on-failure
   Environment=NODE_ENV=production
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Habilita e inicia el servicio**:
   ```bash
   sudo systemctl enable reserva-salas.service
   sudo systemctl start reserva-salas.service
   ```

4. **Verifica el estado del servicio**:
   ```bash
   sudo systemctl status reserva-salas.service
   ```

## 12. Pruebas finales y verificación

1. **Verifica que el backend esté funcionando**:
   ```bash
   curl http://localhost:5000/api/rooms
   ```

2. **Verifica que Nginx esté sirviendo el frontend**:
   ```bash
   curl -I https://tu-dominio.com
   ```

3. **Prueba la API a través de Nginx**:
   ```bash
   curl -I https://tu-dominio.com/api/rooms
   ```

4. **Verifica los logs del backend**:
   ```bash
   # Si usas PM2
   pm2 logs reserva-salas-backend
   
   # Si usas systemd
   sudo journalctl -u reserva-salas.service -f
   ```

5. **Verifica los logs de Nginx**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

## 13. Mantenimiento y monitoreo

1. **Configura copias de seguridad de MongoDB**:
   ```bash
   # Crea un script de backup
   sudo nano /usr/local/bin/backup-mongodb.sh
   ```

   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/var/backups/mongodb"
   
   # Crea el directorio si no existe
   mkdir -p $BACKUP_DIR
   
   # Realiza el backup
   mongodump --authenticationDatabase admin \
     --username adminUser --password "TuContraseñaSegura" \
     --db reserva_salas --out $BACKUP_DIR/$TIMESTAMP
   
   # Comprime el backup
   tar -zcvf $BACKUP_DIR/$TIMESTAMP.tar.gz $BACKUP_DIR/$TIMESTAMP
   
   # Elimina el directorio original
   rm -rf $BACKUP_DIR/$TIMESTAMP
   
   # Elimina backups más antiguos de 30 días
   find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +30 -delete
   ```

2. **Haz el script ejecutable**:
   ```bash
   sudo chmod +x /usr/local/bin/backup-mongodb.sh
   ```

3. **Configura un cron job para ejecutar el backup diariamente**:
   ```bash
   sudo crontab -e
   ```

   Añade la siguiente línea:
   ```
   0 2 * * * /usr/local/bin/backup-mongodb.sh > /var/log/mongodb-backup.log 2>&1
   ```

4. **Monitoreo con PM2**:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

5. **Actualización del sistema**:
   ```bash
   # Configura actualizaciones automáticas de seguridad
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## Notas adicionales

1. **Cambios en la configuración para producción**:
   - Asegúrate de que todas las URLs en el frontend apunten a tu dominio de producción
   - Configura correctamente las variables de entorno en el archivo `.env`
   - Usa contraseñas fuertes para MongoDB, JWT_SECRET y otras credenciales

2. **Seguridad**:
   - Mantén el sistema actualizado regularmente
   - Monitorea los logs en busca de actividades sospechosas
   - Considera implementar un sistema de monitoreo como Prometheus + Grafana
   - Configura alertas para problemas críticos

3. **Escalabilidad**:
   - Si el tráfico aumenta, considera separar el frontend y el backend en servidores diferentes
   - Para mayor disponibilidad, implementa un clúster de MongoDB

4. **Solución de problemas comunes**:
   - Si el frontend no se conecta al backend, verifica la configuración de CORS y las URLs
   - Si hay problemas con MongoDB, verifica los logs en `/var/log/mongodb/mongod.log`
   - Para problemas con Nginx, revisa `/var/log/nginx/error.log`

---

Esta guía te proporciona los pasos básicos para desplegar tu aplicación de reserva de salas en un entorno de producción en Proxmox. Adapta las configuraciones según tus necesidades específicas y la estructura de tu proyecto.
