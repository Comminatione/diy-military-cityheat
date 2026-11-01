// 3D FPS Tactical Renderer using WebGL & Three.js
// Integrates full 3D first-person camera, animated weapon rig, ADS, tactical crosshair, and 3D enemy world

window.__FPS_ENABLED = true;

class TacticalFPSRenderer {
  constructor() {
    this.container = document.getElementById('screen');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.gun = null;
    this.muzzleFlash = null;
    this.enemyMeshes = new Map();
    this.isADS = false;
    this.pitch = 0;
    this.yaw = 0;
    this.swayX = 0;
    this.swayY = 0;
    this.recoilZ = 0;
    this.baseFov = 75;
    this.adsFov = 45;
    
    // Look sensitivity
    this.lookSensitivity = 0.0035;
    this.touchLookId = null;
    this.lastTouchX = 0;
    this.lastTouchY = 0;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('THREE.js not loaded yet, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1117);
    this.scene.fog = new THREE.FogExp2(0x0e1117, 0.015);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.7, 0); // eye level

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Replace 2D canvas with WebGL canvas
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) {
      oldCanvas.style.display = 'none';
    }
    this.renderer.domElement.id = 'fps-webgl-canvas';
    this.renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:1;display:block;touch-action:none;';
    this.container.insertBefore(this.renderer.domElement, this.container.firstChild);

    // 4. Lighting (Dramatic Modern Warfare Atmosphere)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x1a202c, 0.6);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
    sun.position.set(40, 60, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 150;
    const d = 50;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    // 5. Tactical Ground & Environment
    this.buildMap();

    // 6. 3D First-Person Weapon Rig
    this.buildWeaponRig();

    // 7. Touch & Mouse Look Handlers
    this.bindControls();

    // Resize handler
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hook loop
    this.animate();
    console.log('Tactical 3D FPS Engine Initialized.');
  }

  buildMap() {
    // Military concrete ground
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid lines for tactical aesthetic
    const grid = new THREE.GridHelper(300, 60, 0xe6c35c, 0x2b3442);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // Tactical Barriers & Containers
    const boxGeo = new THREE.BoxGeometry(4, 3, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x3a4454, roughness: 0.6, metalness: 0.4 });
    const rustMat = new THREE.MeshStandardMaterial({ color: 0x6e3b24, roughness: 0.9, metalness: 0.1 });

    const barrierPositions = [
      [0, 1.5, -15], [-12, 1.5, -25], [14, 1.5, -20],
      [-22, 1.5, -10], [20, 1.5, -35], [0, 1.5, -45],
      [-8, 1.5, 12], [16, 1.5, 15], [-18, 1.5, 25]
    ];

