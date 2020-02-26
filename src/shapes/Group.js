const Quaternion = require('../math/Vec3');
const Vec3 = require('../math/Vec3');

/**
 * Represents a group of shapes that can be added to a body or another group.
 * Enables a hierarchy of shapes and groups. Also enables easy construction and
 * destruction of objects.
 */
class Group {
  constructor() {
    /**
     * @property shapes
     * @type {Array}
     */
    this.shapes = new Array();

    /**
     * @property position
     * @type {Vec3}
     */
    this.position = new Vec3();

    /**
     * @property quaternion
     * @type {Quaternion}
     */
    this.position = new Vec3();
  }
}

module.exports = Group;
