const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const wwwDir = path.join(projectDir, 'www');
const srcDir = path.join(projectDir, 'src');

console.log('Syncing modular src to www...');

fs.mkdirSync(path.join(wwwDir, 'css'), { recursive: true });
fs.mkdirSync(path.join(wwwDir, 'js'), { recursive: true });

// Copy css
if (fs.existsSync(path.join(srcDir, 'css'))) {
  fs.cpSync(path.join(srcDir, 'css'), path.join(wwwDir, 'css'), { recursive: true });
}

// Copy js
if (fs.existsSync(path.join(srcDir, 'js'))) {
  fs.cpSync(path.join(srcDir, 'js'), path.join(wwwDir, 'js'), { recursive: true });
}

// Generate index.html if body.html and scripts.json exist
const bodyFile = path.join(srcDir, 'body.html');
const scriptsFile = path.join(srcDir, 'js', 'scripts.json');

if (fs.existsSync(bodyFile) && fs.existsSync(scriptsFile)) {
  const bodyHtml = fs.readFileSync(bodyFile, 'utf8');
  const scripts = JSON.parse(fs.readFileSync(scriptsFile, 'utf8'));

  const scriptTags = scripts.map(f => `  <script src="js/${f}"></script>`).join('\n');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Share+Tech+Mono&family=Russo+One&family=Oswald:wght@400;700&display=swap">
<title>CALL OF DUTY: TACTICAL OPS</title>
<link rel="stylesheet" href="css/style.css">
<script src="three.min.js"></script>
</head>
<body>
${bodyHtml}

  <!-- Modular Game Scripts -->
${scriptTags}
</body>
</html>
`;

  fs.writeFileSync(path.join(wwwDir, 'index.html'), indexHtml);
  console.log('Updated www/index.html successfully.');
}

console.log('Build complete.');
