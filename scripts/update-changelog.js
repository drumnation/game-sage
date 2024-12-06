import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Get the new version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const newVersion = packageJson.version;

// Get the current date
const date = new Date().toISOString().split('T')[0];

// Read the current changelog
const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Get all commits since the last tag
const getCommitsSinceLastTag = () => {
    try {
        const lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
        return execSync(`git log ${lastTag}..HEAD --pretty=format:"- %s"`).toString().trim();
    } catch (error) {
        // If no tags exist, get all commits
        return execSync('git log --pretty=format:"- %s"').toString().trim();
    }
};

// Categorize commits based on conventional commit types
const categorizeCommits = (commits) => {
    const categories = {
        Added: [],
        Changed: [],
        Deprecated: [],
        Removed: [],
        Fixed: [],
        Security: [],
    };

    commits.split('\n').forEach(commit => {
        if (commit.startsWith('- feat')) {
            categories.Added.push(commit.replace('- feat:', '-'));
        } else if (commit.startsWith('- fix')) {
            categories.Fixed.push(commit.replace('- fix:', '-'));
        } else if (commit.startsWith('- chore')) {
            categories.Changed.push(commit.replace('- chore:', '-'));
        } else if (commit.startsWith('- refactor')) {
            categories.Changed.push(commit.replace('- refactor:', '-'));
        } else if (commit.startsWith('- style')) {
            categories.Changed.push(commit.replace('- style:', '-'));
        } else if (commit.startsWith('- perf')) {
            categories.Changed.push(commit.replace('- perf:', '-'));
        } else if (commit.startsWith('- security')) {
            categories.Security.push(commit.replace('- security:', '-'));
        }
    });

    return categories;
};

// Get and categorize commits
const commits = getCommitsSinceLastTag();
const categories = categorizeCommits(commits);

// Create the new version entry
let newEntry = `\n## [${newVersion}] - ${date}\n`;

// Add categorized changes
Object.entries(categories).forEach(([category, changes]) => {
    if (changes.length > 0) {
        newEntry += `\n### ${category}\n${changes.join('\n')}\n`;
    }
});

// Insert the new entry after the Unreleased section
const unreleasedRegex = /## \[Unreleased\][^\n]*\n(?:### \w+[^\n]*(?:\n(?!## ).*)*\n*)*\n*/;
changelog = changelog.replace(
    unreleasedRegex,
    `## [Unreleased]\n\n${newEntry}\n`
);

// Write the updated changelog
fs.writeFileSync(changelogPath, changelog); 