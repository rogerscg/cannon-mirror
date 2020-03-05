module.exports = Shape;

var Shape = require('./Shape');
var Vec3 = require('../math/Vec3');
var Quaternion = require('../math/Quaternion');
var Material = require('../material/Material');

/**
 * Base class for shapes
 * @class Shape
 * @constructor
 * @param {object} [options]
 * @param {number} [options.collisionFilterGroup=1]
 * @param {number} [options.collisionFilterMask=-1]
 * @param {number} [options.collisionResponse=true]
 * @param {number} [options.material=null]
 * @author schteppe
 */
function Shape(options) {
  options = options || {};

  /**
   * Identifyer of the Shape.
   * @property {number} id
   */
  this.id = Shape.idCounter++;

  /**
   * The type of this shape. Must be set to an int > 0 by subclasses.
   * @property type
   * @type {Number}
   * @see Shape.types
   */
  this.type = options.type || 0;

  /**
   * The local bounding sphere radius of this shape.
   * @property {Number} boundingSphereRadius
   */
  this.boundingSphereRadius = 0;

  /**
   * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
   * @property {boolean} collisionResponse
   */
  this.collisionResponse = options.collisionResponse
    ? options.collisionResponse
    : true;

  /**
   * @property {Number} collisionFilterGroup
   */
  this.collisionFilterGroup =
    options.collisionFilterGroup !== undefined
      ? options.collisionFilterGroup
      : 1;

  /**
   * @property {Number} collisionFilterMask
   */
  this.collisionFilterMask =
    options.collisionFilterMask !== undefined
      ? options.collisionFilterMask
      : -1;

  /**
   * @property {Material} material
   */
  this.material = options.material ? options.material : null;

  /**
   * @property {Vec3} offset
   */
  this.offset = options.offset || new Vec3();

  /**
   * @property {Vec3} orientation
   */
  this.orientation = options.orientation || new Quaternion();

  /**
   * @property {Body|Group} parent
   */
  this.parent = null;

  this.isShape = true;
}
Shape.prototype.constructor = Shape;

/**
 * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
 * @method updateBoundingSphereRadius
 */
Shape.prototype.updateBoundingSphereRadius = function() {
  throw 'computeBoundingSphereRadius() not implemented for shape type ' +
    this.type;
};

/**
 * Computes the bounding box for the shape and stores the result in min and max.
 * @param {Vec3} pos
 * @param {Quaternion} quat
 * @param {Vec3} min
 * @param {Vec3} max
 */
Shape.prototype.calculateWorldAABB = function(pos, quat, min, max) {
  throw 'calculateWorldAABB() not implemented for shape type ' + this.type;
};

/**
 * Get the volume of this shape
 * @method volume
 * @return {Number}
 */
Shape.prototype.volume = function() {
  throw 'volume() not implemented for shape type ' + this.type;
};

/**
 * Calculates the inertia in the local frame for this shape.
 * @method calculateLocalInertia
 * @param {Number} mass
 * @param {Vec3} target
 * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
 */
Shape.prototype.calculateLocalInertia = function(mass, target) {
  throw 'calculateLocalInertia() not implemented for shape type ' + this.type;
};

/**
 * Sets the parent of the shape.
 * @param {Body|Group} parent
 * @method setParent
 */
Shape.prototype.setParent = function(parent) {
  this.parent = parent;
};

Shape.idCounter = 0;

/**
 * The available shape types.
 * @static
 * @property types
 * @type {Object}
 */
Shape.types = {
  SPHERE: 1,
  PLANE: 2,
  BOX: 4,
  COMPOUND: 8,
  CONVEXPOLYHEDRON: 16,
  HEIGHTFIELD: 32,
  PARTICLE: 64,
  CYLINDER: 128,
  TRIMESH: 256
};
