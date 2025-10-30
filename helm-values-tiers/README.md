# Helm Values — Pricing Tiers

Use these to standardize per-client **tiers**:

- **Starter**: 1 replica, small resources, no HPA
- **Pro**: 2 replicas, HPA up to 6
- **Enterprise**: 3 replicas, HPA up to 10

## Examples
helm install client-s ./helm-medspa-bot -f helm-values-tiers/values-starter.yaml -n medspa-client-s --create-namespace
helm install client-p ./helm-medspa-bot -f helm-values-tiers/values-pro.yaml -n medspa-client-p --create-namespace
helm install client-e ./helm-medspa-bot -f helm-values-tiers/values-enterprise.yaml -n medspa-client-e --create-namespace

Customize `env.bookingUrl`, `env.corsOrigins`, and uncomment `env.openaiApiKey` as needed.
