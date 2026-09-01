/**
 * Downloads n8n integration icons from https://n8n.io/nodes/<slug>.svg and
 * writes them to public/icons/nodes/<nodeKey>.svg, keyed by the node key that
 * the backend stores (last segment of the n8n node type, e.g. "googleSheets").
 *
 * It also (re)generates src/utils/nodeIconManifest.json with the successful
 * key -> public path mappings, which nodeIcons.tsx consumes.
 *
 *   node scripts/fetch-node-icons.mjs
 *
 * Safe to re-run. Add keys to NODE_KEYS or fixes to SLUG_OVERRIDES and re-run.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons/nodes');
const MANIFEST = resolve(__dirname, '../src/utils/nodeIconManifest.json');

// Node keys we want icons for (camelCase last segment of the n8n node type).
const NODE_KEYS = [
  'slack', 'gmail', 'googleSheets', 'googleDrive', 'googleCalendar', 'googleDocs',
  'googleBigQuery', 'gSuiteAdmin', 'telegram', 'discord', 'notion', 'airtable',
  'hubspot', 'salesforce', 'stripe', 'shopify', 'wooCommerce', 'mailchimp',
  'sendGrid', 'twilio', 'github', 'gitlab', 'jira', 'trello', 'asana', 'clickUp',
  'mondayCom', 'linear', 'zendesk', 'intercom', 'openAi', 'anthropic',
  'huggingFace', 'perplexity', 'cohere', 'mistralAi', 'postgres', 'mySql',
  'mongoDb', 'redis', 'elasticsearch', 'supabase', 'snowflake', 'aws', 'awsS3',
  'awsSes', 'awsSqs', 'awsLambda', 'microsoftOutlook', 'microsoftTeams',
  'microsoftExcel', 'microsoftOneDrive', 'dropbox', 'box', 'zoom', 'calendly',
  'typeform', 'jotform', 'webflow', 'wordpress', 'ghost', 'medium', 'twitter',
  'linkedIn', 'facebookGraphApi', 'youTube', 'reddit', 'whatsApp', 'pipedrive',
  'zohoCrm', 'freshdesk', 'freshworksCrm', 'activeCampaign', 'sendInBlue',
  'brevo', 'clearbit', 'mattermost', 'rocketChat', 'pagerDuty', 'spotify',
  'quickbooks', 'xero', 'coinGecko', 'nocoDb', 'baserow', 'strapi', 'contentful',
  'sanity', 'algolia', 'segment', 'mixpanel', 'posthog', 'amplitude', 'grafana',
  'homeAssistant', 'nextCloud', 'bitwarden', 'onfleet', 'clockify', 'harvest',
  'toggl', 'bamboohr', 'gumroad', 'lemlist', 'apitemplateIo', 'bannerbear',
  'cloudinary', 'awsRekognition', 'googleTranslate', 'deepL', 'phantombuster',
];

// Where camelCase -> kebab-case does not match the n8n.io slug.
const SLUG_OVERRIDES = {
  openAi: 'openai',
  mySql: 'mysql',
  mongoDb: 'mongodb',
  wooCommerce: 'woocommerce',
  sendGrid: 'sendgrid',
  clickUp: 'clickup',
  nocoDb: 'nocodb',
  deepL: 'deepl',
  mistralAi: 'mistral',
  huggingFace: 'hugging-face',
  facebookGraphApi: 'facebook-graph-api',
  zohoCrm: 'zoho-crm',
  freshworksCrm: 'freshworks-crm',
  sendInBlue: 'sendinblue',
  awsS3: 'aws-s3',
  awsSes: 'aws-ses',
  awsSqs: 'aws-sqs',
  awsLambda: 'aws-lambda',
  awsRekognition: 'aws-rekognition',
  apitemplateIo: 'apitemplate-io',
  googleBigQuery: 'google-bigquery',
  gSuiteAdmin: 'g-suite-admin',
  bamboohr: 'bamboohr',
  quickbooks: 'quickbooks-online',
};

const camelToKebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();

async function tryFetch(slug) {
  const url = `https://n8n.io/nodes/${slug}.svg`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.trimStart().startsWith('<svg')) return null;
  return text;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = {};
  let ok = 0;
  let miss = 0;

  for (const key of NODE_KEYS) {
    const candidates = [
      SLUG_OVERRIDES[key],
      camelToKebab(key),
      key.toLowerCase(),
    ].filter(Boolean);

    let svg = null;
    let used = null;
    for (const slug of [...new Set(candidates)]) {
      svg = await tryFetch(slug);
      if (svg) {
        used = slug;
        break;
      }
    }

    if (svg) {
      await writeFile(resolve(OUT_DIR, `${key}.svg`), svg, 'utf8');
      manifest[key] = `/icons/nodes/${key}.svg`;
      ok++;
      console.log(`ok   ${key.padEnd(22)} <- ${used}`);
    } else {
      miss++;
      console.log(`miss ${key}`);
    }
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort());
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`\n${ok} icons written, ${miss} missing. Manifest: ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
