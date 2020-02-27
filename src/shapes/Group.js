const Quaternion = require('../math/Vec3');
const Vec3 = require('../math/Vec3');

/**
 * Represents a group of shapes within the world. Enables a hierarchy of shapes
 * and bodies. Also enables easy construction and destruction of objects.
 * @constructor
 * @class Group
 * @param {Number} mass
 */
class Group {
  constructor(mass = 0) {
    /**
     * Identifier of the Group.
     * @property {number} id
     */
    this.id = Group.idCounter++;

    /**
     * @property children
     * @type {Set}
     */
    this.children = new Set();

    /**
     * @property {Body|Group} parent
     */
    this.parent = null;

    /**
     * @property {Vec3} position
     */
    this.position = new Vec3();

    /**
     * @property {Quaternion} quaternion
     */
    this.quaternion = new Quaternion();

    /**
     * @property mass
     * @type {Number}
     * @default 0
     */
    // TODO: Make Group mass affect body mass.
    this.mass = mass;

    /**
     * The local bounding sphere radius of this group.
     * @property {Number} boundingSphereRadius
     */
    this.boundingSphereRadius = 0;
  }

  /**
   * Shim to better match Shape.
   * @todo: Remove this.
   */
  get offset() {
    return this.position;
  }

  /**
   * Sets the parent of the group.
   * @param {Body|Group} parent
   * @method setParent
   */
  setParent(parent) {
    if (this.parent) {
      this.parent.remove(this);
    }
    this.parent = parent;
  }

  /**
   * Adds a child shape or group to this group. Only groups and shapes can be
   * children, NOT bodies.
   * @param {Group|Shape} child
   * @method add
   */
  add(child) {
    child.setParent(this);
    this.children.add(child);
  }

  /**
   * Removes a child from the group.
   * @param {Group|Shape} child
   * @method remove
   */
  remove(child) {
    if (this.children.has(child)) {
      this.child.setParent(null);
      this.children.delete(child);
    }
  }

  /**
   * Computes the bounding sphere radius. The result is stored in the property
   * .boundingSphereRadius.
   * @method updateBoundingSphereRadius
   */
  updateBoundingSphereRadius() {
    // @todo: This is the same logic as Body. Try and remove duplicate code.
    const children = [...this.children];
    const N = children.length;
    let radius = 0;

    for (let i = 0; i !== N; i++) {
      const child = children[i];
      child.updateBoundingSphereRadius();
      const offset = child.offset.norm();
      const r = child.boundingSphereRadius;
      if (offset + r > radius) {
        radius = offset + r;
      }
    }

    this.boundingRadius = radius;
  }
}

Group.idCounter = 0;

module.exports = Group;
