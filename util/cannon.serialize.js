/*

Adds two methods to the CANNON.World class: .toJSON and .fromJSON. These methods are not complete but works for simple cases.

Usage:

	Include this script after cannon.js or cannon.min.js:

	<script src="cannon.js"></script>
	<script src="cannon.serialize.js"></script>

	Now you can do this with your CANNON.World instance:

	var obj = world.toJSON();		// Create a serializable object
	var str = JSON.stringify(obj);	// Convert to string

	Or, you can load the serialized scene from the JSON:

	var obj = JSON.parse(str);		// Parse the string into a JSON object
	world.fromJSON(obj);			// Load objects into the world

 */

CANNON.World.prototype.toJSON = function() {
  function v2a(v) {
    return [v.x, v.y, v.z];
  }
  function q2a(q) {
    return [q.x, q.y, q.z, q.w];
  }

  var json = {
    bodies: []
  };
  for (var i = 0; i < this.bodies.length; i++) {
    var body = this.bodies[i];

    var jsonBody = {
      mass: body.mass,
      type: body.type,
      position: [body.position.x, body.position.y, body.position.z],
      quaternion: [
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      ],
      shapes: []
    };

    for (var j = 0; j < body.children.length; j++) {
      var shape = body.children[j];
      var jsonShape = {
        type: shape.type
      };
      switch (shape.type) {
        case CANNON.Shape.types.BOX:
          jsonShape.halfExtents = v2a(shape.halfExtents);
          break;
        case CANNON.Shape.types.SPHERE:
          jsonShape.radius = shape.radius;
          break;
        default:
          console.log('unhandled shape: ' + shape.type);
          continue;
      }
      jsonShape.offset = v2a(shape.offset);
      jsonShape.orientation = q2a(shape.orientation);
      jsonBody.children.push(jsonShape);
    }

    json.bodies.push(jsonBody);
  }
  return json;
};

CANNON.World.prototype.fromJSON = function(json) {
  function a2v(a, v) {
    v = v || new CANNON.Vec3();
    v.x = a[0];
    v.y = a[1];
    v.z = a[2];
    return v;
  }
  function a2q(a, q) {
    q = q || new CANNON.Quaternion();
    q.x = a[0];
    q.y = a[1];
    q.z = a[2];
    q.w = a[3];
    return q;
  }

  for (var i = 0; i < json.bodies.length; i++) {
    var jsonBody = json.bodies[i];
    var body = new CANNON.Body({
      mass: jsonBody.mass,
      type: jsonBody.type,
      position: a2v(jsonBody.position),
      quaternion: a2q(jsonBody.quaternion)
    });

    for (var j = 0; j < jsonBody.children.length; j++) {
      var jsonShape = jsonBody.children[j];
      var shape;
      var offset = a2v(jsonShape.offset);
      var orientation = a2q(jsonBody.orientation);
      switch (jsonShape.type) {
        case CANNON.Shape.types.BOX:
          shape = new CANNON.Box(a2v(jsonShape.halfExtents));
          break;
        case CANNON.Shape.types.SPHERE:
          shape = new CANNON.Sphere(jsonShape.radius);
          break;
      }
      if (shape) {
        body.addShape(shape, offset, orientation);
      }
    }

    this.addBody(body);
  }
};

CANNON.World.prototype.empty = function() {
  while (this.bodies.length) {
    this.remove(this.bodies[0]);
  }
};
