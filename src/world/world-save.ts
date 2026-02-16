import { P } from '../player/player-state';
import { chunks, chunkMeshes } from './chunk-storage';
import { getTerrainDone, getTreesDone } from './chunk-manager';
import { TOD } from '../rendering/day-night';
import { weather } from '../rendering/weather';
import { getSeed } from '../core/noise';

export interface WorldMeta {
  id: string;
  name: string;
  seed: number;
  mode: 0 | 1;
  created: number;
  lastPlayed: number;
  player: {
    x: number; y: number; z: number;
    rx: number; ry: number;
    hp: number; maxHp: number;
    hunger: number; saturation: number;
    xp: number; level: number; xpNext: number;
    hb: any[];
    sel: number;
    fly: boolean;
  };
  tod: number;
  weather: { rain: boolean; timer: number };
  terrainDone: string[];
  treesDone: string[];
}

var db: IDBDatabase | null = null;
var DB_NAME = 'VoxelWorldDB';
var DB_VER = 1;

export function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = function () {
      var d = req.result;
      if (!d.objectStoreNames.contains('worlds')) d.createObjectStore('worlds', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('chunks')) d.createObjectStore('chunks');
    };
    req.onsuccess = function () { db = req.result; resolve(db); };
    req.onerror = function () { reject(req.error); };
  });
}

export async function listWorlds(): Promise<WorldMeta[]> {
  var d = await openDB();
  return new Promise(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readonly');
    var store = tx.objectStore('worlds');
    var req = store.getAll();
    req.onsuccess = function () {
      var list = req.result as WorldMeta[];
      list.sort(function (a, b) { return b.lastPlayed - a.lastPlayed; });
      resolve(list);
    };
    req.onerror = function () { reject(req.error); };
  });
}

export async function saveWorld(worldId: string): Promise<void> {
  var d = await openDB();
  // Read existing meta to preserve name/seed/mode/created
  var existingMeta = await new Promise<WorldMeta | undefined>(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readonly');
    var req = tx.objectStore('worlds').get(worldId);
    req.onsuccess = function () { resolve(req.result as WorldMeta | undefined); };
    req.onerror = function () { reject(req.error); };
  });
  if (!existingMeta) return;

  var meta: WorldMeta = {
    id: worldId,
    name: existingMeta.name,
    seed: getSeed(),
    mode: P.gm,
    created: existingMeta.created,
    lastPlayed: Date.now(),
    player: {
      x: P.x, y: P.y, z: P.z,
      rx: P.rx, ry: P.ry,
      hp: P.hp, maxHp: P.maxHp,
      hunger: P.hunger, saturation: P.saturation,
      xp: P.xp, level: P.level, xpNext: P.xpNext,
      hb: P.hb.map(function (s) { return s ? { id: s.id, q: s.q } : null; }),
      sel: P.sel,
      fly: P.fly
    },
    tod: TOD,
    weather: { rain: weather.rain, timer: weather.timer },
    terrainDone: Object.keys(getTerrainDone()),
    treesDone: Object.keys(getTreesDone())
  };

  // Save meta
  await new Promise<void>(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readwrite');
    tx.objectStore('worlds').put(meta);
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });

  // Save chunks
  var keys = Object.keys(chunks);
  // Batch in transactions of 50 chunks
  for (var i = 0; i < keys.length; i += 50) {
    var batch = keys.slice(i, i + 50);
    await new Promise<void>(function (resolve, reject) {
      var tx = d.transaction('chunks', 'readwrite');
      var store = tx.objectStore('chunks');
      for (var j = 0; j < batch.length; j++) {
        store.put(chunks[batch[j]], worldId + ':' + batch[j]);
      }
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  }
}

export async function loadWorld(worldId: string): Promise<WorldMeta | null> {
  var d = await openDB();
  // Load meta
  var meta = await new Promise<WorldMeta | null>(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readonly');
    var req = tx.objectStore('worlds').get(worldId);
    req.onsuccess = function () { resolve(req.result as WorldMeta || null); };
    req.onerror = function () { reject(req.error); };
  });
  if (!meta) return null;

  // Load chunks
  var prefix = worldId + ':';
  var allKeys = await new Promise<IDBValidKey[]>(function (resolve, reject) {
    var tx = d.transaction('chunks', 'readonly');
    var req = tx.objectStore('chunks').getAllKeys();
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });

  var chunkKeys = allKeys.filter(function (k) { return (k as string).indexOf(prefix) === 0; }) as string[];

  // Load in batches
  for (var i = 0; i < chunkKeys.length; i += 50) {
    var batch = chunkKeys.slice(i, i + 50);
    await new Promise<void>(function (resolve, reject) {
      var tx = d.transaction('chunks', 'readonly');
      var store = tx.objectStore('chunks');
      var remaining = batch.length;
      for (var j = 0; j < batch.length; j++) {
        (function (ck) {
          var req = store.get(ck);
          req.onsuccess = function () {
            var chunkKey = ck.substring(prefix.length);
            if (req.result) chunks[chunkKey] = req.result;
            remaining--;
            if (remaining === 0) resolve();
          };
        })(batch[j]);
      }
    });
  }

  return meta;
}

export async function createWorld(name: string, seed: number, mode: 0 | 1): Promise<string> {
  var d = await openDB();
  var id = '' + Date.now();
  var meta: WorldMeta = {
    id: id,
    name: name,
    seed: seed,
    mode: mode,
    created: Date.now(),
    lastPlayed: Date.now(),
    player: {
      x: 256.5, y: 60, z: 256.5,
      rx: 0, ry: 0,
      hp: 20, maxHp: 20,
      hunger: 20, saturation: 5,
      xp: 0, level: 0, xpNext: 7,
      hb: new Array(9).fill(null),
      sel: 0,
      fly: mode === 1
    },
    tod: 0.35,
    weather: { rain: false, timer: 120 },
    terrainDone: [],
    treesDone: []
  };
  await new Promise<void>(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readwrite');
    tx.objectStore('worlds').put(meta);
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
  return id;
}

export async function deleteWorld(worldId: string): Promise<void> {
  var d = await openDB();
  // Delete meta
  await new Promise<void>(function (resolve, reject) {
    var tx = d.transaction('worlds', 'readwrite');
    tx.objectStore('worlds').delete(worldId);
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
  // Delete all chunks for this world
  var prefix = worldId + ':';
  var allKeys = await new Promise<IDBValidKey[]>(function (resolve, reject) {
    var tx = d.transaction('chunks', 'readonly');
    var req = tx.objectStore('chunks').getAllKeys();
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
  var toDelete = allKeys.filter(function (k) { return (k as string).indexOf(prefix) === 0; }) as string[];
  if (toDelete.length > 0) {
    for (var i = 0; i < toDelete.length; i += 50) {
      var batch = toDelete.slice(i, i + 50);
      await new Promise<void>(function (resolve, reject) {
        var tx = d.transaction('chunks', 'readwrite');
        var store = tx.objectStore('chunks');
        for (var j = 0; j < batch.length; j++) store.delete(batch[j]);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    }
  }
}
