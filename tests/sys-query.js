const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const lab = exports.lab = Lab.script();

const ECS = require('../src/index');

lab.experiment('System.query', () => {

  const ecs = new ECS.ECS();
  ecs.registerComponent('Health', {
    properties: {
      max: 25,
      hp: 25,
      armor: 0
    }
  });

  ecs.registerComponent('Speed', {
    properties: {
      v: [0, 0, 0],
      a: [0, -9.8, 0],
    }
  });

  lab.before(({ context }) => {
  });

  lab.test('has ["Health", "Speed"]', () => {
    var flag1 = false;
    var flag2 = false;
    class HasHealth extends ECS.System {
        constructor(ecs) {
            super(ecs);
        }

        update(tick, entities) {
            if (entities.length === 1)
                for (var e of entities) {
                    if (e.id === 'health') {
                        flag1 = true;
                        break;
                    }
                }
        }
    }
    HasHealth.query = {has: ['Health']}

    class HasBoth extends ECS.System {
        constructor(ecs) {
            super(ecs);
        }

        update(tick, entities) {
            if (entities.length === 1)
                for (var e of entities) {
                    if (e.id === 'both') {
                        flag2 = true;
                        break;
                    }
                }
        }
    }
    HasBoth.query = {has: ['Health', 'Speed']}

    ecs.createEntity({
      id: 'health',
      Health: [ { hp: 10 } ]
    });

    ecs.createEntity({
      id: 'both',
      Health: [ { hp: 10 } ],
      Speed: {}
    });

    debugger
    var results = ecs.queryEntities({ has: ['Speed'] });
    expect(results.size, 'has speed').to.equal(1);

    results = ecs.queryEntities({ has: ['Health'] });
    expect(results.size, 'has 1 Health').to.equal(2);

    results = ecs.queryEntities({ any: ['Health'] });
    expect(results.size, 'any 2 Health').to.equal(2);

    results = ecs.queryEntities({ iffall: ['Health'] });
    expect(results.size, 'iffall health').to.equal(1);

    results = ecs.queryEntities({ iffall: ['Health', 'Speed'] });
    expect(results.size, 'iffall health speed').to.equal(1);

    ecs.addSystem('has', new HasHealth(ecs));
    ecs.addSystem('has', new HasBoth(ecs));
    ecs.runSystemGroup('has');

    expect(flag1, 'health update').to.equal(true);
    expect(flag2, 'both update').to.equal(true);
  });

});
