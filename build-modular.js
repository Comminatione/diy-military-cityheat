const fs = require('fs');
const path = require('path');

const projectDir = 'C:/Users/HP/.gemini/antigravity/scratch/diy-military';
const srcFile = path.join(projectDir, 'diy-military.source.html');

console.log('Reading source HTML...');
const html = fs.readFileSync(srcFile, 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scripts = [];
let match;
while ((match = regex.exec(html)) !== null) {
  scripts.push(match[1]);
}
console.log('Found', scripts.length, 'scripts.');

const scriptManifest = [];
scripts.forEach((content, idx) => {
  let name = '';
  if (content.includes('AudioManager')) name = 'audio-manager';
  else if (content.includes('GameDatabase')) name = 'game-database';
  else if (content.includes('appleUIEnhancement')) name = 'apple-ui';
  else if (content.includes('BOSS-WAVE TENSION')) name = 'boss-tension';
  else if (content.includes('WAR ZONE')) name = 'fx-warzone';
  else if (content.includes('desert pixel extras')) name = 'fx-desert';
  else if (content.includes('HUD QA')) name = 'hud-qa';
  else if (content.includes('diy_ach_v1')) name = 'achievements';
  else if (content.includes('hotkey-bar')) name = 'hotkey-bar';
  else if (content.includes('bakeOnce')) name = 'bake-util';
  else if (content.includes('window.__engine =')) name = 'engine-bootstrap';
  else if (content.includes('window.__engineErrors')) name = 'engine-runner';
  else if (content.includes('SUPPLY DROP')) name = 'airdrop-addon';
  else if (content.includes('AUTHORED WAVES')) name = 'authored-waves';
  else {
    const modMatch = content.match(/function\*\s*([a-zA-Z0-9_]+)/);
    if (modMatch) {
      name = 'engine-' + modMatch[1];
    } else if (content.includes('/* SOLDIER:')) name = 'enemy-soldier';
    else if (content.includes('/* BERSERKER:')) name = 'enemy-berserker';
    else if (content.includes('/* SNIPER:')) name = 'enemy-sniper';
    else if (content.includes('/* HEAVY:')) name = 'enemy-heavy';
    else if (content.includes('/* BOMBER:')) name = 'enemy-bomber';
    else if (content.includes('/* SHIELD CARRIER:')) name = 'enemy-shield';
    else if (content.includes('/* ELITE:')) name = 'enemy-elite';
    else if (content.includes('/* GHOST:')) name = 'enemy-ghost';
    else if (content.includes('/* JUGGERNAUT:')) name = 'enemy-juggernaut';
    else if (content.includes('/* PHANTOM:')) name = 'enemy-phantom';
    else if (content.includes('/* VRETH ALIENS')) name = 'enemy-vreth';
    else if (content.includes('/* ENEMY REGISTRY')) name = 'enemy-registry';
    else name = 'script-' + idx;
  }

  const filename = String(idx).padStart(2, '0') + '-' + name + '.js';
  fs.writeFileSync(path.join(projectDir, 'src/js', filename), content.trim());
  scriptManifest.push(filename);
});

fs.writeFileSync(path.join(projectDir, 'src/js/scripts.json'), JSON.stringify(scriptManifest, null, 2));

// Generate clean index.html in www
const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
let head = headMatch ? headMatch[1] : '';
// strip style and scripts from head
head = head.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
head = head.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

const bodyFile = path.join(projectDir, 'src/body.html');
const bodyHtml = fs.readFileSync(bodyFile, 'utf8');

const scriptTags = scriptManifest.map(f => `  <script src="js/${f}"></script>`).join('\n');

const newIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${head.trim()}
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${bodyHtml}

  <!-- Modular Scripts -->
${scriptTags}
</body>
</html>
`;

fs.writeFileSync(path.join(projectDir, 'www/index.html'), newIndexHtml);

// Copy css and js into www for immediate packaging/testing
fs.cpSync(path.join(projectDir, 'src/css'), path.join(projectDir, 'www/css'), { recursive: true });
fs.cpSync(path.join(projectDir, 'src/js'), path.join(projectDir, 'www/js'), { recursive: true });

console.log('Modularization complete! www/index.html created.');

