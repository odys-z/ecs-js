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
	HasHealth.query = {has: ['Health', 'Speed']}

    ecs.addSystem('has', new HasHealth);
    ecs.addSystem('has', new HasBoth);
    ecs.runSystemGroup('has');

    ecs.createEntity({
	  id: 'health',
      Health: [ { hp: 10 } ]
    });

    ecs.createEntity({
	  id: 'both',
      Health: [ { hp: 10 } ],
	  Speed: {}
    });

    const results = ecs.queryEntities({ has: ['Health'] });
    expect(results.size).to.equal(1);
    expect(flag1).to.equal(True);
    expect(flag2).to.equal(True);
  });

});
