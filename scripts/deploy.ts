import { execSync } from 'node:child_process';

type DeployConfig = {
  project: string;
  region: string;
  service: string;
  image: string;
};

const config: DeployConfig = {
  project: 'ai-ac-470019',
  region: 'us-central1',
  service: 'clear-ui-redesigner',
  image: 'gcr.io/ai-ac-470019/clear-ui-redesigner',
};

const run = (cmd: string) => {
  console.log(`\n➡️  ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

const main = () => {
  // Build happens inside Docker, no need to build locally
  try {
    run(`gcloud config set project ${config.project}`);
    run(`gcloud builds submit --tag ${config.image} --quiet`);
    run(
      [
        'gcloud run deploy',
        config.service,
        `--image ${config.image}`,
        '--platform managed',
        `--region ${config.region}`,
        '--allow-unauthenticated',
        '--quiet',
      ].join(' ')
    );
  } catch (err) {
    console.error('\nDeployment failed. Common fix: run `gcloud auth login` and try again.');
    throw err;
  }
};

main();

