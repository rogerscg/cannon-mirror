const AABB = require('../collision/AABB');
const Quaternion = require('../math/Quaternion');
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
     * @property {Vec3} worldPosition
     */
    this.worldPosition = new Vec3();

    /**
     * @property {Quaternion} worldQuaternion
     */
    this.worldQuaternion = new Quaternion();

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

    this.isComponent = true;
    this.isGroup = true;
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
      child.parent = null;
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

    this.boundingSphereRadius = radius;
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

  /**
   * Gets all "components", aka Groups/Bodies, that are children of the group.
   * @method getAllComponents
   * @return {Array}
   */
  getAllComponents() {
    let components = [this];
    this.children.forEach((child) => {
      if (child.isComponent) {
        components.push(child);
        components = comments.concat(child.getAllComponents());
      }
    });
    return components;
  }

  /**
   * Gets all first-level shapes of the group.
   * @method getShapes
   * @return {Array}
   */
  getShapes() {
    return [...this.children].filter((child) => child.isShape);
  }

  /**
   * Calculates the world position and rotation of the group.
   * @method calculateWorldPositionAndRotation
   */
  calculateWorldPositionAndRotation() {
    if (!this.parent) {
      this.worldPosition.copy(this.position);
      this.worldQuaternion.copy(this.quaternion);
      return;
    }
    if (this.parent.isGroup) {
      this.parent.calculateWorldPositionAndRotation();
    }
    this.parent.worldQuaternion.mult(this.quaternion, this.worldQuaternion);
    this.parent.worldQuaternion.vmult(this.position, this.worldPosition);
    this.worldPosition.vadd(this.parent.worldPosition, this.worldPosition);
  }

  /**
   * Calculates the world quaternion and position of the given shape.
   * @method getShapePositionAndRotation
   * @param {Shape} shape
   * @param {Quaternion} targetQuaternion
   * @param {Vec3} targetPosition
   */
  getShapePositionAndRotation(shape, targetQuaternion, targetPosition) {
    this.calculateWorldPositionAndRotation();
    this.worldQuaternion.mult(shape.orientation, targetQuaternion);
    this.worldQuaternion.vmult(shape.offset, targetPosition);
    targetPosition.vadd(this.worldPosition, targetPosition);
  }
}

Group.idCounter = 0;

module.exports = Group;
