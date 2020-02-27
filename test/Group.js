var Box = require('../src/shapes/Box');
var Group = require('../src/shapes/Group');
var Quaternion = require('../src/math/Quaternion');
var Sphere = require('../src/shapes/Sphere');
var Vec3 = require('../src/math/Vec3');

module.exports = {
  computeAABB: {
    noChildren: function(test) {
      var group = new Group();
      group.calculateWorldAABB(
        new Vec3(),
        new Quaternion(),
        new Vec3(),
        new Vec3()
      );
      const expectedLower = new Vec3();
      const expectedUpper = new Vec3();

      test.ok(group.aabb.lowerBound.almostEquals(expectedLower));
      test.ok(group.aabb.upperBound.almostEquals(expectedUpper));

      test.done();
    },

    oneBox: function(test) {
      var group = new Group();
      var box = new Box(new Vec3(1, 1, 1));
      group.add(box);
      group.calculateWorldAABB(
        new Vec3(),
        new Quaternion(),
        new Vec3(),
        new Vec3()
      );
      const expectedLower = new Vec3(-1, -1, -1);
      const expectedUpper = new Vec3(1, 1, 1);

      test.ok(group.aabb.lowerBound.almostEquals(expectedLower));
      test.ok(group.aabb.upperBound.almostEquals(expectedUpper));

      test.done();
    },

    oneBoxGroupOffset: function(test) {
      var group = new Group();
      var box = new Box(new Vec3(1, 1, 1));
      group.add(box);
      group.calculateWorldAABB(
        new Vec3(1, 1, 1),
        new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2),
        new Vec3(),
        new Vec3()
      );
      const expectedLower = new Vec3();
      const expectedUpper = new Vec3(2, 2, 2);

      test.ok(group.aabb.lowerBound.almostEquals(expectedLower));
      test.ok(group.aabb.upperBound.almostEquals(expectedUpper));

      test.done();
    }
  },

  updateBoundingSphereRadius: {
    noChildren: function(test) {
      var group = new Group();
      group.updateBoundingSphereRadius();

      test.equals(group.boundingSphereRadius, 0);
      test.done();
    },

    oneSphere: function(test) {
      var group = new Group();
      var sphere = new Sphere(1);
      group.add(sphere);
      group.updateBoundingSphereRadius();

      test.equals(group.boundingSphereRadius, 1);

      test.done();
    },

    oneBoxGroupOffset: function(test) {
      var group = new Group();
      var sphere = new Sphere(1);
      group.add(sphere);
      group.position.x = 1;
      group.updateBoundingSphereRadius();

      test.equals(group.boundingSphereRadius, 1);

      test.done();
    }
  }
};
