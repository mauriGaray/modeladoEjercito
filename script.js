// Class Army
class Army {
  static INITIAL_GOLD = 1000;
  static UNIT_STATS = {
    pikemen: {
      base: 5,
      train: 3,
      cost: 10,
      transform: { to: 'archers', cost: 30 },
    },
    archers: {
      base: 10,
      train: 7,
      cost: 20,
      transform: { to: 'knights', cost: 40 },
    },
    knights: {
      base: 20,
      train: 10,
      cost: 30,
      transform: null,
    },
  };
  static STARTING_UNITS = {
    chinese: { pikemen: 2, archers: 25, knights: 2 },
    english: { pikemen: 10, archers: 10, knights: 10 },
    byzantine: { pikemen: 5, archers: 8, knights: 15 },
  };

  constructor(civilization, armyName = 'no name army') {
    const civKey = civilization.toLowerCase();
    if (!Army.STARTING_UNITS[civKey]) {
      throw new Error('Unknown civilization');
    }
    this.armyName = armyName;
    this.civilization = civilization;
    this.gold = Army.INITIAL_GOLD;
    this.battleHistory = [];
    this.units = {};
    // Initialize units based on civilization
    const starting = Army.STARTING_UNITS[civKey];
    for (const type in starting) {
      this.units[type] = {
        count: starting[type],
        strengthPerUnit: Army.UNIT_STATS[type].base,
      };
    }
  }

  totalStrength() {
    return Object.entries(this.units).reduce((sum, [type, group]) => sum + group.count * group.strengthPerUnit, 0);
  }

  // Train and transform units
  trainUnitType(type) {
    const stats = Army.UNIT_STATS[type];
    const group = this.units[type];
    if (!group || group.count === 0) {
      throw new Error(`No hay unidades de tipo ${type}`);
    }

    if (this.gold < stats.cost) {
      throw new Error('No hay suficiente oro');
    }

    this.gold -= stats.cost;
    group.strengthPerUnit += stats.train;
  }

  transformUnitType(type) {
    const group = this.units[type];
    const stats = Army.UNIT_STATS[type];
    if (!group || group.count === 0) {
      throw new Error(`No hay unidades de tipo ${type} para transformar`);
    }

    const transform = stats.transform;
    if (!transform) {
      throw new Error(`Las unidades de tipo ${type} no se pueden transformar`);
    }

    if (this.gold < transform.cost) {
      throw new Error('No hay suficiente oro para transformar');
    }

    group.count -= 1;
    if (group.count === 0) {
      delete this.units[type];
    }

    const newType = transform.to;
    if (!this.units[newType]) {
      this.units[newType] = {
        count: 0,
        strengthPerUnit: Army.UNIT_STATS[newType].base,
      };
    }

    this.units[newType].count += 1;
    this.gold -= transform.cost;
  }

  // Remove one of your warriors from 2 of the strongest units if you lose a battle
  loseStrongestUnits(count = 2) {
    const unitTypes = Object.keys(this.units).map((type) => {
      const { count, strengthPerUnit } = this.units[type];
      return {
        type,
        totalStrength: count * strengthPerUnit,
      };
    });

    unitTypes.sort((a, b) => b.totalStrength - a.totalStrength);
    for (let i = 0; i < count && i < unitTypes.length; i++) {
      const type = unitTypes[i].type;
      this.units[type].count -= 1;
      if (this.units[type].count <= 0) {
        delete this.units[type];
      }
    }
  }

  addGold(amount) {
    this.gold += amount;
  }

  // Log battle history
  logBattle(opponentName, opponentCivilization, result) {
    this.battleHistory.push({ opponentName: opponentName, opponentCivilization: opponentCivilization, result });
  }
}

// Battle function
function battle(army1, army2) {
  const strength1 = army1.totalStrength();
  const strength2 = army2.totalStrength();

  let result;
  if (strength1 > strength2) {
    army1.addGold(100);
    army2.loseStrongestUnits();
    result = ` ${army1.armyName} wins`;
  } else if (strength2 > strength1) {
    army2.addGold(100);
    army1.loseStrongestUnits();
    result = ` ${army2.armyName} wins`;
  } else {
    army1.loseStrongestUnits(1);
    army2.loseStrongestUnits(1);
    result = 'Draw';
  }
  army1.logBattle(army2.armyName, army2.civilization, result);
  army2.logBattle(army1.armyName, army1.civilization, result);
  return result;
}

// Example usage

// Create armies
const army1 = new Army('English', 'Red Lions');
const army2 = new Army('Chinese', 'Golden Tigers');

// Initial status
console.log('Initial Armies');
console.log('Red Lions:', army1.units);
console.log('Golden Tigers:', army2.units);
console.log('---');

// Train units
console.log('Training Red Lions archers...');
army1.trainUnitType('archers');
console.log('Red Lions archers after training:', army1.units.archers);
console.log('---');

// Transform a unit
console.log('Transforming one Golden Tigers pikeman into archer...');
army2.transformUnitType('pikemen');
console.log('Golden Tigers after transformation:', army2.units);
console.log('---');

// Battle!
console.log('Battle begins!');
const result = battle(army1, army2);
console.log('Battle Result:', result);
console.log('---');

// After battle status
console.log('Armies after battle');
console.log('Red Lions:', army1.units, 'Gold:', army1.gold);
console.log('Golden Tigers:', army2.units, 'Gold:', army2.gold);
console.log('---');

// Battle history
console.log('Red Lions Battle History:', army1.battleHistory);
console.log('Golden Tigers Battle History:', army2.battleHistory);
