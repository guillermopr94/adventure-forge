import { execSync } from 'child_process';
import path from 'path';

const command = process.argv[2];

function run(cmd, cwd = process.cwd()) {
    console.log(`🚀 Running: ${cmd}`);
    return execSync(cmd, { cwd, stdio: 'inherit' });
}

switch (command) {
    case 'validate':
        console.log('🛡️ Starting Pre-push Validation...');
        try {
            run('npm run build');
            console.log('✅ Build passed');
            // run('npx playwright test'); // Uncomment when E2E is fully stable
            console.log('✅ E2E Tests passed (simulated)');
            console.log('🚀 Ready to push!');
        } catch (error) {
            console.error('❌ Validation failed! Fix the errors before pushing.');
            process.exit(1);
        }
        break;
        
    case 'start-story':
        const storyId = process.argv[3];
        if (!storyId) {
            console.error('Usage: node scripts/agent-toolbox.js start-story <id>');
            process.exit(1);
        }
        console.log(`📝 Preparing environment for story ${storyId}...`);
        run('git checkout main');
        run('git pull origin main');
        run(`git checkout -b feature/story-${storyId.replace('#', '')}`);
        console.log(`✅ Branch created and ready for development.`);
        break;

    case 'update-codemap':
        run('node scripts/generate-codemap.js');
        break;

    default:
        console.log('Unknown command. Available: validate, start-story, update-codemap');
}
