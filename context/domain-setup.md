# Custom Domain Mapping for Cloud Run (Subdomain)

Goal: serve the app at `clear-ui.gelatech.com` and redirect `gelatech.com/clear-ui-redesigner` to it. Cloud Run maps whole domains/subdomains (not paths), so we use a subdomain plus a Squarespace redirect.

## Prereqs
- Cloud project: `ai-ac-470019`
- Cloud Run service: `clear-ui-redesigner` in `us-central1`
- gcloud CLI logged in: `gcloud auth login`
- Your Squarespace DNS for `gelatech.com`

## Steps
1) Get the latest build deployed (optional if already deployed)
   ```bash
   npm run deploy
   ```

2) Create Cloud Run domain mapping for the subdomain
   ```bash
   gcloud run domain-mappings create --service clear-ui-redesigner --region us-central1 --domain clear-ui.gelatech.com
   ```
   The command outputs required DNS records (typically a CNAME to `ghs.googlehosted.com` and one or more TXT records for verification). Copy them.

3) Add DNS records in Squarespace
   - In Squarespace DNS for `gelatech.com`, add the CNAME and TXT records exactly as Cloud Run shows.
   - Save and wait for propagation (can be up to ~1 hour).

4) Verify mapping (optional)
   ```bash
   gcloud run domain-mappings list --region us-central1
   ```
   Once DNS is propagated, `https://clear-ui.gelatech.com` should load the app (Cloud Run automatically provisions HTTPS).

5) Add a Squarespace URL redirect for the path
   - In Squarespace URL mappings, add:
     ```
     /clear-ui-redesigner  https://clear-ui.gelatech.com  301
     ```
   - This forwards `https://gelatech.com/clear-ui-redesigner` to the subdomain.

## Notes
- If the domain-mapping command fails due to auth/project, run `gcloud config set project ai-ac-470019` and re-run.
- If you ever change the subdomain, update both the Cloud Run mapping and Squarespace DNS.

