# medspa-bot — Helm Chart

This Helm chart deploys the Med-Spa AI Support Bot with Deployment, Service, Ingress (TLS), HPA, and optional Secret for the OpenAI API key.

## Quick install
```bash
helm repo add myrepo https://example.com/helm-charts
helm install client-a myrepo/medspa-bot -f examples/values-client-a.yaml -n medspa-client-a --create-namespace
```

Or from a local chart folder:
```bash
helm install client-a ./medspa-bot -f examples/values-client-a.yaml -n medspa-client-a --create-namespace
```

## Values
See `values.yaml` for defaults. Override per client using separate values files under `examples/`.

Key values:
- `image.repository`, `image.tag` (set to your GHCR image/tag)
- `ingress.hosts`, `ingress.tls` (set domain + TLS secret)
- `env.bookingUrl` (required)
- `env.corsOrigins` (optional)
- `env.openaiApiKey` (optional; if set, a Secret is created)

## Notes
- Requires Ingress NGINX and cert-manager for TLS with ClusterIssuer `letsencrypt-prod` (or change annotations).
- HPA assumes `metrics-server` is installed.
- For previews, use your CI to render/override `ingress.hosts` dynamically.
