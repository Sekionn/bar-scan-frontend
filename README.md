# Bar Scan frontend

React and TypeScript frontend built with Vite. In production, the public Nginx LXC terminates HTTPS for `bar-scan.juuls-trinkets.com`; the frontend container listens on private port `8080`.

## Local development

```powershell
npm install
npm run dev
```

Spring is expected at `https://localhost:8080` by default. Override `VITE_DEV_API_TARGET` in `.env.local` when necessary.

## Build the deployable image

No certificate is needed in this image because the public Nginx LXC owns the domain and certificate.

```bash
docker build --pull -t bar-scan-frontend:latest .
```

Optionally export and copy the image to the Docker LXC:

```bash
docker save bar-scan-frontend:latest | gzip > bar-scan-frontend.tar.gz
scp bar-scan-frontend.tar.gz root@DOCKER_LXC_IP:/opt/bar-scan/
```

On the Docker LXC:

```bash
gunzip -c /opt/bar-scan/bar-scan-frontend.tar.gz | docker load

docker run -d \
  --name bar-scan-frontend \
  --restart unless-stopped \
  -p DOCKER_LXC_IP:3000:8080 \
  -e BACKEND_URL=https://bar-scan-api-java.juuls-trinkets.com \
  bar-scan-frontend:latest
```

Replace `DOCKER_LXC_IP` with the Docker LXC's private address. Binding to that address avoids exposing the application on every host interface. Allow port `3000` only from the Nginx LXC in the Proxmox/firewall rules.

To update the container:

```bash
docker build --pull -t bar-scan-frontend:latest .
docker stop bar-scan-frontend
docker rm bar-scan-frontend
# Run the docker run command above again.
```

## Public Nginx LXC

Create DNS records pointing `bar-scan.juuls-trinkets.com` to the public IP that forwards ports 80 and 443 to the Nginx LXC. Configure Nginx to proxy the hostname to `http://DOCKER_LXC_IP:3000`.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bar-scan.juuls-trinkets.com;

    location / {
        proxy_pass http://DOCKER_LXC_IP:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After this HTTP configuration is reachable publicly, obtain and install the certificate on the Nginx LXC:

```bash
sudo certbot --nginx -d bar-scan.juuls-trinkets.com
sudo certbot renew --dry-run
```

Certbot updates Nginx for HTTPS and normally installs automatic renewal. The resulting request path is:

```text
Browser --HTTPS--> Nginx LXC --private HTTP--> frontend container
                                              |
                                              +-- /api/* --> HTTPS Spring API
```

The browser-facing connection is HTTPS. Private HTTP between the two LXCs does not create mixed-content because the browser communicates only with the public Nginx LXC. Do not expose the frontend container directly to the internet.

## Verification

```bash
docker ps --filter name=bar-scan-frontend
docker logs bar-scan-frontend
curl -I http://DOCKER_LXC_IP:3000
curl -I https://bar-scan.juuls-trinkets.com
```

## npm commands

- `npm run dev` - Vite development server
- `npm run build` - production bundle in `dist/`
- `npm run typecheck` - strict TypeScript validation
- `npm run preview` - preview the production bundle
- `npm test` - run Vitest
- `npm run lint` - run ESLint
