const AABB = require('../collision/AABB');
const Quaternion = require('../math/Vec3');
const Vec3 = require('../math/Vec3');

const tmpAABB = new AABB();
const tmpQuat = new Quaternion();
const tmpVec = new Vec3();

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

    /**
     * World space bounding box of the group and its children.
     * @property aabb
     * @type {AABB}
     */
    this.aabb = new AABB();
  }

  /**
   * Shim to better match Shape.
   * @todo: Remove this.
   */
  get offset() {
    return this.position;
  }

  /**
   * Shim to better match Shape.
   * @todo: Remove this.
   */
  get orientation() {
    return this.quaternion;
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

  /**
   * Computes the bounding box for the shape and stores the result in min and max.
   * @todo Calculate world position and world rotation within group/shape.
   * @param {Vec3} worldPos
   * @param {Quaternion} worldQuat
   * @param {Vec3} min
   * @param {Vec3} max
   */
  calculateWorldAABB(worldPos, worldQuat, min, max) {
    const children = [...this.children];
    const N = children.length;
    const offset = tmpVec;
    const orientation = tmpQuat;
    const aabb = this.aabb;
    const shapeAABB = tmpAABB;

    for (let i = 0; i !== N; i++) {
      const child = children[i];

      // Get child world position
      worldQuat.vmult(child.offset, offset);
      offset.vadd(worldPos, offset);

      // Get child world quaternion
      child.orientation.mult(worldQuat, orientation);

      // Get child AABB
      child.calculateWorldAABB(
        offset,
        orientation,
        shapeAABB.lowerBound,
        shapeAABB.upperBound
      );

      if (i === 0) {
        aabb.copy(shapeAABB);
      } else {
        aabb.extend(shapeAABB);
      }
    }
    min.copy(aabb.lowerBound);
    max.copy(aabb.upperBound);
  }
}

Group.idCounter = 0;

module.exports = Group;
