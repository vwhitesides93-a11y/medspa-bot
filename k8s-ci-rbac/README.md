# CI Service Account (Minimal Scope)

This creates a **namespace-scoped** ServiceAccount for GitHub Actions to deploy ONLY within `medspa-ci`.

## Apply
```bash
kubectl apply -f namespace.yaml
kubectl apply -f serviceaccount.yaml
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml
```

## Generate credentials for GitHub Actions (Kubernetes >= 1.24)
Use a **short-lived token** from the ServiceAccount:
```bash
kubectl -n medspa-ci create token medspa-ci
```
Build a kubeconfig file using your cluster details and the token, then paste the file content into the GitHub secret **KUBE_CONFIG**.
