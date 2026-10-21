# Imprint Central Admin

Standalone admin dashboard for the three Imprint applications:

- **HRIS** - people, attendance, leave, overtime, and payroll
- **Production** - orders and shop operations
- **Marketing** - campaigns and customer work

The dashboard checks all three services from inside Kubernetes and provides
links to their local NodePorts. It is a separate login; it does not replace
the login of any connected application and it does not include the biometric
scanner.

## Run locally with Docker

```powershell
docker build -t imprint/central-admin:test .
docker run --rm -p 10000:10000 `
  -e CENTRAL_ADMIN_USERNAME=admin `
  -e CENTRAL_ADMIN_PASSWORD=imprint123 `
  imprint/central-admin:test
```

Open `http://127.0.0.1:10000`. The default local credentials are `admin` /
`imprint123`; change them before using this outside local testing.

## Run in the shared Kubernetes stack

The manifest expects the three application services to already be deployed in
the `imprint-test` namespace with these Kubernetes service names:

| Application | Service DNS | Local link |
| --- | --- | --- |
| HRIS | `http://hris:10000` | `http://127.0.0.1:30080` |
| Production | `http://production:10000` | `http://127.0.0.1:30081` |
| Marketing | `http://marketing:10000` | `http://127.0.0.1:30082` |

Build the image in the same Docker Desktop engine used by Kubernetes, then
create the local-only admin secret and apply the manifest:

```powershell
docker build -t imprint/central-admin:test .

kubectl create namespace imprint-test --dry-run=client -o yaml |
  kubectl apply -f -

kubectl -n imprint-test create secret generic central-admin-credentials `
  --from-literal=username=admin `
  --from-literal=password=imprint123 `
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f kubernetes/central-admin.yaml
kubectl rollout status deployment/central-admin -n imprint-test
kubectl port-forward -n imprint-test service/central-admin 30083:10000
```

Open `http://127.0.0.1:30083`. The dashboard should show the three services as
online when their deployments are running. Keep Docker Desktop and the
`kubectl port-forward` window running while using the local stack.

The HRIS repository's `deploy/kubernetes/start-local.ps1` builds this same
image and applies the complete four-application stack automatically when this
repository is cloned beside HRIS, Production, and Marketing.

You can also start the complete stack from this repository. Clone the four
repositories beside one another:

```text
D:\GitHub\hris
D:\GitHub\production
D:\GitHub\marketing
D:\GitHub\imprint-admin
```

Then run PowerShell from the Central Admin repository:

```powershell
.\setup-local.ps1
```

For a disposable test cluster with default accounts and demo records, run:

```powershell
.\setup-local.ps1 -SeedDefaultAccounts -SeedDemoData
```

The normal command preserves existing Kubernetes database volumes. The demo
option resets the Production business tables before loading demo orders and
runs the Marketing demo seeder. Live database records are not stored in GitHub;
restore a database backup when moving real data to another computer.

If the repositories are in different folders, pass their paths explicitly:

```powershell
.\setup-local.ps1 `
  -HrisPath 'D:\Projects\hris' `
  -ProductionPath 'D:\Projects\production\application' `
  -MarketingPath 'D:\Projects\marketing\temp_app'
```

## Configuration

The image has no third-party runtime dependencies. Set these environment
variables when the service names or public links differ:

- `CENTRAL_ADMIN_USERNAME`, `CENTRAL_ADMIN_PASSWORD`
- `CENTRAL_ADMIN_HRIS_URL`, `CENTRAL_ADMIN_HRIS_HEALTH_URL`
- `CENTRAL_ADMIN_PRODUCTION_URL`, `CENTRAL_ADMIN_PRODUCTION_HEALTH_URL`
- `CENTRAL_ADMIN_MARKETING_URL`, `CENTRAL_ADMIN_MARKETING_HEALTH_URL`

The health URLs are used by the server-side status check. The normal URLs are
the links opened in the browser.
