export interface Angles {
	/** Radians around the horizontal axis. */
	pitch: number;

	/** Radians around the vertical axis. */
	yaw: number;
}

export interface SpacePoint {
	x: number;
	y: number;
	z: number;
}

/** Turns a point around the origin: first around the vertical axis, then the horizontal. */
export function rotate(
	{ x, y, z }: SpacePoint,
	{ pitch, yaw }: Angles,
): SpacePoint {
	const turnedX = x * Math.cos(yaw) + z * Math.sin(yaw);
	const turnedZ = z * Math.cos(yaw) - x * Math.sin(yaw);

	return {
		x: turnedX,
		y: y * Math.cos(pitch) - turnedZ * Math.sin(pitch),
		z: turnedZ * Math.cos(pitch) + y * Math.sin(pitch),
	};
}

/** Undoes a rotation by the same angles. */
export function unrotate(
	{ x, y, z }: SpacePoint,
	{ pitch, yaw }: Angles,
): SpacePoint {
	const untiltedY = y * Math.cos(pitch) + z * Math.sin(pitch);
	const untiltedZ = z * Math.cos(pitch) - y * Math.sin(pitch);

	return {
		x: x * Math.cos(yaw) - untiltedZ * Math.sin(yaw),
		y: untiltedY,
		z: untiltedZ * Math.cos(yaw) + x * Math.sin(yaw),
	};
}