    barrierPositions.forEach(([x, y, z], idx) => {
      const barrier = new THREE.Mesh(boxGeo, idx % 2 === 0 ? boxMat : rustMat);
      barrier.position.set(x, y, z);
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      this.scene.add(barrier);
    });
  }

  buildWeaponRig() {
    // Tactical Assault Rifle Rig attached to camera
    const gunGroup = new THREE.Group();
    
    // Receiver
    const bodyGeo = new THREE.BoxGeometry(0.08, 0.12, 0.45);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.3, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    gunGroup.add(body);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.2, metalness: 0.9 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.35);
    gunGroup.add(barrel);

    // Magazine
    const magGeo = new THREE.BoxGeometry(0.05, 0.18, 0.1);
    const magMat = new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.7, metalness: 0.3 });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0, -0.12, -0.05);
    mag.rotation.x = 0.2;
    gunGroup.add(mag);

    // Holosight / Red Dot Sight
    const sightBaseGeo = new THREE.BoxGeometry(0.06, 0.04, 0.12);
    const sightBase = new THREE.Mesh(sightBaseGeo, bodyMat);
    sightBase.position.set(0, 0.08, -0.05);
    gunGroup.add(sightBase);

    const reticleGeo = new THREE.RingGeometry(0.008, 0.012, 16);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xff3300, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(0, 0.11, -0.1);
    gunGroup.add(reticle);

    // Muzzle Flash
    const flashGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.position.set(0, 0.02, -0.55);
    gunGroup.add(this.muzzleFlash);

    // Position gun in front of camera (Hip-fire default)
    gunGroup.position.set(0.24, -0.22, -0.45);
    this.camera.add(gunGroup);
    this.scene.add(this.camera);

    this.gun = gunGroup;
  }

  bindControls() {
    // Touch Drag on right half of screen controls 3D Camera Look
    window.addEventListener('touchstart', (e) => {
      for (let t of e.changedTouches) {
        if (t.clientX > window.innerWidth * 0.45 && this.touchLookId === null) {
          this.touchLookId = t.identifier;
          this.lastTouchX = t.clientX;
          this.lastTouchY = t.clientY;
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === this.touchLookId) {
          const dx = t.clientX - this.lastTouchX;
          const dy = t.clientY - this.lastTouchY;
          this.yaw -= dx * this.lookSensitivity;
          this.pitch -= dy * this.lookSensitivity;
          this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch));
          this.lastTouchX = t.clientX;
          this.lastTouchY = t.clientY;
        }
      }
    }, { passive: true });

    const endLook = (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === this.touchLookId) {
          this.touchLookId = null;
        }
      }
    };
    window.addEventListener('touchend', endLook, { passive: true });
    window.addEventListener('touchcancel', endLook, { passive: true });

    // Aim Down Sights (ADS) button handler
    const adsBtn = document.getElementById('btn-ads') || this.createADSButton();
    const toggleADS = (e) => {
      if (e) e.preventDefault();
      this.isADS = !this.isADS;
      if (adsBtn) adsBtn.classList.toggle('active', this.isADS);
      if (typeof vibrate === 'function') vibrate(15);
    };
    adsBtn.addEventListener('touchstart', toggleADS, { passive: false });
    adsBtn.addEventListener('click', toggleADS);
  }

  createADSButton() {
    const btn = document.createElement('button');
    btn.id = 'btn-ads';
    btn.innerHTML = 'ADS';
    btn.style.cssText = `
      position: fixed;
      right: 130px;
      bottom: 45px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(230, 195, 92, 0.2);
      border: 2px solid #e6c35c;
      color: #e6c35c;
      font-family: "Oswald", sans-serif;
      font-weight: bold;
      font-size: 16px;
      z-index: 100;
      touch-action: manipulation;
    `;
    document.body.appendChild(btn);
    return btn;
  }

  triggerRecoil() {
    this.recoilZ = 0.12;
    this.pitch += 0.035;
    if (this.muzzleFlash) {
      this.muzzleFlash.material.opacity = 1;
      setTimeout(() => { if (this.muzzleFlash) this.muzzleFlash.material.opacity = 0; }, 40);
    }
  }

  updateEnemies() {
    const E = window.__engine || {};
    const B = E.buildings || {};
    const enemies = B.enemies || [];

    const activeIds = new Set();

    enemies.forEach((en, i) => {
      if (!en.alive) return;
      const id = en.id || i;
      activeIds.add(id);

      let mesh = this.enemyMeshes.get(id);
      if (!mesh) {
        // Create 3D Tactical Opponent Mesh
        const g = new THREE.Group();
        // Body (Tactical Camo Silhouette)
        const torso = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.25, 1.1, 8),
          new THREE.MeshStandardMaterial({ color: en.boss ? 0xcc2200 : 0x2b382d, roughness: 0.6 })
        );
        torso.position.y = 0.9;
        torso.castShadow = true;
        g.add(torso);

        // Head / Helmet
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x1a201c, roughness: 0.4 })
        );
        head.position.y = 1.6;
        head.castShadow = true;
        g.add(head);

        // Weapon
        const gun = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.5),
          new THREE.MeshStandardMaterial({ color: 0x050505 })
        );
        gun.position.set(0.3, 1.0, 0.3);
        g.add(gun);

        this.scene.add(g);
        mesh = g;
        this.enemyMeshes.set(id, mesh);
      }

      // Sync 2D game coordinates into 3D world space
      // Scale: 1 game unit = 0.1 3D units
      const targetX = (en.x - (B.player ? B.player.x : 0)) * 0.15;
      const targetZ = (en.y - (B.player ? B.player.y : 0)) * 0.15;
      mesh.position.set(this.camera.position.x + targetX, 0, this.camera.position.z + targetZ);
      mesh.lookAt(this.camera.position.x, 1.2, this.camera.position.z);
    });

    // Remove dead enemy meshes
    for (const [id, mesh] of this.enemyMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.enemyMeshes.delete(id);
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.camera || !this.renderer) return;

    // Camera rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Smooth ADS FOV Transition & Gun Placement
    const targetFov = this.isADS ? this.adsFov : this.baseFov;
    this.camera.fov += (targetFov - this.camera.fov) * 0.2;
    this.camera.updateProjectionMatrix();

    if (this.gun) {
      const targetPos = this.isADS 
        ? new THREE.Vector3(0, -0.09, -0.28) // Perfectly centered down sights
        : new THREE.Vector3(0.24, -0.22, -0.45); // Hip fire position
      
      this.gun.position.lerp(targetPos, 0.22);
      this.gun.position.z += this.recoilZ;
      this.recoilZ *= 0.7; // decay recoil
    }

    // Sync 3D enemies
    this.updateEnemies();

    // Render WebGL
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate 3D FPS when engine starts
window.addEventListener('load', () => {
  setTimeout(() => {
    window.__tacticalFPS = new TacticalFPSRenderer();
  }, 400);
});

