#!/usr/bin/env node

/**
 * Delete all Cloudflare Pages deployments except b9657cf
 *
 * Setup:
 * 1. Install: npm install node-fetch
 * 2. Set environment variables:
 *    - CLOUDFLARE_API_TOKEN: Your Cloudflare API token
 *    - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
 *    - CLOUDFLARE_PROJECT_NAME: Your Pages project name
 * 3. Run: node delete-cloudflare-deployments.js
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'rathmullan-sailing-notes';
// Keep by commit hash (short SHA), not the UUID deployment id
const KEEP_COMMIT_HASH = 'b9657cf';

if (!API_TOKEN || !ACCOUNT_ID) {
    console.error('Error: Missing required environment variables');
    console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
};

async function listDeployments() {
    console.log('Fetching deployments...');
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`;

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();

        if (!data.success) {
            console.error('Error:', data.errors);
            process.exit(1);
        }

        return data.result;
    } catch (error) {
        console.error('Error fetching deployments:', error);
        process.exit(1);
    }
}

async function deleteDeployment(deploymentId) {
    console.log(`Deleting deployment: ${deploymentId}`);
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${deploymentId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });
        const data = await response.json();

        if (!data.success) {
            console.error(`Failed to delete ${deploymentId}:`, data.errors);
            return false;
        }

        console.log(`✓ Deleted: ${deploymentId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting deployment ${deploymentId}:`, error);
        return false;
    }
}

async function main() {
    console.log(`\nCloudflare Pages Deployment Cleanup`);
    console.log(`Project: ${PROJECT_NAME}`);
    console.log(`Keeping commit: ${KEEP_COMMIT_HASH}\n`);

    const deployments = await listDeployments();

    if (!deployments || deployments.length === 0) {
        console.log('No deployments found');
        return;
    }

    console.log(`Found ${deployments.length} deployments\n`);

    // Keep any deployment whose commit hash matches KEEP_COMMIT_HASH
    const toDelete = deployments.filter(d => {
        const commit = d.commit_hash || d.commit?.id || '';
        return commit !== KEEP_COMMIT_HASH;
    });

    if (toDelete.length === 0) {
        console.log('No deployments to delete (all except b9657cf are already gone)');
        return;
    }

    console.log(`Will delete ${toDelete.length} deployments:\n`);
    toDelete.forEach(d => {
        const commit = d.commit_hash || d.commit?.id || '';
        console.log(`  - ${d.id} commit:${commit} (${new Date(d.created_on).toLocaleDateString()})`);
    });

    const confirm = process.argv[2] === '--force';
    if (!confirm) {
        console.log('\nRun with --force flag to confirm deletion');
        console.log('Example: node delete-cloudflare-deployments.js --force\n');
        return;
    }

    console.log('\nDeleting...\n');

    let deleted = 0;
    for (const deployment of toDelete) {
        const success = await deleteDeployment(deployment.id);
        if (success) deleted++;
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✓ Done! Deleted ${deleted}/${toDelete.length} deployments`);
}

main();
