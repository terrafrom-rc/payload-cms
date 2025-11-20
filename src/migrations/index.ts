import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20251119_080727 from './20251119_080727';
import * as migration_20251120_135256 from './20251120_135256';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20251119_080727.up,
    down: migration_20251119_080727.down,
    name: '20251119_080727',
  },
  {
    up: migration_20251120_135256.up,
    down: migration_20251120_135256.down,
    name: '20251120_135256'
  },
];
