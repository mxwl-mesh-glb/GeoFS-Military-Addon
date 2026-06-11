// ==UserScript==
// @name         GeoFS Military Addon for 4
// @namespace    https://geo-fs.com/
// @version      0.0.1.5
// @description  Military addon. for better GeoFS military experience
// @author       Maxwell_The_Cat
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://beta.geo-fs.com/geofs.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function waitForGeofs(cb) {
    const t = setInterval(() => {
      if (
        window.geofs && geofs.aircraft && geofs.aircraft.instance &&
        geofs.api && geofs.api.viewer &&
        window.Cesium && Cesium.SceneTransforms &&
        window.ui && window.multiplayer && multiplayer.contrailEmitters
      ) { clearInterval(t); cb(); }
    }, 500);
  }

  waitForGeofs(init);

  function init() {
    console.log('%c[Missile Addon v9.5] Ready.', 'color:lime;font-family:monospace');

    const BASE = 'https://raw.githubusercontent.com/amrsherif2422011-cloud/REALADDONMODELS/main/';

    function lodUrls(name) {
      return [
        `${BASE}${name}.glb`,
        `${BASE}${name}-LOD1.glb`,
        `${BASE}${name}-LOD2.glb`,
        `${BASE}${name}-LOD3.glb`,
        `${BASE}${name}-LOD4.glb`,
      ];
    }

    // ── Missile definitions ───────────────────────────────────────────────
    const MISSILE_DEFS = [
      { name: 'AIM-9',   counter: 'flares', lod: lodUrls('AIM-9')   },
      { name: 'AIM-9C',  counter: 'chaff',  lod: lodUrls('AIM-9C')  },
      { name: 'AIM-120', counter: 'chaff',  lod: lodUrls('AIM-120') },
      { name: 'R-27EA',  counter: 'chaff',  lod: lodUrls('R-27EA')  },
      { name: 'R-27R',   counter: 'chaff',  lod: lodUrls('R-27R')   },
      { name: 'R-27T',   counter: 'flares', lod: lodUrls('R-27T')   },
      { name: 'R-33',    counter: 'chaff',  lod: lodUrls('R-33')    },
      { name: 'R-73',    counter: 'flares', lod: lodUrls('R-73')    },
      { name: 'R-77',    counter: 'chaff',  lod: lodUrls('R-77')    },
    ];

    // LOD distance thresholds (metres from camera)
    const LOD_DISTS = [150, 400, 1000, 3000]; // LOD0<150, LOD1<400, LOD2<1000, LOD3<3000, hidden>=3000
    const LOD_PERF_CAP = 50; // if >50 models below 400m, bump LOD0->1, LOD1->2

    // ── Aircraft hardpoint configs ────────────────────────────────────────
    const AIRCRAFT_HARDPOINTS = {
      '18': { // Su-35
        maxMissiles: 14, maxTypes: 3,
        slots: [
          { r:  2.8, f: -1,   u: 0,    hasPylon: true  },
          { r:  4.0, f: -2,   u: 0,    hasPylon: true  },
          { r:  5.2, f: -2.5, u: 0,    hasPylon: true  },
          { r: -2.8, f: -1,   u: 0,    hasPylon: true  },
          { r: -4.0, f: -2,   u: 0,    hasPylon: true  },
          { r: -5.2, f: -2.5, u: 0,    hasPylon: true  },
          { r:  7.2, f: -2.0, u: 0,    hasPylon: false },
          { r: -7.2, f: -2.0, u: 0,    hasPylon: false },
          { r:  1.2, f:  0,   u: -1,   hasPylon: false },
          { r: -1.2, f:  0,   u: -1,   hasPylon: false },
          { r:  1.2, f: -5,   u: -1,   hasPylon: false },
          { r: -1.2, f: -5,   u: -1,   hasPylon: false },
          { r:  0.4, f:  1,   u: -0.5, hasPylon: false },
          { r: -0.4, f:  1,   u: -0.5, hasPylon: false },
        ],
      },
      '7': { // F-16
        maxMissiles: 6, maxTypes: 3,
        slots: [
          { r:  2.5, f: -0.5, u: -0.2, hasPylon: true  },
          { r:  4.0, f: -2,   u: -0.2, hasPylon: true  },
          { r: -2.5, f: -0.5, u: -0.2, hasPylon: true  },
          { r: -4.0, f: -2,   u: -0.2, hasPylon: true  },
          { r:  5.3, f: -2,   u: 0,    hasPylon: false },
          { r: -5.3, f: -2,   u: 0,    hasPylon: false },
        ],
      },
      '27': { // F/A-18
        maxMissiles: 8, maxTypes: 3,
        slots: [
          { r:  2.5, f: -1,   u: -0.5,    hasPylon: true  },
          { r:  4.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r:  5.8, f: -2,   u: -0.5,    hasPylon: true  },
          { r: -2.5, f: -1,   u: -0.5,    hasPylon: true  },
          { r: -4.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r: -5.8, f: -2,   u: -0.5,    hasPylon: true  },
          { r:  6.9, f: -2.5, u: -0.25,    hasPylon: false },
          { r: -6.9, f: -2.5, u: -0.25,    hasPylon: false },
        ],
      },
      '29': { // Rafale
        maxMissiles: 6, maxTypes: 3,
        slots: [
          { r:  2.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r:  3.8, f: -2,   u: -0.53,    hasPylon: true  },
          { r: -2.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r: -3.8, f: -2,   u: -0.53,    hasPylon: true  },
          { r:  5.1, f: -3,   u: -0.25,    hasPylon: false },
          { r: -5.1, f: -3,   u: -0.25,    hasPylon: false },
        ],
      },
    };

    // ── Loadout state ─────────────────────────────────────────────────────
    let loadout = [
      { ...MISSILE_DEFS.find(m => m.name === 'AIM-120'), count: 5 },
      { ...MISSILE_DEFS.find(m => m.name === 'R-77'),    count: 5 },
      { ...MISSILE_DEFS.find(m => m.name === 'R-73'),    count: 4 },
    ];
    let activeSlotIdx = 0;

    function getFlatLoadout() {
      const flat = [];
      loadout.forEach(slot => { for (let i = 0; i < slot.count; i++) flat.push(slot); });
      return flat;
    }

    function getNextMissile() {
      if (loadout[activeSlotIdx] && loadout[activeSlotIdx].count > 0) return loadout[activeSlotIdx];
      for (const slot of loadout) { if (slot.count > 0) return slot; }
      return null;
    }

    function consumeMissile() {
      let slot = loadout[activeSlotIdx];
      if (!slot || slot.count === 0) slot = loadout.find(s => s.count > 0);
      if (!slot) return;
      slot.count--;
      
      for (let i = hpSlots.length - 1; i >= 0; i--) {
        if (hpSlots[i].missile && hpSlots[i].missile.name === slot.name) {
          hpSlots[i].missile = null;
          hpSlots[i].lods.forEach(m => { if (m) m.show = false; });
          break;
        }
      }
      if (slot.count === 0) {
        loadout = loadout.filter(s => s.count > 0);
        activeSlotIdx = Math.min(activeSlotIdx, loadout.length - 1);
      }
    }

    function totalMissiles() { return loadout.reduce((s, slot) => s + slot.count, 0); }

    function cycleSlot(dir) {
      if (loadout.length === 0) return;
      activeSlotIdx = (activeSlotIdx + dir + loadout.length) % loadout.length;
      activeMissile = loadout[activeSlotIdx];
      updateHUD();
      showNotif(`Selected: ${activeMissile.name}`, '#00ff41');
    }

    // ── Hardpoint model system ────────────────────────────────────────────
    // Each slot has 5 LOD models preloaded + 1 pylon
    // hpSlots[i] = { lods: [model0..4], pylon, missile: ref or null }
    let hpSlots = [];

    function getHPConfig() {
      return AIRCRAFT_HARDPOINTS[geofs.aircraft.instance.id] || null;
    }

    function createPylonPrimitive(callback) {
      Cesium.Model.fromGltfAsync({
        url: 'https://raw.githubusercontent.com/amrsherif2422011-cloud/REALADDONMODELS/main/hardpoints.glb',
        minimumPixelSize: 32,
        maximumScale: 500,
        modelMatrix: Cesium.Matrix4.IDENTITY.clone(),
      }).then(model => {
        geofs.api.viewer.scene.primitives.add(model);
        callback(model);
      }).catch(() => callback(null));
    }

    function rebuildHardpointModels() {
      // Destroy existing
      hpSlots.forEach(slot => {
        slot.lods.forEach(m => { try { geofs.api.viewer.scene.primitives.remove(m); } catch(e) {} });
        if (slot.pylon) try { geofs.api.viewer.scene.primitives.remove(slot.pylon); } catch(e) {}
      });
      hpSlots = [];

      const cfg = getHPConfig();
      if (!cfg) return;

      const flat = getFlatLoadout();

      cfg.slots.forEach((slotCfg, i) => {
        const missile = flat[i] || null;
        const slotObj = { lods: [], pylon: null, missile, cfg: slotCfg, activeLod: -1 };

        // Pylon — async GLB load via callback
        if (slotCfg.hasPylon) {
          createPylonPrimitive(model => { slotObj.pylon = model; });
        }
        // there should be a blank line here, then:
        if (missile && missile.lod) {
          missile.lod.forEach((url, li) => {
            Cesium.Model.fromGltfAsync({
              url,
              minimumPixelSize: 32,
              maximumScale: 500,
              modelMatrix: Cesium.Matrix4.IDENTITY.clone(),
            }).then(model => {
              model.show = false;
              geofs.api.viewer.scene.primitives.add(model);
              slotObj.lods[li] = model;
            });
          });
        }

        hpSlots[i] = slotObj;
      });
    }

    // ── Frame callback — LOD + position update ────────────────────────────
    geofs.api.addFrameCallback(function() {
      const cfg = getHPConfig();
      if (!cfg) return;

      const lla    = geofs.aircraft.instance.llaLocation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enuToEcef = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const wr     = geofs.aircraft.instance.object3d.worldRotation;

      const rE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[0][0], wr[0][1], wr[0][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());
      const fE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());
      const uE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[2][0], wr[2][1], wr[2][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());

      const rot = new Cesium.Matrix3(
        rE.x, fE.x, uE.x,
        rE.y, fE.y, uE.y,
        rE.z, fE.z, uE.z
      );

      // Camera position + direction for culling
      const cam    = geofs.api.viewer.scene.camera;
      const camPos = cam.position;
      const camDir = cam.direction;

      // Count models below 400m for perf cap
      let below400 = 0;
      hpSlots.forEach(slot => {
        if (!slot.missile) return;
        const o = slot.cfg;
        const wx = origin.x + rE.x*o.r + fE.x*o.f + uE.x*o.u;
        const wy = origin.y + rE.y*o.r + fE.y*o.f + uE.y*o.u;
        const wz = origin.z + rE.z*o.r + fE.z*o.f + uE.z*o.u;
        const dx = wx - camPos.x, dy = wy - camPos.y, dz = wz - camPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 400) below400++;
      });
      const perfBump = below400 > LOD_PERF_CAP ? 1 : 0;

      hpSlots.forEach(slot => {
        const o = slot.cfg;
        const wx = origin.x + rE.x*o.r + fE.x*o.f + uE.x*o.u;
        const wy = origin.y + rE.y*o.r + fE.y*o.f + uE.y*o.u;
        const wz = origin.z + rE.z*o.r + fE.z*o.f + uE.z*o.u;
        const translation = new Cesium.Cartesian3(wx, wy, wz);
        const mat = Cesium.Matrix4.fromRotationTranslation(rot, translation);

        // Update pylon
        if (slot.pylon) slot.pylon.modelMatrix = mat;

        // No missile in this slot
        if (!slot.missile || slot.lods.length === 0) return;

        // Distance from camera
        const dx   = wx - camPos.x, dy = wy - camPos.y, dz = wz - camPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Camera culling — dot product of (missile - cam) with camDir
        const dotX = dx/dist, dotY = dy/dist, dotZ = dz/dist;
        const dot  = dotX*camDir.x + dotY*camDir.y + dotZ*camDir.z;
        const behindCamera = dot < -0.1;

        // Hidden beyond 3000m or behind camera
        if (dist >= 3000 || behindCamera) {
          slot.lods.forEach(m => { if (m) m.show = false; });
          return;
        }

        // Pick LOD level
        let lodIdx = 4;
        if      (dist < LOD_DISTS[0]) lodIdx = 0;
        else if (dist < LOD_DISTS[1]) lodIdx = 1;
        else if (dist < LOD_DISTS[2]) lodIdx = 2;
        else if (dist < LOD_DISTS[3]) lodIdx = 3;

        // Apply perf bump (only affects LOD0 and LOD1)
        if (lodIdx < 2) lodIdx = Math.min(lodIdx + perfBump, 4);

        // Show correct LOD, hide others
        slot.lods.forEach((m, li) => {
          if (!m) return;
          if (li === lodIdx) {
            m.show = true;
            m.modelMatrix = mat;
          } else {
            m.show = false;
          }
        });
      });
    });

    rebuildHardpointModels();

    // ── Constants ─────────────────────────────────────────────────────────
    const RANGE_M       = 50000;
    const MISSILE_SPEED = 8000 * 1000 / 3600;
    const FIRE_COOLDOWN = 10000;
    const LOCK_PX       = 200;

    // ── State ─────────────────────────────────────────────────────────────
    let armed           = false;
    let lockedPlayer    = null;
    let activeMissile   = loadout[0] || null;
    let blinkTimer      = null;
    let outerBlinkTimer = null;
    let scanRAF         = null;
    let nosePos         = { x: 0, y: 0 };
    let lastFireTime    = 0;

    // ── Audio ─────────────────────────────────────────────────────────────
    const SOUND_URL = 'https://raw.githubusercontent.com/amrsherif2422011-cloud/missile-launch/main/freesound_community-missile-firing-fl-106655.mp3';
    let launchAudioBuffer = null;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    fetch(SOUND_URL)
      .then(r => r.arrayBuffer())
      .then(ab => audioCtx.decodeAudioData(ab))
      .then(buf => { launchAudioBuffer = buf; })
      .catch(e => console.warn('[Missile Addon] Could not load launch sound:', e));

    function playLaunchSound() {
      if (!launchAudioBuffer) return;
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const src = audioCtx.createBufferSource();
        src.buffer = launchAudioBuffer;
        src.connect(audioCtx.destination);
        src.start(0);
      } catch (e) {}
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    function isOnScreen(p) {
      return p && p.x >= 0 && p.y >= 0 &&
             p.x <= window.innerWidth && p.y <= window.innerHeight;
    }

    function getLivePosition(id) {
      try {
        const user = multiplayer.users && multiplayer.users[id];
        if (user && user.referencePoint && user.referencePoint.lla) {
          const lla = user.referencePoint.lla;
          if (lla[0] && lla[1]) return { lat: lla[0], lon: lla[1], altMeters: lla[2] || 3000 };
        }
        return null;
      } catch (e) { return null; }
    }

    function getPlayerLLA(marker, id) {
      if (id) { const live = getLivePosition(id); if (live) return live; }
      try {
        const ll = marker._marker._latlng;
        if (!ll) return null;
        const label = marker.label || '';
        const flM   = label.match(/FL(\d+)/);
        const ftM   = label.match(/([\d.]+)ft/);
        const altM  = flM ? parseInt(flM[1]) * 100 * 0.3048
                    : ftM ? parseFloat(ftM[1]) * 0.3048 : 3000;
        return { lat: ll.lat, lon: ll.lng, altMeters: altM };
      } catch (e) { return null; }
    }

    function getCallsign(marker) {
      const label = marker.label || '';
      return label.split('<br/>')[0].replace(/<[^>]+>/g, '').trim() || 'UNKNOWN';
    }

    function haversineM(lat1, lon1, lat2, lon2) {
      const R    = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a    = Math.sin(dLat/2)**2 +
                   Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
                   Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function getNoseScreenPos() {
      try {
        const scene  = geofs.api.viewer.scene;
        const lla    = geofs.aircraft.instance.llaLocation;
        const wr     = geofs.aircraft.instance.object3d.worldRotation;
        const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
        const enu    = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        const fE = Cesium.Cartesian3.normalize(
          Cesium.Matrix4.multiplyByPointAsVector(enu,
            new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]),
            new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        );
        const nosePoint = new Cesium.Cartesian3(
          origin.x + fE.x * 500000,
          origin.y + fE.y * 500000,
          origin.z + fE.z * 500000
        );
        const screen = Cesium.SceneTransforms.worldToWindowCoordinates(scene, nosePoint);
        if (!screen || isNaN(screen.x) || isNaN(screen.y)) return null;
        return screen;
      } catch (e) { return null; }
    }

    function getPlayerScreenPos(marker, id) {
      try {
        const lla = getPlayerLLA(marker, id);
        if (!lla) return null;
        return Cesium.SceneTransforms.worldToWindowCoordinates(
          geofs.api.viewer.scene,
          Cesium.Cartesian3.fromDegrees(lla.lon, lla.lat, lla.altMeters)
        ) || null;
      } catch (e) { return null; }
    }

    function screenDist(a, b) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function findClosestToNose(np) {
      const markers = window.ui && ui.playerMarkers;
      if (!markers || !np) return null;
      const myLLA = geofs.aircraft.instance.llaLocation;
      let best = null, bestSD = LOCK_PX;
      Object.entries(markers).forEach(([id, marker]) => {
        if (!marker || !marker._marker) return;
        const lla = getPlayerLLA(marker, id);
        if (!lla) return;
        if (haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) > RANGE_M) return;
        const sp = getPlayerScreenPos(marker, id);
        if (!sp) return;
        const sd = screenDist(sp, np);
        if (sd < bestSD) { bestSD = sd; best = { id, callsign: getCallsign(marker), marker }; }
      });
      return best;
    }

    // ── Missile smoke ─────────────────────────────────────────────────────
    function fireMissileSmoke(startLLA, target, onImpact) {
      const anchor = { lla: [startLLA[0], startLLA[1], startLLA[2], 0, 0, 0] };
      let speed    = 1500;
      const MAX_SPEED = MISSILE_SPEED;
      const ACCEL     = 250;

      const emitter = new geofs.fx.ParticleEmitter(Object.assign({},
        multiplayer.contrailEmitters[1], {
          anchor, duration: 99999999, rate: 0.08, life: 10000,
          size: [8, 22], startOpacity: 1.0, endOpacity: 0.0,
        }
      ));

      const viewer = geofs.api.viewer;
      let curLat = startLLA[0], curLon = startLLA[1], curAlt = startLLA[2];

      const missileEntity = viewer.entities.add({
        position: new Cesium.CallbackProperty(
          () => Cesium.Cartesian3.fromDegrees(curLon, curLat, curAlt), false),
        orientation: new Cesium.CallbackProperty(() => {
          try {
            const live = getLivePosition(target.id);
            const tLat = live ? live.lat       : curLat;
            const tLon = live ? live.lon       : curLon;
            const tAlt = live ? live.altMeters : curAlt;
            const from = Cesium.Cartesian3.fromDegrees(curLon, curLat, curAlt);
            const to   = Cesium.Cartesian3.fromDegrees(tLon, tLat, tAlt);
            const dir  = Cesium.Cartesian3.normalize(
              Cesium.Cartesian3.subtract(to, from, new Cesium.Cartesian3()),
              new Cesium.Cartesian3());
            const up   = new Cesium.Cartesian3(0, 0, 1);
            const axis = Cesium.Cartesian3.normalize(
              Cesium.Cartesian3.cross(up, dir, new Cesium.Cartesian3()),
              new Cesium.Cartesian3());
            const angle = Math.acos(Math.max(-1, Math.min(1, Cesium.Cartesian3.dot(up, dir))));
            if (Cesium.Cartesian3.magnitude(axis) < 0.0001) return Cesium.Quaternion.IDENTITY;
            return Cesium.Quaternion.fromAxisAngle(axis, angle);
          } catch(e) { return Cesium.Quaternion.IDENTITY; }
        }, false),
        cylinder: {
          length: 5.0, topRadius: 0.12, bottomRadius: 0.22,
          material: Cesium.Color.fromCssColorString('#dddddd'), outline: false,
        },
      });

      const TICK_MS = 50;
      let finished  = false;

      const moveInterval = setInterval(() => {
        if (finished) return;
        speed = Math.min(MAX_SPEED, speed + ACCEL * (TICK_MS / 1000));
        const stepM = speed * (TICK_MS / 1000);
        const live  = getLivePosition(target.id);
        const tLat  = live ? live.lat       : curLat;
        const tLon  = live ? live.lon       : curLon;
        const tAlt  = live ? live.altMeters : curAlt;
        const distM = haversineM(curLat, curLon, tLat, tLon);

        if (distM < stepM * 2) {
          finished = true;
          clearInterval(moveInterval);
          try { viewer.entities.remove(missileEntity); } catch(e) {}
          try { emitter.rate = 0; } catch(e) {}
          setTimeout(() => { try { emitter.destroy(); } catch(e) {} }, 10000);
          onImpact();
          return;
        }
        const ratio = stepM / Math.max(distM, 1);
        curLat += (tLat - curLat) * ratio;
        curLon += (tLon - curLon) * ratio;
        curAlt += (tAlt - curAlt) * ratio;
        anchor.lla[0] = curLat; anchor.lla[1] = curLon; anchor.lla[2] = curAlt;
      }, TICK_MS);

      setTimeout(() => {
        if (!finished) {
          finished = true; clearInterval(moveInterval);
          try { viewer.entities.remove(missileEntity); } catch(e) {}
          try { emitter.rate = 0; } catch(e) {}
          setTimeout(() => { try { emitter.destroy(); } catch(e) {} }, 10000);
        }
      }, 60000);
    }

    // ── UI: Reticle ───────────────────────────────────────────────────────
    const reticle = document.createElement('div');
    Object.assign(reticle.style, {
      position: 'fixed', width: '40px', height: '40px',
      border: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%',
      pointerEvents: 'none', display: 'none',
      zIndex: '999999', transform: 'translate(-50%, -50%)',
    });

    const reticleOuter = document.createElement('div');
    Object.assign(reticleOuter.style, {
      position: 'fixed', width: '70px', height: '70px',
      border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '50%',
      pointerEvents: 'none', display: 'none',
      zIndex: '999998', transform: 'translate(-50%, -50%)',
    });

    const lockLabel = document.createElement('div');
    Object.assign(lockLabel.style, {
      position: 'absolute', top: '46px', left: '50%',
      transform: 'translateX(-50%)', color: 'white',
      fontSize: '10px', fontFamily: 'monospace',
      whiteSpace: 'nowrap', display: 'none',
    });
    reticle.appendChild(lockLabel);
    document.body.appendChild(reticleOuter);
    document.body.appendChild(reticle);

    // ── UI: HUD ───────────────────────────────────────────────────────────
    const hud = document.createElement('div');
    Object.assign(hud.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: 'rgba(0,0,0,0.95)', border: '1px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '12px', padding: '10px 14px',
      zIndex: '999999', pointerEvents: 'none',
      lineHeight: '1.7', display: 'none', minWidth: '220px',
      textShadow: '0 0 6px rgba(0,255,65,0.4)',
    });
    document.body.appendChild(hud);

    // ── UI: ARM button ────────────────────────────────────────────────────
    const armBtn = document.createElement('button');
    Object.assign(armBtn.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: '#001a00', border: '2px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '14px', fontWeight: 'bold',
      padding: '10px 24px', zIndex: '999999', cursor: 'pointer',
      letterSpacing: '2px', display: 'none',
      textShadow: '0 0 8px rgba(0,255,65,0.6)',
      boxShadow: '0 0 10px rgba(0,255,65,0.2)',
    });
    armBtn.textContent = '◈ ARM LOADOUT';
    document.body.appendChild(armBtn);

    // ── UI: Loadout panel ─────────────────────────────────────────────────
    const armPanel = document.createElement('div');
    Object.assign(armPanel.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: 'rgba(0,0,0,0.95)', border: '1px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '12px', padding: '12px 16px',
      zIndex: '999999', display: 'none', minWidth: '280px',
      textShadow: '0 0 6px rgba(0,255,65,0.4)',
    });
    document.body.appendChild(armPanel);

    function buildArmPanel() {
      const cfg  = getHPConfig();
      if (!cfg) return;
      const maxM = cfg.maxMissiles;
      const maxT = cfg.maxTypes;
      const used = totalMissiles();

      let html = `<div style="margin-bottom:10px;letter-spacing:1px;font-size:13px">◈ LOADOUT — ${used}/${maxM} | MAX ${maxT} TYPES</div>`;

      loadout.forEach((slot, si) => {
        html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">`;
        html += `<select id="ls-name-${si}" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:11px;padding:3px;flex:1">`;
        MISSILE_DEFS.forEach(m => {
          html += `<option value="${m.name}" ${m.name === slot.name ? 'selected' : ''}>${m.name}</option>`;
        });
        html += `</select>`;
        html += `<input id="ls-cnt-${si}" type="number" min="0" max="${maxM}" value="${slot.count}"
          style="width:44px;background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:11px;padding:3px;text-align:center">`;
        html += `<button id="ls-del-${si}" style="background:#001a00;border:1px solid #ff4444;color:#ff4444;font-size:10px;padding:2px 8px;cursor:pointer">✕</button>`;
        html += `</div>`;
      });

      if (loadout.length < maxT) {
        html += `<button id="ls-add" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:10px;padding:3px 10px;cursor:pointer;margin-bottom:8px">+ ADD TYPE</button>`;
      }

      html += `<div style="display:flex;gap:8px;margin-top:8px">`;
      html += `<button id="ls-confirm" style="background:#003300;border:1px solid #00ff41;color:#00ff41;font-size:12px;padding:5px 16px;cursor:pointer;letter-spacing:1px;flex:1">CONFIRM</button>`;
      html += `<button id="ls-close" style="background:#001a00;border:1px solid #555;color:#555;font-size:12px;padding:5px 16px;cursor:pointer">✕</button>`;
      html += `</div>`;
      html += `<div id="ls-err" style="color:#ff4444;font-size:10px;margin-top:6px;display:none"></div>`;

      armPanel.innerHTML = html;

      loadout.forEach((_, si) => {
        document.getElementById(`ls-del-${si}`).addEventListener('click', () => {
          loadout.splice(si, 1);
          activeSlotIdx = Math.min(activeSlotIdx, loadout.length - 1);
          buildArmPanel();
        });
      });

      const addBtn = document.getElementById('ls-add');
      if (addBtn) addBtn.addEventListener('click', () => {
        if (loadout.length < maxT) {
          const taken = loadout.map(s => s.name);
          const next  = MISSILE_DEFS.find(m => !taken.includes(m.name));
          if (next) { loadout.push({ ...next, count: 0 }); buildArmPanel(); }
        }
      });

      document.getElementById('ls-confirm').addEventListener('click', () => {
        const err = document.getElementById('ls-err');
        const newLoadout = [];
        let total = 0, valid = true;

        loadout.forEach((_, si) => {
          const name  = document.getElementById(`ls-name-${si}`).value;
          const count = parseInt(document.getElementById(`ls-cnt-${si}`).value) || 0;
          const def   = MISSILE_DEFS.find(m => m.name === name);
          if (def) { newLoadout.push({ ...def, count }); total += count; }
        });

        const types = newLoadout.filter(s => s.count > 0).length;
        if (total > maxM)      { err.textContent = `MAX ${maxM} MISSILES`; err.style.display = 'block'; valid = false; }
        else if (types > maxT) { err.textContent = `MAX ${maxT} TYPES`;    err.style.display = 'block'; valid = false; }
        else if (total === 0)  { err.textContent = 'NO MISSILES LOADED';   err.style.display = 'block'; valid = false; }

        if (valid) {
          loadout = newLoadout.filter(s => s.count > 0);
          activeSlotIdx = 0;
          activeMissile = loadout[0] || null;
          rebuildHardpointModels();
          updateHUD();
          armPanel.style.display = 'none';
          showNotif('✔ LOADOUT CONFIRMED', '#00ff41');
        }
      });

      document.getElementById('ls-close').addEventListener('click', () => {
        armPanel.style.display = 'none';
      });
    }

    armBtn.addEventListener('click', () => {
      buildArmPanel();
      armPanel.style.display = armPanel.style.display === 'none' ? 'block' : 'none';
    });

    setInterval(() => {
      const ac = geofs.aircraft.instance;
      const onGround = !ac.airborne && ac.groundContact;
      const stopped  = ac.groundSpeed < 1;
      const show = onGround && stopped;

      if (show) {
        const hudBottom = hud.style.display !== 'none'
          ? hud.getBoundingClientRect().bottom + 8
          : 80;
        armBtn.style.top     = hudBottom + 'px';
        armBtn.style.display = 'block';
        if (armPanel.style.display === 'block') {
          armPanel.style.top = (hudBottom + armBtn.offsetHeight + 8) + 'px';
        }
      } else {
        armBtn.style.display   = 'none';
        armPanel.style.display = 'none';
      }
    }, 300);

    // ── UI: Target Destroyed ──────────────────────────────────────────────
    function showTargetDestroyed() {
      const banner = document.createElement('div');
      Object.assign(banner.style, {
        position: 'fixed', top: '58px', left: '50%',
        transform: 'translateX(-50%)', color: '#d93030',
        fontFamily: 'Arial Narrow, Arial, sans-serif',
        fontSize: '13px', fontWeight: 'bold',
        letterSpacing: '2px', textTransform: 'uppercase',
        textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
        zIndex: '999999', pointerEvents: 'none',
        opacity: '1', transition: 'opacity 0.6s ease', whiteSpace: 'nowrap',
      });
      banner.textContent = 'TARGET DESTROYED';
      document.body.appendChild(banner);
      setTimeout(() => { banner.style.opacity = '0'; }, 2000);
      setTimeout(() => { banner.remove(); }, 2700);
    }

    // ── UI helpers ────────────────────────────────────────────────────────
    function setColor(c) {
      reticle.style.borderColor      = c;
      reticleOuter.style.borderColor = c;
      lockLabel.style.color          = c;
    }

    function startBlink() {
      let v = true, vo = true;
      blinkTimer      = setInterval(() => { v  = !v;  reticle.style.opacity      = v  ? '0.8' : '0'; }, 500);
      outerBlinkTimer = setInterval(() => { vo = !vo; reticleOuter.style.opacity = vo ? '1'   : '0'; }, 750);
    }

    function stopBlink() {
      clearInterval(blinkTimer); clearInterval(outerBlinkTimer);
      reticle.style.opacity = '0.8'; reticleOuter.style.opacity = '1';
    }

    function lockOn(player) {
      lockedPlayer = player;
      lockLabel.textContent   = `LOCKED: ${player.callsign}`;
      lockLabel.style.display = 'block';
      stopBlink();
      reticle.style.borderColor      = 'red';
      reticleOuter.style.borderColor = 'rgba(255,0,0,0.35)';
      lockLabel.style.color          = 'red';
      updateHUD();
    }

    function unlock() {
      lockedPlayer = null;
      lockLabel.style.display = 'none';
      setColor('white'); startBlink(); updateHUD();
    }

    function updateHUD() {
      if (!armed) { hud.style.display = 'none'; return; }
      hud.style.display = 'block';
      const m     = activeMissile || getNextMissile();
      const now   = Date.now();
      const cd    = Math.max(0, Math.ceil((lastFireTime + FIRE_COOLDOWN - now) / 1000));
      const myLLA = geofs.aircraft.instance.llaLocation;
      let nearby  = 0;
      Object.entries(ui.playerMarkers || {}).forEach(([id, mk]) => {
        if (!mk || !mk._marker) return;
        const lla = getPlayerLLA(mk, id);
        if (lla && haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) <= RANGE_M) nearby++;
      });

      const loadoutStr = loadout.map((s, i) =>
        i === activeSlotIdx
          ? `<b style="color:#fff">▶${s.name}×${s.count}</b>`
          : `<span style="color:#00aa30">${s.name}×${s.count}</span>`
      ).join(' ');

      hud.innerHTML =
        `<b>◈ WEAPON SYSTEM</b><br>` +
        `Missile : <b>${m ? m.name : 'NONE'}</b><br>` +
        `Counter : <b>${m ? m.counter.toUpperCase() : '--'}</b><br>` +
        `Nearby  : <b>${nearby} (&lt;${RANGE_M/1000}km)</b><br>` +
        `<span style="font-size:10px">${loadoutStr}</span><br>` +
        (cd > 0 ? `Cooldown: <b style="color:orange">${cd}s</b><br>` : '') +
        (lockedPlayer
          ? `Lock    : <b style="color:red">● ${lockedPlayer.callsign}</b>`
          : `Lock    : <span style="color:#555">aim at nearby plane</span>`) +
        `<br><span style="color:#555">[L] disarm [Q] cycle [SHIFT] missile [ENTER] guns</span>`;
    }

    function showNotif(text, color) {
      const n = document.createElement('div');
      Object.assign(n.style, {
        position: 'fixed', top: '130px', left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: color || 'white',
        fontFamily: 'monospace', fontSize: '13px',
        padding: '6px 18px', borderRadius: '3px',
        border: `1px solid ${color || 'white'}`,
        zIndex: '999999', pointerEvents: 'none', transition: 'opacity 0.5s',
      });
      n.textContent = text;
      document.body.appendChild(n);
      setTimeout(() => { n.style.opacity = '0'; }, 2400);
      setTimeout(() => { n.remove(); }, 3000);
    }

    // ── Fire sequence ─────────────────────────────────────────────────────
    function fireSequence() {
      if (!lockedPlayer) { showNotif('No lock — aim at a plane within range.', 'red'); return; }
      const now    = Date.now();
      const cdLeft = Math.ceil((lastFireTime + FIRE_COOLDOWN - now) / 1000);
      if (cdLeft > 0) { showNotif(`⏳ Wait ${cdLeft}s before firing again.`, 'orange'); return; }

      const missile = getNextMissile();
      if (!missile) { showNotif('NO MISSILES', 'red'); return; }

      activeMissile = missile;
      const target  = lockedPlayer;
      lastFireTime  = now;

      playLaunchSound();
      consumeMissile();
      updateHUD();

      const myLLA = [...geofs.aircraft.instance.llaLocation];
      fireMissileSmoke(myLLA, target, () => {
        const live = getLivePosition(target.id);
        spawnExplosion(
          live ? live.lat       : myLLA[0],
          live ? live.lon       : myLLA[1],
          live ? live.altMeters : myLLA[2]
        );
        showTargetDestroyed();
        activeMissile = getNextMissile();
        unlock(); updateHUD();
      });
    }

    // ── Toggle arm ────────────────────────────────────────────────────────
    function toggleArm() {
      armed = !armed;
      if (armed) {
        activeMissile = getNextMissile();
        reticle.style.display      = 'block';
        reticleOuter.style.display = 'block';
        lockLabel.style.display    = 'none';
        lockedPlayer = null;
        setColor('white'); startBlink(); updateHUD(); startScan();
        showNotif(`Armed: ${activeMissile ? activeMissile.name : 'NO MISSILES'}`, 'white');
      } else {
        reticle.style.display      = 'none';
        reticleOuter.style.display = 'none';
        hud.style.display          = 'none';
        stopBlink(); stopScan();
        lockedPlayer = null; activeMissile = null;
      }
    }

    // ── Scan loop ─────────────────────────────────────────────────────────
    function startScan() {
      if (scanRAF) return;
      let hudTick = 0;
      const tick = () => {
        if (!armed) { scanRAF = null; return; }
        const sp = getNoseScreenPos();
        if (sp) {
          nosePos = sp;
          reticle.style.left      = sp.x + 'px';
          reticle.style.top       = sp.y + 'px';
          reticleOuter.style.left = sp.x + 'px';
          reticleOuter.style.top  = sp.y + 'px';
        }
        const p = findClosestToNose(sp || nosePos);
        if (p && !lockedPlayer) { lockOn(p); }
        if (lockedPlayer) {
          const lsp = getPlayerScreenPos(lockedPlayer.marker, lockedPlayer.id);
          if (!isOnScreen(lsp)) unlock();
        } else if (!p && lockedPlayer) {
          const myLLA = geofs.aircraft.instance.llaLocation;
          const lla   = getPlayerLLA(lockedPlayer.marker, lockedPlayer.id);
          if (!lla || haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) > RANGE_M) unlock();
        }
        if (++hudTick > 60) { hudTick = 0; updateHUD(); }
        scanRAF = requestAnimationFrame(tick);
      };
      scanRAF = requestAnimationFrame(tick);
    }

    function stopScan() {
      if (scanRAF) { cancelAnimationFrame(scanRAF); scanRAF = null; }
    }

    // ── Keys ──────────────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'l' || e.key === 'L')           { e.preventDefault(); toggleArm(); }
      if (e.key === 'Shift' && armed)                { e.preventDefault(); fireSequence(); }
      if ((e.key === 'q' || e.key === 'Q') && armed) { e.preventDefault(); cycleSlot(1); }
      if (e.key === 'Enter')                         { e.preventDefault(); startGuns(); }
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'Enter') stopGuns();
    });

    showNotif('🎯 GeoFS Military Addon v9.5 — L: arm | Q: cycle | SHIFT: missile | ENTER: guns', 'white');

    // ── GUN SYSTEM ────────────────────────────────────────────────────────
    const GUN_RATE    = 40;   // rounds per second
    const GUN_RANGE   = 1000; // metres before drop starts
    const GUN_FLOOR   = 3;    // metres AGL to disappear (≈10ft)
    let gunFiring     = false;
    let gunInterval   = null;

    // Gun muzzle smoke emitter — created once, toggled
    let gunSmokeEmitter = null;

    function getGunMuzzleAnchor() {
      // Place muzzle slightly ahead of and below nose
      const lla = geofs.aircraft.instance.llaLocation;
      const wr  = geofs.aircraft.instance.object3d.worldRotation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enu = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const fE  = Cesium.Cartesian3.normalize(
        Cesium.Matrix4.multiplyByPointAsVector(enu, new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]), new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
      const muzzle = new Cesium.Cartesian3(
        origin.x + fE.x * 4,
        origin.y + fE.y * 4,
        origin.z + fE.z * 4
      );
      const carto = Cesium.Cartographic.fromCartesian(muzzle);
      return [
        Cesium.Math.toDegrees(carto.latitude),
        Cesium.Math.toDegrees(carto.longitude),
        carto.height,
      ];
    }

    // Shared PolylineCollection — one primitive, many tracers, very performant
    const tracerCollection = new Cesium.PolylineCollection();
    geofs.api.viewer.scene.primitives.add(tracerCollection);

    function spawnTracer() {
      const ac  = geofs.aircraft.instance;
      const lla = ac.llaLocation;
      const wr  = ac.object3d.worldRotation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enu    = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const fE = Cesium.Cartesian3.normalize(
        Cesium.Matrix4.multiplyByPointAsVector(enu,
          new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]),
          new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );

      const SPEED      = 1500; // m/s
      const TICK       = 16;   // ms
      const stepM      = SPEED * (TICK / 1000);
      const TRACER_LEN = 12;   // metres

      let hX = origin.x + fE.x * 6;
      let hY = origin.y + fE.y * 6;
      let hZ = origin.z + fE.z * 6;
      let distTravelled = 0;

      const line = tracerCollection.add({
        positions: [new Cesium.Cartesian3(hX,hY,hZ), new Cesium.Cartesian3(hX,hY,hZ)],
        width: 2,
        material: Cesium.Material.fromType('PolylineGlow', {
          glowPower: 0.25,
          color: Cesium.Color.fromCssColorString('#ff9955'),
        }),
      });

      const tick = setInterval(() => {
        distTravelled += stepM;
        hX += fE.x * stepM;
        hY += fE.y * stepM;
        hZ += fE.z * stepM;

        if (distTravelled > GUN_RANGE) {
          const excess   = distTravelled - GUN_RANGE;
          const dropRate = 9.8 * Math.pow(excess / SPEED, 1.5);
          hZ -= dropRate * stepM;
        }

        const carto = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(hX, hY, hZ));
        if (carto.height < GUN_FLOOR || distTravelled > 3500) {
          clearInterval(tick);
          tracerCollection.remove(line);
          return;
        }

        line.positions = [
          new Cesium.Cartesian3(hX - fE.x*TRACER_LEN, hY - fE.y*TRACER_LEN, hZ - fE.z*TRACER_LEN),
          new Cesium.Cartesian3(hX, hY, hZ),
        ];
        const alpha = Math.max(0.2, 1 - distTravelled / 2500);
        line.material = Cesium.Material.fromType('PolylineGlow', {
          glowPower: 0.25,
          color: new Cesium.Color(1, 0.6, 0.33, alpha),
        });
      }, TICK);
    }

    function startGuns() {
      if (gunFiring) return;
      gunFiring = true;

      // Start muzzle smoke
      try {
        const mLLA = getGunMuzzleAnchor();
        const anchor = { lla: [...mLLA, 0, 0, 0] };
        gunSmokeEmitter = new geofs.fx.ParticleEmitter(Object.assign({},
          multiplayer.contrailEmitters[1], {
            anchor,
            duration:     99999999,
            rate:         0.15,
            life:         400,
            size:         [1, 3],
            startOpacity: 0.7,
            endOpacity:   0.0,
          }
        ));
        // Keep muzzle anchor updated
        gunInterval = setInterval(() => {
          if (!gunFiring) return;
          const mLLA2 = getGunMuzzleAnchor();
          anchor.lla[0] = mLLA2[0];
          anchor.lla[1] = mLLA2[1];
          anchor.lla[2] = mLLA2[2];
          spawnTracer();
        }, 1000 / GUN_RATE);
      } catch(e) {
        gunInterval = setInterval(spawnTracer, 1000 / GUN_RATE);
      }
    }

    function stopGuns() {
      if (!gunFiring) return;
      gunFiring = false;
      clearInterval(gunInterval);
      gunInterval = null;
      if (gunSmokeEmitter) {
        try { gunSmokeEmitter.rate = 0; } catch(e) {}
        setTimeout(() => { try { gunSmokeEmitter.destroy(); } catch(e) {} gunSmokeEmitter = null; }, 1000);
      }
    }

    // ── RADAR ─────────────────────────────────────────────────────────────
    const RANGES = [50, 100, 150, 300, 500];
    let rangeIdx = 2, radarVis = true, radarBlips = [], lastBlipUpd = 0;
    let sweepAngle = -Math.PI / 2;

    const radarContainer = document.createElement('div');
    Object.assign(radarContainer.style, {
      position: 'fixed', bottom: '20px', left: '20px',
      width: '260px', zIndex: '99999', fontFamily: 'monospace', userSelect: 'none',
    });
    document.body.appendChild(radarContainer);

    const radarHeader = document.createElement('div');
    Object.assign(radarHeader.style, {
      background: '#001a00', border: '1px solid #00ff41', borderBottom: 'none',
      color: '#00ff41', fontSize: '11px', padding: '3px 8px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      letterSpacing: '1px', cursor: 'move',
    });
    radarHeader.innerHTML =
      `<span>AN/APG-77 RADAR</span>` +
      `<div style="display:flex;gap:6px;align-items:center">` +
      `<span id="rdr-range" style="color:#00ff41;font-size:10px">150KM</span>` +
      `<button id="rdr-rng-btn" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:9px;padding:1px 5px;cursor:pointer;letter-spacing:1px">RNG</button>` +
      `<button id="rdr-tog-btn" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:9px;padding:1px 5px;cursor:pointer;letter-spacing:1px">HID</button>` +
      `</div>`;
    radarContainer.appendChild(radarHeader);

    const radarCanvas = document.createElement('canvas');
    radarCanvas.width = radarCanvas.height = 260;
    Object.assign(radarCanvas.style, { display: 'block', border: '1px solid #00ff41', borderBottom: 'none' });
    radarContainer.appendChild(radarCanvas);
    const rctx = radarCanvas.getContext('2d');
    const rcx = 130, rcy = 130, rR = 120;

    const radarFooter = document.createElement('div');
    Object.assign(radarFooter.style, {
      background: '#001a00', border: '1px solid #00ff41', color: '#00aa30',
      fontSize: '10px', padding: '3px 8px', display: 'flex',
      justifyContent: 'space-between', letterSpacing: '0.5px',
    });
    radarFooter.innerHTML = `<span id="rdr-count">0 CONTACTS</span><span id="rdr-alt">ALT: --</span>`;
    radarContainer.appendChild(radarFooter);

    function drawRadarBG() {
      rctx.clearRect(0, 0, 260, 260);
      rctx.fillStyle = '#000a00'; rctx.fillRect(0, 0, 260, 260);
      for (let i = 1; i <= 4; i++) {
        const r = (rR / 4) * i;
        rctx.beginPath(); rctx.arc(rcx, rcy, r, 0, Math.PI * 2);
        rctx.strokeStyle = i === 4 ? '#005500' : '#002200';
        rctx.lineWidth = i === 4 ? 1 : 0.5; rctx.stroke();
        rctx.fillStyle = '#004400'; rctx.font = '9px monospace';
        rctx.fillText(`${Math.round((RANGES[rangeIdx] / 4) * i)}`, rcx + 3, rcy - r + 10);
      }
      rctx.strokeStyle = '#002200'; rctx.lineWidth = 0.5;
      rctx.beginPath();
      rctx.moveTo(rcx, rcy - rR); rctx.lineTo(rcx, rcy + rR);
      rctx.moveTo(rcx - rR, rcy); rctx.lineTo(rcx + rR, rcy);
      rctx.stroke();
      rctx.beginPath(); rctx.arc(rcx, rcy, rR, 0, Math.PI * 2);
      rctx.strokeStyle = '#00aa30'; rctx.lineWidth = 1.5; rctx.stroke();
      rctx.fillStyle = '#00aa30'; rctx.font = 'bold 10px monospace';
      rctx.textAlign = 'center';
      rctx.fillText('N', rcx, rcy - rR - 3); rctx.fillText('S', rcx, rcy + rR + 11);
      rctx.textAlign = 'left';  rctx.fillText('E', rcx + rR + 3, rcy + 4);
      rctx.textAlign = 'right'; rctx.fillText('W', rcx - rR - 3, rcy + 4);
      rctx.textAlign = 'left';
    }

    function drawRadarSweep(angle) {
      const trail = Math.PI / 3;
      const grad = rctx.createLinearGradient(
        rcx + Math.cos(angle - trail) * rR, rcy + Math.sin(angle - trail) * rR,
        rcx + Math.cos(angle) * rR,         rcy + Math.sin(angle) * rR);
      grad.addColorStop(0, 'rgba(0,80,0,0)');
      grad.addColorStop(1, 'rgba(0,200,50,0.12)');
      rctx.beginPath(); rctx.moveTo(rcx, rcy);
      rctx.arc(rcx, rcy, rR, angle - trail, angle);
      rctx.closePath(); rctx.fillStyle = grad; rctx.fill();
      rctx.beginPath(); rctx.moveTo(rcx, rcy);
      rctx.lineTo(rcx + Math.cos(angle) * rR, rcy + Math.sin(angle) * rR);
      rctx.strokeStyle = '#00ff41'; rctx.lineWidth = 1.5; rctx.stroke();
    }

    function drawRadarBlips() {
      const myAlt = geofs.aircraft.instance.llaLocation[2];
      radarBlips.forEach(b => {
        const diff  = b.alt - myAlt;
        const color = Math.abs(diff) < 500 ? '#00ff41' : diff > 0 ? '#00ffff' : '#ffff00';
        const isLocked = lockedPlayer && lockedPlayer.id === b.id;
        rctx.beginPath(); rctx.arc(b.sx, b.sy, isLocked ? 5 : 3, 0, Math.PI * 2);
        rctx.fillStyle = isLocked ? '#ff4444' : color; rctx.fill();
        if (isLocked) {
          rctx.beginPath(); rctx.arc(b.sx, b.sy, 9, 0, Math.PI * 2);
          rctx.strokeStyle = '#ff4444'; rctx.lineWidth = 1; rctx.stroke();
        }
        rctx.fillStyle = isLocked ? '#ff8888' : '#00cc33';
        rctx.font = '8px monospace';
        rctx.fillText(b.callsign.substring(0, 8), b.sx + 6, b.sy - 2);
        rctx.fillText(diff > 500 ? '▲' : diff < -500 ? '▼' : '─', b.sx + 6, b.sy + 8);
      });
    }

    function drawOwnBlip() {
      rctx.beginPath(); rctx.arc(rcx, rcy, 4, 0, Math.PI * 2);
      rctx.fillStyle = '#ffffff'; rctx.fill();
      const hdg = geofs.aircraft.instance.htr[0] * Math.PI / 180;
      rctx.beginPath(); rctx.moveTo(rcx, rcy);
      rctx.lineTo(rcx + Math.sin(hdg) * 20, rcy - Math.cos(hdg) * 20);
      rctx.strokeStyle = '#ffffff'; rctx.lineWidth = 1.5; rctx.stroke();
    }

    function updateRadarBlips() {
      const me = geofs.aircraft.instance.llaLocation;
      const range = RANGES[rangeIdx] * 1000;
      const newBlips = [];
      Object.values(multiplayer.users || {}).forEach(u => {
        const lla = u.referencePoint && u.referencePoint.lla;
        if (!lla || !lla[0]) return;
        const dLat  = (lla[0] - me[0]) * Math.PI / 180;
        const dLon  = (lla[1] - me[1]) * Math.PI / 180;
        const distM = 6371000 * Math.sqrt(dLat**2 + Math.cos(me[0]*Math.PI/180)**2 * dLon**2);
        if (distM > range) return;
        const bear  = Math.atan2(lla[1] - me[1], lla[0] - me[0]);
        const scale = (distM / range) * rR;
        newBlips.push({
          id: u.id, callsign: u.callsign || '----', alt: lla[2],
          dist: Math.round(distM / 1000),
          sx: rcx + Math.sin(bear) * scale,
          sy: rcy - Math.cos(bear) * scale,
        });
      });
      radarBlips = newBlips;
      document.getElementById('rdr-count').textContent =
        `${radarBlips.length} CONTACT${radarBlips.length !== 1 ? 'S' : ''}`;
      document.getElementById('rdr-alt').textContent =
        `ALT: ${Math.round(me[2] * 3.28084)}FT`;
    }

    function radarTick(ts) {
      sweepAngle += 0.025;
      if (sweepAngle > Math.PI * 1.5) sweepAngle -= Math.PI * 2;
      if (ts - lastBlipUpd > 5000) { updateRadarBlips(); lastBlipUpd = ts; }
      if (radarVis) { drawRadarBG(); drawRadarSweep(sweepAngle); drawRadarBlips(); drawOwnBlip(); }
      requestAnimationFrame(radarTick);
    }
    requestAnimationFrame(radarTick);

    document.getElementById('rdr-rng-btn').addEventListener('click', () => {
      rangeIdx = (rangeIdx + 1) % RANGES.length;
      document.getElementById('rdr-range').textContent = `${RANGES[rangeIdx]}KM`;
    });
    document.getElementById('rdr-tog-btn').addEventListener('click', () => {
      radarVis = !radarVis;
      radarCanvas.style.display = radarVis ? 'block' : 'none';
      radarFooter.style.display = radarVis ? 'flex'  : 'none';
      document.getElementById('rdr-tog-btn').textContent = radarVis ? 'HID' : 'SHW';
    });

    let rdrDrag = false, rdrDX = 0, rdrDY = 0;
    radarHeader.addEventListener('mousedown', e => {
      rdrDrag = true;
      rdrDX = e.clientX - radarContainer.offsetLeft;
      rdrDY = e.clientY - (radarContainer.offsetTop || window.innerHeight - radarContainer.offsetHeight - 20);
    });
    document.addEventListener('mousemove', e => {
      if (!rdrDrag) return;
      radarContainer.style.left = (e.clientX - rdrDX) + 'px';
      radarContainer.style.bottom = 'auto';
      radarContainer.style.top = (e.clientY - rdrDY) + 'px';
    });
    document.addEventListener('mouseup', () => { rdrDrag = false; });
    document.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Backspace') {
        radarVis = !radarVis;
        radarCanvas.style.display = radarVis ? 'block' : 'none';
        radarFooter.style.display = radarVis ? 'flex'  : 'none';
        document.getElementById('rdr-tog-btn').textContent = radarVis ? 'HID' : 'SHW';
      }
    });

    // ── EXPLOSION ─────────────────────────────────────────────────────────
    function spawnExplosion(lat, lon, alt) {
      const scene = geofs.api.viewer.scene, viewer = geofs.api.viewer;

      const flashCanvas = document.createElement('canvas');
      flashCanvas.width = flashCanvas.height = 128;
      const fc = flashCanvas.getContext('2d');
      const fg = fc.createRadialGradient(64, 64, 0, 64, 64, 64);
      fg.addColorStop(0, 'rgba(255,255,220,1)'); fg.addColorStop(0.2, 'rgba(255,180,50,0.9)');
      fg.addColorStop(0.6, 'rgba(255,80,0,0.5)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
      fc.fillStyle = fg; fc.beginPath(); fc.arc(64,64,64,0,Math.PI*2); fc.fill();

      const flashBB = new Cesium.BillboardCollection();
      scene.primitives.add(flashBB);
      const flash = flashBB.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        image: flashCanvas, width: 300, height: 300, color: new Cesium.Color(1,1,1,1),
      });
      const flashStart = performance.now();
      (function animFlash(now) {
        const t = Math.min((now - flashStart) / 600, 1);
        flash.width = flash.height = 300 + t * 400;
        flash.color = new Cesium.Color(1, 1, 1, 1 - t);
        if (t < 1) requestAnimationFrame(animFlash); else scene.primitives.remove(flashBB);
      })(flashStart);

      const fireCanvas = document.createElement('canvas');
      fireCanvas.width = fireCanvas.height = 128;
      const frc = fireCanvas.getContext('2d');
      const frg = frc.createRadialGradient(64, 64, 0, 64, 64, 64);
      frg.addColorStop(0, 'rgba(255,240,100,1)'); frg.addColorStop(0.3, 'rgba(255,120,0,0.95)');
      frg.addColorStop(0.6, 'rgba(180,40,0,0.7)'); frg.addColorStop(0.85, 'rgba(40,40,40,0.5)');
      frg.addColorStop(1, 'rgba(0,0,0,0)');
      frc.fillStyle = frg; frc.beginPath(); frc.arc(64,64,64,0,Math.PI*2); frc.fill();

      const fireBB = new Cesium.BillboardCollection();
      scene.primitives.add(fireBB);
      const fireball = fireBB.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        image: fireCanvas, width: 50, height: 50, color: new Cesium.Color(1,1,1,1),
      });
      const fireStart = performance.now();
      (function animFire(now) {
        const t = Math.min((now - fireStart) / 1800, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        fireball.width = fireball.height = 50 + ease * 250;
        fireball.color = new Cesium.Color(1, 0.6+(1-t)*0.4,
          t < 0.5 ? 1 : 1-(t-0.5)*2, t < 0.6 ? 1 : 1-(t-0.6)/0.4);
        if (t < 1) requestAnimationFrame(animFire); else scene.primitives.remove(fireBB);
      })(fireStart);

      const smokeAnchor = { lla: [lat, lon, alt, 0, 0, 0] };
      const smokeEmitter = new geofs.fx.ParticleEmitter(
        Object.assign({}, multiplayer.contrailEmitters[0], {
          anchor: smokeAnchor, duration: 3000, rate: 0.15, life: 12000,
          size: [15, 40], startOpacity: 0.9, endOpacity: 0,
        })
      );
      let smokeT = 0;
      const smokeDrift = setInterval(() => {
        smokeAnchor.lla[2] = alt + (smokeT += 0.1) * 8;
        if (smokeT > 30) {
          clearInterval(smokeDrift);
          setTimeout(() => { try { smokeEmitter.destroy(); } catch(e) {} }, 12000);
        }
      }, 100);

      const viewport = document.querySelector('.geofs-viewport') || document.body;
      let shakeT = 0;
      const shakeInterval = setInterval(() => {
        const intensity = Math.max(0, 8 - (++shakeT) * 0.8);
        viewport.style.transform =
          `translate(${(Math.random()-.5)*intensity}px,${(Math.random()-.5)*intensity}px)`;
        if (shakeT > 10) { clearInterval(shakeInterval); viewport.style.transform = ''; }
      }, 50);

      const redFlash = document.createElement('div');
      Object.assign(redFlash.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(255,60,0,0.35)', pointerEvents: 'none',
        zIndex: '99997', transition: 'opacity 0.6s',
      });
      document.body.appendChild(redFlash);
      setTimeout(() => { redFlash.style.opacity = '0'; }, 50);
      setTimeout(() => { redFlash.remove(); }, 700);
    }

  }
})();
